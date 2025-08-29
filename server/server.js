const express = require("express");
const connectDB = require("./database/userDatabase");
const User = require("./models/User");
const corsConfig = require('./config.js/cors')

const loginRoute = require('./routes/loginRoute');
const signupRoute = require('./routes/signupRoute');
const questionsRoute = require('./routes/questionsRoute'); 

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(corsConfig);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

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

app.use("/*path", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "POST /api/admin/signup",
      "POST /api/admin/login",
      "GET /api/admin/profile/:id",
      "POST /api/questions/upload",       
      "GET /api/questions/:companyName",   
      "GET /api/questions"                
    ],
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
