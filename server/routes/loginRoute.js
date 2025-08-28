const bcrypt = require('bcryptjs');
const User = require('../models/User');

const loginRoute = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address"
      });
    }

    // Find admin user
    const admin = await User.findOne({ 
      email: cleanEmail, 
      role: "admin" 
    });

    // Generic error message for security (prevents user enumeration)
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Successful authentication
    res.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again later."
    });
  }
};

module.exports = loginRoute;
