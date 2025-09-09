const nodemailer = require('nodemailer');
const Post = require('../models/Post');
const User = require('../models/User');
const ContactRequest = require('../models/ContactRequest');

function buildTransporterFromEnv() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

exports.sendContactMessage = async (req, res) => {
  try {
    console.log('Contact request received:', { postId: req.body.postId, name: req.body.name, email: req.body.email });
    
    const { postId, name, email, phone, message } = req.body;
    if (!postId || !name || !email || !message) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'postId, name, email, and message are required' });
    }

    const post = await Post.findById(postId).populate('userId', 'name email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const owner = post.userId && post.userId.email ? post.userId : null;
    if (!owner) {
      return res.status(400).json({ message: 'Post owner email not available' });
    }

    let transporter = buildTransporterFromEnv();
    const toAddress = owner.email;
    const fromAddress = process.env.MAIL_FROM || 'no-reply@lost-and-found.local';
    
    // Temporarily disable email to prevent server hangs
    const skipEmail = true;

    const mailOptions = {
      from: fromAddress,
      to: toAddress,
      subject: `New contact about: ${post.title}`,
      text: `Hello ${owner.name || 'there'},\n\n` +
        `Someone is reaching out about your ${post.status === 'found' ? 'found' : 'lost'} item posted on the Lost and Found App.\n\n` +
        `Message: ${message}\n\n` +
        `Contact details:\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `${phone ? `Phone: ${phone}\n` : ''}` +
        `\n— Lost & Found App`,
    };

    if (!transporter) {
      // Fallback to Ethereal test account for development
      console.warn('Email transport not configured. Using Ethereal test account.');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    // Add timeout and connection options
    transporter.set('timeout', 10000); // 10 second timeout
    transporter.set('connectionTimeout', 5000); // 5 second connection timeout
    
    // Skip SMTP verification for now to prevent server hangs
    console.log('Skipping SMTP verification to prevent server hangs');

    if (skipEmail) {
      console.log('Skipping email, storing in database directly');
      
      // Store contact request in database directly
      try {
        const contactRequest = new ContactRequest({
          postId,
          postTitle: post.title,
          ownerEmail: toAddress,
          ownerName: owner.name,
          senderName: name,
          senderEmail: email,
          senderPhone: phone,
          message,
          status: 'pending',
          createdAt: new Date()
        });
        
        await contactRequest.save();
        console.log('Contact request saved to database');
        
        return res.json({ 
          message: 'Contact request received! We\'ll notify the post owner manually.', 
          fallback: true 
        });
      } catch (dbError) {
        console.error('Database save failed:', dbError.message);
        return res.status(500).json({ 
          message: 'Contact request received but failed to save. Please try again later.' 
        });
      }
    }

    console.log('Sending email to:', toAddress);
    console.log('From address:', fromAddress);
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPass: !!process.env.SMTP_PASS
    });

    // Try to send email with timeout
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 8000)
    );

    try {
      const info = await Promise.race([emailPromise, timeoutPromise]);
      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      console.log('Email sent successfully:', info.messageId);
      console.log('Email response:', info.response);
      console.log('Email accepted:', info.accepted);
      console.log('Email rejected:', info.rejected);
      
      // Optional: confirmation email to sender (non-blocking)
      setImmediate(async () => {
        try {
          await transporter.sendMail({
            from: fromAddress,
            to: email,
            subject: `We sent your message about: ${post.title}`,
            text: `Hi ${name},\n\nWe forwarded your message to ${owner.name || 'the post owner'}. They may contact you at ${email}${phone ? ` or ${phone}` : ''}.\n\nYour message:\n${message}\n\n— Lost & Found App`,
          });
          console.log('Confirmation email sent to sender');
        } catch (error) {
          console.log('Failed to send confirmation email:', error.message);
        }
      });

      console.log('Contact request completed successfully');
      return res.json({ message: 'Contact request sent to post owner.', previewUrl });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      
      // Fallback: Store contact request in database for manual processing
      try {
        const contactRequest = new ContactRequest({
          postId,
          postTitle: post.title,
          ownerEmail: toAddress,
          ownerName: owner.name,
          senderName: name,
          senderEmail: email,
          senderPhone: phone,
          message,
          status: 'pending',
          createdAt: new Date()
        });
        
        await contactRequest.save();
        console.log('Contact request saved to database as fallback');
        
        return res.json({ 
          message: 'Contact request received! We\'ll notify the post owner manually.', 
          fallback: true 
        });
      } catch (dbError) {
        console.error('Database fallback failed:', dbError.message);
        return res.status(500).json({ 
          message: 'Contact request received but email delivery failed. Please try again later.' 
        });
      }
    }
  } catch (error) {
    console.error('sendContactMessage error:', error);
    return res.status(500).json({ message: 'Failed to send contact message' });
  }
};

// Admin endpoint to view pending contact requests
exports.getPendingContactRequests = async (req, res) => {
  try {
    const pendingRequests = await ContactRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ 
      message: 'Pending contact requests retrieved',
      requests: pendingRequests,
      count: pendingRequests.length
    });
  } catch (error) {
    console.error('Error fetching pending contact requests:', error);
    res.status(500).json({ message: 'Failed to fetch pending contact requests' });
  }
};


