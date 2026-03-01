import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    console.error("Missing SUPABASE_URL in environment.");
}

if (supabaseServiceKey) {
    console.log("Using Supabase Service Role Key (RLS Bypassed)");
} else if (supabaseAnonKey) {
    console.log("Using Supabase Anon Key (RLS Enabled)");
} else {
    console.error("Missing Supabase API Keys in environment.");
}

// Prefer Service Role Key for backend operations to bypass RLS
export const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

