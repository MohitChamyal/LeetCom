const { createClient } = require('@supabase/supabase-js');

let supabase = null;
let config = null;

const getSupabase = () => {
    if (!supabase) {
        // Load config safely
        if (!config) {
            try {
                config = require('./config');
            } catch (error) {
                console.error('❌ DB: Config load error:', error.message);
                throw new Error('Configuration not available');
            }
        }
        
        // Validate credentials
        if (!config.SUPABASE_URL || !config.SUPABASE_KEY) {
            throw new Error('Supabase credentials not configured');
        }
        
        try {
            supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                }
            });
            console.log('✅ Supabase client initialized');
        } catch (error) {
            console.error('❌ Supabase client creation failed:', error.message);
            throw error;
        }
    }
    return supabase;
};

module.exports = { getSupabase };
