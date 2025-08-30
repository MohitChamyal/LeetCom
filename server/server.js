const express = require("express");
const cors = require("cors");
const connectDB = require("./database/userDatabase");
const User = require("./models/User");

const loginRoute = require("./routes/loginRoute");
const signupRoute = require("./routes/signupRoute");
const questionsRoute = require("./routes/questionsRoute");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://leetcom-frontend-8zvt0zq95-mohitchamyals-projects.vercel.app/"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Health check route
app.get("/", async (req, res) => {
  res.json({ message: "LeetCom Backend API is running!" });
});

// Admin routes
app.post("/api/admin/signup", signupRoute);
app.post("/api/admin/login", loginRoute);
app.use("/api/questions", questionsRoute);

// Admin profile route
app.get("/api/admin/profile/:id", async (req, res) => {
  try {
    const admin = await User.findById(req.params.id).select("-password");
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// Export for Vercel
module.exports = app;
