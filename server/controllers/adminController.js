const User = require("../models/User");
const bcrypt = require("bcryptjs");

const adminController = {
  // Admin registration
  signup: async (req, res) => {
    try {
      const { name, email, password, secretKey } = req.body;

      // Input validation
      if (!name?.trim() || !email?.trim() || !password || !secretKey) {
        return res.status(400).json({
          success: false,
          error: "All fields are required"
        });
      }

      // Password strength validation
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters long"
        });
      }

      // Secret key validation
      if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({
          success: false,
          error: "Invalid authorization key"
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

      // Check for existing admin
      const existingAdmin = await User.findOne({ email: cleanEmail });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          error: "An admin account with this email already exists"
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new admin
      const newAdmin = new User({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: "admin"
      });

      await newAdmin.save();

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
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: "An account with this email already exists"
        });
      }

      res.status(500).json({
        success: false,
        error: "Registration failed. Please try again later."
      });
    }
  },

  // Admin authentication
  login: async (req, res) => {
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

      // Find admin user
      const admin = await User.findOne({ 
        email: cleanEmail, 
        role: "admin" 
      }).select("+password");

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
  },

  // Get admin profile
  getProfile: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Admin ID is required"
        });
      }

      const admin = await User.findById(id).select("-password");
      
      if (!admin || admin.role !== "admin") {
        return res.status(404).json({
          success: false,
          error: "Admin profile not found"
        });
      }

      res.json({ 
        success: true, 
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          createdAt: admin.createdAt
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to retrieve profile information"
      });
    }
  }
};

module.exports = adminController;
