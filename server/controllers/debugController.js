const User = require("../models/User");
const bcrypt = require("bcryptjs");

const debugController = {
  // System status check (limited info in production)
  getSystemStatus: (req, res) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      return res.json({
        environment: process.env.NODE_ENV,
        database: process.env.MONGODB_URL ? "Connected" : "Disconnected",
        port: process.env.PORT || 5000,
        timestamp: new Date().toISOString()
      });
    }
    
    // Limited info in production
    res.json({
      status: "OK",
      environment: "production",
      timestamp: new Date().toISOString()
    });
  },

  // Health check endpoint
  healthCheck: async (req, res) => {
    try {
      // Basic database connectivity test
      await User.findOne().limit(1);
      
      res.json({
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString()
      });
    }
  },

  // User lookup (development only)
  checkUserExists: async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        error: "This endpoint is only available in development mode"
      });
    }

    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email parameter is required"
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = await User.findOne({ email: cleanEmail }).select('email role createdAt');

      res.json({
        success: true,
        exists: !!user,
        userInfo: user ? {
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        } : null
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to check user existence"
      });
    }
  },

  // Database statistics (development only)
  getDatabaseStats: async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        error: "This endpoint is only available in development mode"
      });
    }

    try {
      const totalUsers = await User.countDocuments();
      const adminCount = await User.countDocuments({ role: 'admin' });
      const regularUsers = totalUsers - adminCount;

      res.json({
        success: true,
        statistics: {
          totalUsers,
          adminUsers: adminCount,
          regularUsers,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to retrieve database statistics"
      });
    }
  }
};

module.exports = debugController;
