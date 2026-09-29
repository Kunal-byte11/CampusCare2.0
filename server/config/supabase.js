import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let rawUrl = (process.env.SUPABASE_URL || '').trim();
if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}.supabase.co`;
}
const supabaseUrl = rawUrl;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('example.com')
);

// Supabase JavaScript Client (Auth & Tables)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Optional direct PostgreSQL Pool connection to Supabase DB
const { Pool } = pg;
const dbUrl = (process.env.DATABASE_URL || '').trim();
export const pool = (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')))
  ? new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    })
  : null;

export async function checkSupabaseHealth() {
  if (!isSupabaseConfigured) {
    return {
      status: 'pending_configuration',
      message: 'Supabase credentials not configured in server/.env yet. Please set SUPABASE_URL and SUPABASE_ANON_KEY.',
    };
  }

  try {
    // Quick probe check
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // If profiles table doesn't exist yet, probe users or auth
      return {
        status: 'connected',
        note: 'Supabase connected. Run database/supabase_schema.sql in Supabase SQL editor.',
        error: error.message,
      };
    }
    return { status: 'healthy', database: 'supabase_connected' };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}
