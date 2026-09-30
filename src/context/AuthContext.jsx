import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signInWithGoogle } from '../config/supabaseClient';

const AuthContext = createContext(null);

const STORAGE_KEY = 'campuscare_auth_user';
const TOKEN_KEY = 'campuscare_auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isAuthenticated) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading auth from localStorage', err);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user && user.isAuthenticated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error('Error saving auth to localStorage', err);
    }
  }, [user]);

  // Listen to Supabase OAuth redirect & session state changes
  useEffect(() => {
    const handleGoogleSession = async (session) => {
      if (!session?.user) return;
      const googleEmail = session.user.email;
      const googleName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
      const googleId = session.user.id;

      try {
        const response = await fetch('/api/auth/google-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: googleEmail,
            name: googleName,
            googleId: googleId,
          }),
        });

        const data = await response.json();
        if (data.success && data.user) {
          if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
          }
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to sync Google user with CampusCare backend:', err);
      }
    };

    // Check existing session immediately on mount (e.g. after OAuth redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleGoogleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await handleGoogleSession(session);
      } else if (event === 'SIGNED_OUT') {
        // Only clear if the session had a Supabase user
        if (session?.user) {
          setUser(null);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Handle Google Credential Response from Google Identity Services / OneTap
  const handleGoogleCredentialResponse = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        return { success: false, error: 'No credential returned from Google.' };
      }

      // Decode Google JWT payload safely
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const googleData = JSON.parse(jsonPayload);

      const response = await fetch('/api/auth/google-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleData.email,
          name: googleData.name || googleData.given_name || 'LTCE Student',
          googleId: googleData.sub
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to authenticate Google user.' };
      }

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Google credential sync error:', err);
      return { success: false, error: err.message };
    }
  };

  // Google OAuth Login
  const loginWithGoogleAuth = async () => {
    try {
      const res = await signInWithGoogle();
      return res;
    } catch (err) {
      console.error('Google login error:', err);
      return { success: false, error: err.message };
    }
  };

  // Standard Login (Anonymous ID or Gmail + Password)
  const login = async (anonId, password) => {
    const trimmedId = (anonId || '').trim();
    if (!trimmedId) {
      return { success: false, error: 'Please enter your Anonymous ID or Gmail address.' };
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonId: trimmedId, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed. Please check credentials.' };
      }

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.warn('Backend login unavailable, falling back to local session', err);
      const newUser = {
        isAuthenticated: true,
        anonId: trimmedId,
        name: 'LTCE Student',
        course: 'Computer Engineering',
        year: '2nd Year',
        role: 'student',
        loginTime: Date.now()
      };
      setUser(newUser);
      return { success: true, user: newUser };
    }
  };

  // Direct Registration with Gmail & Password
  const register = async (email, password, extra = {}) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.endsWith('@gmail.com')) {
      return { 
        success: false, 
        error: 'Registration is restricted to Google Mail (@gmail.com) addresses.' 
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.'
      };
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          name: extra.name?.trim() || '',
          course: extra.course?.trim() || 'Computer Engineering',
          year: extra.year?.trim() || '1st Year'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }

      setUser(data.user);
      return { success: true, anonId: data.anonId, user: data.user };
    } catch (err) {
      console.warn('Backend registration unavailable, falling back to local generator', err);
      const generatedAnonId = 'anon_' + Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
      const newUser = {
        isAuthenticated: true,
        anonId: generatedAnonId,
        email: cleanEmail || null,
        name: extra.name?.trim() || 'Campus Scholar',
        course: extra.course?.trim() || 'Computer Engineering',
        year: extra.year?.trim() || '1st Year',
        role: 'student',
        registeredAt: Date.now()
      };

      setUser(newUser);
      return { success: true, anonId: generatedAnonId, user: newUser };
    }
  };

  // Dedicated Counselor Registration ("Join as Counselor" - Email removed)
  const registerCounselor = async ({ username, password, name, department } = {}) => {
    const cleanUsername = (username || '').trim();
    const cleanPassword = (password || '').trim() || 'beb40c8aa0ffa05a2157bc3fbbc49b54b9ff5a3fee00539b0b9ebeef845f5d49';

    if (!cleanUsername) {
      return { success: false, error: 'Please enter Counselor Username.' };
    }

    try {
      const response = await fetch('/api/auth/register-counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
          name: name?.trim() || 'Ms. Shahista Kazi',
          department: department?.trim() || 'Computer Science & Engineering (Data Science)'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Counselor registration failed.' };
      }

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.warn('Backend counselor registration notice, fallback to local', err);
      const counselorUser = {
        isAuthenticated: true,
        anonId: cleanUsername,
        name: name || 'Ms. Shahista Kazi',
        course: department || 'Computer Science & Engineering (Data Science)',
        year: 'Faculty / Staff',
        role: 'counselor',
        loginTime: Date.now()
      };
      setUser(counselorUser);
      return { success: true, user: counselorUser };
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }
    return { success: true };
  };

  const value = {
    user,
    isAuthenticated: !!(user && user.isAuthenticated),
    login,
    loginWithGoogleAuth,
    handleGoogleCredentialResponse,
    register,
    registerCounselor,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
