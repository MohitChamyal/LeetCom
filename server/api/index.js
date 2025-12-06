// Simple serverless function for Vercel
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: '*' }));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'LeetCom API Server',
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            health: '/health',
            test: '/api/test',
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

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Test endpoint working',
        env: {
            NODE_ENV: process.env.NODE_ENV,
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseKey: !!process.env.SUPABASE_KEY,
            hasJwtSecret: !!process.env.JWT_SECRET,
            hasAdminSecret: !!process.env.ADMIN_SECRET_KEY
        }
    });
});

// Load routes with error handling
try {
    const authRoutes = require('../routes/auth');
    const questionsRoutes = require('../routes/questions');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', authRoutes);
    app.use('/api/questions', questionsRoutes);
    
    console.log('✅ Routes loaded successfully');
} catch (error) {
    console.error('❌ Route loading error:', error.message);
    console.error(error.stack);
    
    // Fallback routes if main routes fail
    app.post('/api/auth/*', (req, res) => {
        res.status(503).json({ error: 'Auth routes temporarily unavailable', details: error.message });
    });
    app.post('/api/admin/*', (req, res) => {
        res.status(503).json({ error: 'Admin routes temporarily unavailable', details: error.message });
    });
    app.all('/api/questions/*', (req, res) => {
        res.status(503).json({ error: 'Questions routes temporarily unavailable', details: error.message });
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
