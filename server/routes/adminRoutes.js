const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET: Admin profile by ID
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Admin ID is required"
      });
    }

    // Find admin user
    const admin = await User.findById(id).select("-password");
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found"
      });
    }

    // Verify admin role
    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required."
      });
    }

    // Return admin profile
    res.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    });

  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid admin ID format"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to retrieve admin profile"
    });
  }
});

// PUT: Update admin profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // Validate input
    if (!name?.trim() && !email?.trim()) {
      return res.status(400).json({
        success: false,
        error: "At least one field (name or email) is required"
      });
    }

    // Build update object
    const updateData = {};
    if (name?.trim()) updateData.name = name.trim();
    if (email?.trim()) updateData.email = email.trim().toLowerCase();

    // Email format validation
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid email address"
        });
      }
    }

    // Update admin profile
    const updatedAdmin = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin || updatedAdmin.role !== "admin") {
      return res.status(404).json({
        success: false,
        error: "Admin not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        updatedAt: updatedAdmin.updatedAt
      }
    });

  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Email already exists"
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid admin ID format"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update admin profile"
    });
  }
});

// GET: List all admins (optional)
router.get('/list', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50); // Reasonable limit

    res.json({
      success: true,
      count: admins.length,
      admins: admins.map(admin => ({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve admin list"
    });
  }
});

module.exports = router;
