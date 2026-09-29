import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ihdpustgtoblfligdhdl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZHB1c3RndG9ibGZsaWdkaGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzIwNTAsImV4cCI6MjEwNjI0ODA1MH0.B2j8KcKCLT3w68RahlpSWN1IKcA30CXPoxE7yf5jZiY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Trigger Google OAuth sign-in via Supabase.
 * Redirects to Google's official login screen where the user authenticates with their Google password.
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.error('Google OAuth initialization error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected Google OAuth error:', err);
    return { success: false, error: err.message };
  }
}
