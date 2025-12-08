// Simple serverless function for Vercel
const express = require('express');
const cors = require('cors');
const { injectSpeedInsights } = require('@vercel/speed-insights');

const app = express();

// Inject Vercel Speed Insights
injectSpeedInsights();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://leet-com.vercel.app',
            'https://leetcom-frontend.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(null, true); // Allow all for now to debug
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Additional CORS headers for preflight
app.options('*', cors(corsOptions));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'LeetCom API Server',
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestPath: req.path,
        requestUrl: req.url,
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
        
        console.log('Testing Supabase connection...');
        
        // Test 1: Try to select from users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
        
        // Test 2: Try to select from questions
        const { data: qData, error: qError } = await supabase
            .from('questions')
            .select('id')
            .limit(1);
        
        // Test 3: Try to count users
        const { count: userCount, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
        
        // Test 4: Try to count questions
        const { count: qCount, error: qCountError } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true });
        
        const response = {
            success: !userError && !qError,
            timestamp: new Date().toISOString(),
            supabaseUrl: process.env.SUPABASE_URL,
            hasKey: !!process.env.SUPABASE_KEY,
            keyPrefix: process.env.SUPABASE_KEY?.substring(0, 20) + '...',
            tests: {
                usersSelect: {
                    success: !userError,
                    error: userError ? {
                        message: userError.message,
                        code: userError.code,
                        hint: userError.hint,
                        details: userError.details
                    } : null,
                    dataReceived: !!userData && userData.length > 0
                },
                questionsSelect: {
                    success: !qError,
                    error: qError ? {
                        message: qError.message,
                        code: qError.code,
                        hint: qError.hint,
                        details: qError.details
                    } : null,
                    dataReceived: !!qData && qData.length > 0
                },
                usersCount: {
                    success: !countError,
                    count: userCount || 0,
                    error: countError ? countError.message : null
                },
                questionsCount: {
                    success: !qCountError,
                    count: qCount || 0,
                    error: qCountError ? qCountError.message : null
                }
            }
        };
        
        res.json(response);
    } catch (error) {
        console.error('Test-db error:', error);
        res.status(500).json({
            success: false,
            message: 'Test failed',
            error: error.message,
            stack: error.stack?.split('\n').slice(0, 5)
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
