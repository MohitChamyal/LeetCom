const bcrypt = require('bcryptjs');
const User = require('../models/User');

const signupRoute = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    // Input validation
    if (!name?.trim() || !email?.trim() || !password || !secretKey) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    // Validate input lengths and formats
    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        error: "Name must be between 2 and 50 characters"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long"
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address"
      });
    }

    // Secret key validation
    if (!process.env.ADMIN_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error. Please contact administrator."
      });
    }

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({
        success: false,
        error: "Invalid authorization key"
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists"
      });
    }

    // Hash password with increased security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin user
    const newAdmin = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();

    // Return success response (without sensitive data)
    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });

  } catch (error) {
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists"
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages[0] || "Please check your input data"
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: "Registration failed. Please try again later."
    });
  }
};

module.exports = signupRoute;
