const { createClient } = require('@supabase/supabase-js');

let supabase; // don’t create immediately

async function getSupabase() {
    if (!supabase) {
        const url = process.env.SUPABASE_URL || "http://mock-url";
        const key = process.env.SUPABASE_KEY || "mock-key";

        supabase = createClient(url, key);
    }
    return supabase;
}

module.exports = { getSupabase };
