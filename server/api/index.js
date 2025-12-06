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

// Test Supabase connection
app.get('/api/test-db', async (req, res) => {
    try {
        const { getSupabase } = require('../db');
        const supabase = getSupabase();
        
        // Test connection by trying to count users
        const { data, error, count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            return res.json({
                success: false,
                message: 'Supabase connection failed',
                error: error.message,
                hint: error.hint,
                details: error.details,
                code: error.code
            });
        }
        
        // Test questions table
        const { data: qData, error: qError, count: qCount } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true });
        
        res.json({
            success: true,
            message: 'Supabase connection working',
            tables: {
                users: {
                    exists: !error,
                    count: count || 0
                },
                questions: {
                    exists: !qError,
                    count: qCount || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Test failed',
            error: error.message,
            stack: error.stack.split('\n').slice(0, 3)
        });
    }
});

// Load routes with error handling
let routesLoaded = false;
let routeError = null;

try {
    console.log('🔄 Loading routes...');
    
    const authRoutes = require('../routes/auth');
    const questionsRoutes = require('../routes/questions');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', authRoutes);
    app.use('/api/questions', questionsRoutes);
    
    routesLoaded = true;
    console.log('✅ Routes loaded successfully');
} catch (error) {
    routeError = error;
    console.error('❌ Route loading error:', error.message);
    console.error('Stack:', error.stack);
    
    // Provide diagnostic endpoint
    app.get('/api/diagnostic', (req, res) => {
        res.json({
            routesLoaded: false,
            error: {
                message: error.message,
                stack: error.stack.split('\n').slice(0, 5)
            },
            env: {
                NODE_ENV: process.env.NODE_ENV,
                hasSupabaseUrl: !!process.env.SUPABASE_URL,
                hasSupabaseKey: !!process.env.SUPABASE_KEY,
                hasJwtSecret: !!process.env.JWT_SECRET,
                hasAdminSecret: !!process.env.ADMIN_SECRET_KEY
            }
        });
    });
    
    // Fallback routes if main routes fail
    app.all('/api/auth/*', (req, res) => {
        res.status(503).json({ 
            error: 'Auth routes unavailable', 
            reason: error.message,
            hint: 'Check /api/diagnostic for details'
        });
    });
    app.all('/api/admin/*', (req, res) => {
        res.status(503).json({ 
            error: 'Admin routes unavailable', 
            reason: error.message,
            hint: 'Check /api/diagnostic for details'
        });
    });
    app.all('/api/questions/*', (req, res) => {
        res.status(503).json({ 
            error: 'Questions routes unavailable', 
            reason: error.message,
            hint: 'Check /api/diagnostic for details'
        });
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
