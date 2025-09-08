const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'fallback-secret-key-for-development', // Store your secret key in environment variables
    { expiresIn: '1d' } // Token valid for 1 day
  );
};


exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    // Allow any email domain for broader compatibility
    // if (!email.endsWith('@uwaterloo.ca')) {
    //   return res.status(400).json({ message: 'Email must be a @uwaterloo.ca address' });
    // }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();


    const token = generateToken(user);

    res.status(201).json({ token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }


    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }


    const token = generateToken(user);

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
