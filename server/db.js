const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

let supabase = null;

const getSupabase = () => {
    if (!supabase) {
        supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        });
    }
    return supabase;
};

module.exports = { getSupabase };
