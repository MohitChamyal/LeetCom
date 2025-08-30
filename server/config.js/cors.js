const cors = require('cors');

const corsConfig = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://leetcom-ngb3xqw1o-mohitchamyals-projects.vercel.app"] 
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

module.exports = corsConfig;
