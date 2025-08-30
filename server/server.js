const express = require("express");
const connectDB = require("./database/userDatabase");
const User = require("./models/User");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const loginRoute = require("./routes/loginRoute");
const signupRoute = require("./routes/signupRoute");
const questionsRoute = require("./routes/questionsRoute");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.VITE_FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Admin routes
app.post("/api/admin/signup", signupRoute);
app.post("/api/admin/login", loginRoute);
app.use("/api/questions", questionsRoute);

// Admin profile route
app.get("/", async (req, res) => {
  res.json({
    status: "ok",
    message: "LeetCom API is running",
    version: "1.0.0"
  });
});
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

// Start the server regardless of environment
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
