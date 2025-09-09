const nodemailer = require('nodemailer');
const Post = require('../models/Post');
const User = require('../models/User');

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

    console.log('Sending email to:', toAddress);
    console.log('From address:', fromAddress);

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    console.log('Email sent successfully:', info.messageId);
    
    // Optional: confirmation email to sender
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

    console.log('Contact request completed successfully');
    return res.json({ message: 'Contact request sent to post owner.', previewUrl });
  } catch (error) {
    console.error('sendContactMessage error:', error);
    return res.status(500).json({ message: 'Failed to send contact message' });
  }
};


