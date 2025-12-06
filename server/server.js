require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Load config with error handling
let config;
try {
    config = require('./config');
    console.log('✅ Config loaded');
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

// Simple CORS for debugging
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Root endpoint - MUST come before routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'LeetCom API Server',
        status: 'OK', 
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: config.NODE_ENV,
            hasSupabaseUrl: !!config.SUPABASE_URL,
            hasSupabaseKey: !!config.SUPABASE_KEY,
            hasJwtSecret: !!config.JWT_SECRET
        },
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
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Load routes with error handling
try {
    const authRoutes = require('./routes/auth');
    const questionsRoutes = require('./routes/questions');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', authRoutes);
    app.use('/api/questions', questionsRoutes);
    
    console.log('✅ Routes loaded');
} catch (error) {
    console.error('❌ Route loading error:', error.message);
    console.error(error.stack);
}

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
