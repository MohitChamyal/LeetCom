require('dotenv').config();

const config = {
    PORT: process.env.PORT || 5000,
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_KEY: process.env.SUPABASE_KEY || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : ['http://localhost:5173'],
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || 'default-admin-key'
};

// Validate required environment variables
const requiredEnvs = ['SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET', 'ADMIN_SECRET_KEY'];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

if (missingEnvs.length > 0) {
    console.error('⚠️  Missing environment variables:', missingEnvs.join(', '));
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ Please set these in your Vercel environment variables!');
    }
}

module.exports = config;
