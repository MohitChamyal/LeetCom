const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

let supabase = null;
let connectionTested = false;

const connectDB = async () => {
    try {
        if (!supabase) {
            // Create Supabase client (doesn't make network request yet)
            supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                }
            });
            console.log('📡 Supabase client initialized');
        }
        return supabase;
    } catch (error) {
        console.error('❌ Error creating Supabase client:', error.message);
        throw error;
    }
};

const getSupabase = () => {
    if (!supabase) {
        // Lazy initialization
        supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        });
    }
    
    // Test connection on first actual use
    if (!connectionTested) {
        connectionTested = true;
        supabase.from('users').select('count').limit(1).then(({ error }) => {
            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('⚠️  Tables not found. Run schema.sql in Supabase SQL Editor');
                } else {
                    console.warn('⚠️  Connection check:', error.message);
                }
            } else {
                console.log('✅ Supabase connected successfully');
            }
        }).catch(err => {
            console.warn('⚠️  Connection test skipped:', err.message);
        });
    }
    
    return supabase;
};

module.exports = { connectDB, getSupabase };
