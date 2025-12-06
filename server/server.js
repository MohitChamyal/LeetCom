require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Load config with error handling
let config;
try {
    config = require('./config');
} catch (error) {
    console.error('❌ Config error:', error.message);
    config = {
        PORT: 5000,
        NODE_ENV: 'production',
        CORS_ORIGIN: ['*']
    };
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (config.CORS_ORIGIN.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/auth')); // Frontend calls /api/admin
app.use('/api/questions', require('./routes/questions'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'LeetCom API Server',
        status: 'OK', 
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            admin: '/api/admin',
            questions: '/api/questions'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = config.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 Environment: ${config.NODE_ENV}`);
        console.log(`🔗 Supabase: Connected`);
        console.log(`✅ Server is ready`);
    });
}

// Export for Vercel serverless
module.exports = app;
