require('dotenv').config();

const config = {
    PORT: process.env.PORT || 5000,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
    JWT_SECRET: process.env.JWT_SECRET,
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY
};

// Validate required environment variables
const requiredEnvs = ['SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET', 'ADMIN_SECRET_KEY'];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

if (missingEnvs.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missingEnvs.join(', ')}`);
}

module.exports = config;
