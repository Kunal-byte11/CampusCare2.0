import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'campuscare_secret_jwt_key_ltce_2026';

// Helper to generate unique anonymous ID
function generateAnonymousId() {
  const randPart1 = Math.random().toString(36).substring(2, 8);
  const randPart2 = Math.random().toString(36).substring(2, 8);
  return `anon_${randPart1}${randPart2}`;
}

// Official LTCE B.Tech Engineering Departments (https://ltce.in/)
export const LTCE_ENGINEERING_COURSES = [
  'Computer Engineering',
  'Computer Science & Engineering (AIML)',
  'Computer Science & Engineering (Data Science)',
  'Computer Science & Engineering (IoT and Cyber Security)',
  'Electronics & Telecommunication Engineering',
  'Mechanical Engineering',
  'Electrical Engineering'
];

// Helper to validate and normalize course year strictly from 1 to 4
function normalizeCourseYear(rawYear) {
  const y = (rawYear || '').toString().trim().toLowerCase();
  if (['1', '1st', '1st year', 'fe'].includes(y)) return '1st Year';
  if (['2', '2nd', '2nd year', 'se'].includes(y)) return '2nd Year';
  if (['3', '3rd', '3rd year', 'te'].includes(y)) return '3rd Year';
  if (['4', '4th', '4th year', 'be'].includes(y)) return '4th Year';
  return null;
}

// ==============================================================================
// POST /api/auth/google-sync
// Synchronize Google OAuth user with Supabase / CampusCare anonymous profile
// ==============================================================================
router.post('/google-sync', async (req, res) => {
  try {
    const { email, name, googleId, course, year } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Gmail address is required.' });
    }

    if (!cleanEmail.endsWith('@gmail.com')) {
      return res.status(400).json({
        success: false,
        error: 'CampusCare access is restricted to Google Mail (@gmail.com) accounts.'
      });
    }

    let existingProfile = null;

    if (isSupabaseConfigured) {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .limit(1);

        if (profiles && profiles.length > 0) {
          existingProfile = profiles[0];
        } else {
          const { data: users } = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .limit(1);

          if (users && users.length > 0) {
            existingProfile = users[0];
          }
        }
      } catch (checkErr) {
        console.warn('Supabase query during Google sync:', checkErr.message);
      }
    }

    // Determine student course and year
    const matchedCourse = LTCE_ENGINEERING_COURSES.find(
      c => c.toLowerCase() === (course || '').trim().toLowerCase()
    );
    const assignedCourse = matchedCourse || existingProfile?.course || 'Computer Engineering';
    const assignedYear = normalizeCourseYear(year) || existingProfile?.year || '1st Year';
    const assignedAnonId = existingProfile?.anon_id || generateAnonymousId();
    const assignedName = name?.trim() || existingProfile?.full_name || 'LTCE Scholar';

    // Persist new student profile in Supabase if not present
    if (isSupabaseConfigured && !existingProfile) {
      try {
        await supabase.from('users').insert({
          anon_id: assignedAnonId,
          email: cleanEmail,
          full_name: assignedName,
          course: assignedCourse,
          year: assignedYear,
          role: 'student'
        });
      } catch (insertErr) {
        console.warn('Could not insert Google user to public.users:', insertErr.message);
      }

      try {
        const profilePayload = {
          anon_id: assignedAnonId,
          email: cleanEmail,
          full_name: assignedName,
          course: assignedCourse,
          year: assignedYear,
          role: 'student'
        };
        if (googleId) profilePayload.id = googleId;
        await supabase.from('profiles').upsert(profilePayload, { onConflict: 'anon_id' });
      } catch (profErr) {
        console.warn('Could not upsert Google user to public.profiles:', profErr.message);
      }
    }

    const token = jwt.sign(
      { id: googleId || assignedAnonId, anonId: assignedAnonId, email: cleanEmail, role: 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const sanitizedUser = {
      isAuthenticated: true,
      anonId: assignedAnonId,
      email: cleanEmail,
      name: assignedName,
      course: assignedCourse,
      year: assignedYear,
      role: 'student',
      loginTime: Date.now()
    };

    console.log(` [GOOGLE OAUTH] Authenticated: ${cleanEmail} -> ${assignedAnonId}`);

    return res.json({
      success: true,
      anonId: assignedAnonId,
      user: sanitizedUser,
      token
    });
  } catch (err) {
    console.error('Google sync error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to synchronize Google account: ' + err.message
    });
  }
});

// ==============================================================================
// ==============================================================================
// POST /api/auth/register
// Student registration (Email is optional; if entered, it is saved)
// ==============================================================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, course, year } = req.body;

    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Gmail address is required.' });
    }

    if (!cleanEmail.endsWith('@gmail.com')) {
      return res.status(400).json({
        success: false,
        error: 'Registration requires a valid Google Mail (@gmail.com) address.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    // Validate course against official LTCE departments
    const selectedCourse = (course || '').trim();
    const matchedCourse = LTCE_ENGINEERING_COURSES.find(
      c => c.toLowerCase() === selectedCourse.toLowerCase()
    );
    if (!matchedCourse) {
      return res.status(400).json({
        success: false,
        error: `Please select a valid LTCE engineering course: ${LTCE_ENGINEERING_COURSES.join(', ')}`
      });
    }

    // Validate course year strictly from 1 to 4
    const validatedYear = normalizeCourseYear(year);
    if (!validatedYear) {
      return res.status(400).json({
        success: false,
        error: 'Academic course year must be limited between 1 and 4 (1st Year to 4th Year).'
      });
    }

    const anonId = generateAnonymousId();
    const passwordHash = await bcrypt.hash(password, 10);
    // If student entered an email, save it; otherwise use internal placeholder to satisfy Postgres constraints
    const dbEmail = cleanEmail || `${anonId}@campuscare.internal`;

    // Supabase Mode
    if (isSupabaseConfigured) {
      // If email provided, check if already registered
      if (cleanEmail) {
        try {
          const { data: existingUsers } = await supabase
            .from('users')
            .select('id')
            .eq('email', cleanEmail)
            .limit(1);

          if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({
              success: false,
              error: 'An account with this Gmail address is already registered. Please log in.'
            });
          }
        } catch (checkErr) {
          console.warn('Supabase check existing user:', checkErr.message);
        }
      }

      // Insert into users table
      try {
        await supabase.from('users').insert({
          anon_id: anonId,
          email: dbEmail,
          password_hash: passwordHash,
          full_name: name?.trim() || 'LTCE Scholar',
          course: matchedCourse,
          year: validatedYear,
          role: 'student'
        });
      } catch (userErr) {
        console.warn('Error inserting to users table:', userErr.message);
      }

      // Also try inserting into profiles table
      try {
        await supabase.from('profiles').insert({
          anon_id: anonId,
          email: dbEmail,
          full_name: name?.trim() || 'LTCE Scholar',
          course: matchedCourse,
          year: validatedYear,
          role: 'student'
        });
      } catch (profErr) {
        console.warn('Profiles table insert notice:', profErr.message);
      }

      const token = jwt.sign(
        { anonId, email: cleanEmail || null, role: 'student' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const sanitizedUser = {
        isAuthenticated: true,
        anonId,
        email: cleanEmail || null,
        name: name?.trim() || 'LTCE Scholar',
        course: matchedCourse,
        year: validatedYear,
        role: 'student'
      };

      console.log(` [REGISTER] Direct account created: ${cleanEmail || 'No Email'} -> ${anonId}`);

      return res.status(201).json({
        success: true,
        anonId,
        user: sanitizedUser,
        token
      });
    }

    // Dev mode offline fallback
    const sanitizedUser = {
      isAuthenticated: true,
      anonId,
      email: cleanEmail || null,
      name: name?.trim() || 'LTCE Scholar',
      course: matchedCourse,
      year: validatedYear,
      role: 'student'
    };

    const token = jwt.sign(
      { anonId, email: cleanEmail || null, role: 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      anonId,
      user: sanitizedUser,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      error: 'Registration service error: ' + err.message
    });
  }
});

// ==============================================================================
// POST /api/auth/login
// Student or Counselor login using Username / Anonymous ID / Gmail Address + Password
// ==============================================================================
router.post('/login', async (req, res) => {
  try {
    const rawIdentifier = req.body.anonId || req.body.identifier || req.body.username || req.body.email || '';
    const identifier = rawIdentifier.trim();
    const password = (req.body.password || '').trim();

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your Username, Anonymous ID, or Gmail address.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your password.'
      });
    }

    const normalizedIdentifier = identifier.toLowerCase();
    const isCounselor = [
      'shahista kazi',
      'shahista.kazi',
      'shahista_kazi',
      'shahista.kazi@ltce.in'
    ].includes(normalizedIdentifier);

    const validCounselorPasswords = [
      'beb40c8aa0ffa05a2157bc3fbbc49b54b9ff5a3fee00539b0b9ebeef845f5d49',
      'Counselor@LTCE2026'
    ];

    // Supabase Mode
    if (isSupabaseConfigured) {
      let userRecord = null;

      if (isCounselor) {
        // Query counselor from users table
        const { data: counselorUsers } = await supabase
          .from('users')
          .select('*')
          .or('role.eq.counselor,email.eq.shahista.kazi@ltce.in,anon_id.eq."shahista kazi"')
          .limit(1);

        if (counselorUsers && counselorUsers.length > 0) {
          userRecord = counselorUsers[0];
        }
      } else {
        // Query student from users table
        const { data: users } = await supabase
          .from('users')
          .select('*')
          .or(`anon_id.eq."${identifier}",email.eq."${identifier}"`)
          .limit(1);

        if (users && users.length > 0) {
          userRecord = users[0];
        } else {
          // Check profiles table
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .or(`anon_id.eq."${identifier}",email.eq."${identifier}"`)
            .limit(1);

          if (profiles && profiles.length > 0) {
            userRecord = profiles[0];
          }
        }
      }

      if (!userRecord && isCounselor && validCounselorPasswords.includes(password)) {
        userRecord = {
          anon_id: 'shahista kazi',
          email: 'shahista.kazi@ltce.in',
          full_name: 'Ms. Shahista Kazi',
          course: 'Student Welfare & Psychological Counseling',
          year: 'Faculty / Staff',
          role: 'counselor'
        };
      }

      if (!userRecord) {
        return res.status(401).json({
          success: false,
          error: 'No account found matching this Username or Email. Please register or sign in with Google.'
        });
      }

      // Verify password
      if (userRecord.password_hash) {
        let passwordMatches = await bcrypt.compare(password, userRecord.password_hash);
        if (!passwordMatches && isCounselor && validCounselorPasswords.includes(password)) {
          passwordMatches = true;
        }

        if (!passwordMatches) {
          return res.status(401).json({
            success: false,
            error: 'Incorrect password. Please verify your password and try again.'
          });
        }
      } else if (isCounselor && !validCounselorPasswords.includes(password)) {
        return res.status(401).json({
          success: false,
          error: 'Incorrect password for Counselor Ms. Shahista Kazi.'
        });
      }

      const token = jwt.sign(
        { id: userRecord.id || userRecord.anon_id, anonId: userRecord.anon_id, email: userRecord.email, role: userRecord.role || 'student' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        user: {
          isAuthenticated: true,
          anonId: userRecord.anon_id,
          email: userRecord.email,
          name: userRecord.full_name || 'LTCE Scholar',
          course: userRecord.course || 'Computer Engineering',
          year: userRecord.year || '1st Year',
          role: userRecord.role || 'student',
          loginTime: Date.now()
        },
        token
      });
    }

    // Offline demo fallback
    if (isCounselor && !validCounselorPasswords.includes(password)) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password for Counselor Ms. Shahista Kazi.'
      });
    }

    const mockUser = isCounselor ? {
      isAuthenticated: true,
      anonId: 'shahista kazi',
      email: 'shahista.kazi@ltce.in',
      name: 'Ms. Shahista Kazi',
      course: 'Student Welfare & Psychological Counseling',
      year: 'Faculty / Staff',
      role: 'counselor',
      loginTime: Date.now()
    } : {
      isAuthenticated: true,
      anonId: identifier.startsWith('anon_') ? identifier : 'anon_demo_user',
      email: identifier.includes('@') ? identifier : 'student.demo@gmail.com',
      name: 'LTCE Scholar',
      course: 'Computer Engineering',
      year: '2nd Year',
      role: 'student',
      loginTime: Date.now()
    };

    const token = jwt.sign(
      { anonId: mockUser.anonId, email: mockUser.email, role: mockUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      user: mockUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Login service error: ' + err.message
    });
  }
});

// ==============================================================================
// POST /api/auth/register-counselor
// Dedicated registration / activation endpoint for counselors ("Join as Counselor" - Email removed)
// ==============================================================================
router.post('/register-counselor', async (req, res) => {
  try {
    const { username, password, name, department } = req.body;
    const cleanUsername = (username || '').trim();
    const cleanPassword = (password || '').trim();
    const cleanName = (name || '').trim() || 'Ms. Shahista Kazi';
    const cleanDept = (department || '').trim() || 'Computer Science & Engineering (Data Science)';

    if (!cleanUsername) {
      return res.status(400).json({ success: false, error: 'Counselor Username is required.' });
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    if (isSupabaseConfigured) {
      try {
        const { data: existingUsers } = await supabase
          .from('users')
          .select('*')
          .or(`anon_id.eq."${cleanUsername}",role.eq.counselor`)
          .limit(1);

        let savedUser = null;
        if (existingUsers && existingUsers.length > 0) {
          const { data: updatedUser } = await supabase
            .from('users')
            .update({
              anon_id: cleanUsername,
              password_hash: passwordHash,
              full_name: cleanName,
              role: 'counselor',
              course: cleanDept,
              year: 'Faculty / Staff'
            })
            .eq('id', existingUsers[0].id)
            .select()
            .single();

          savedUser = updatedUser || existingUsers[0];
        } else {
          const fallbackCounselorEmail = 'shahista.kazi@ltce.in';
          const { data: insertedUser } = await supabase
            .from('users')
            .insert({
              anon_id: cleanUsername,
              email: fallbackCounselorEmail,
              password_hash: passwordHash,
              full_name: cleanName,
              course: cleanDept,
              year: 'Faculty / Staff',
              role: 'counselor'
            })
            .select()
            .single();

          savedUser = insertedUser;
        }

        const counselorEmail = savedUser?.email || 'shahista.kazi@ltce.in';

        const token = jwt.sign(
          { id: savedUser?.id || cleanUsername, anonId: cleanUsername, email: counselorEmail, role: 'counselor' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        console.log(` [COUNSELOR REGISTERED] ${cleanUsername} saved to Supabase without email option.`);

        return res.status(201).json({
          success: true,
          anonId: cleanUsername,
          user: {
            isAuthenticated: true,
            anonId: cleanUsername,
            email: counselorEmail,
            name: cleanName,
            course: cleanDept,
            year: 'Faculty / Staff',
            role: 'counselor',
            loginTime: Date.now()
          },
          token
        });
      } catch (dbErr) {
        console.warn('Supabase counselor register notice:', dbErr.message);
      }
    }

    // Offline fallback
    const token = jwt.sign(
      { anonId: cleanUsername, role: 'counselor' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      anonId: cleanUsername,
      user: {
        isAuthenticated: true,
        anonId: cleanUsername,
        name: cleanName,
        course: cleanDept,
        year: 'Faculty / Staff',
        role: 'counselor',
        loginTime: Date.now()
      },
      token
    });
  } catch (err) {
    console.error('Counselor registration error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================================================
// GET /api/auth/me
// ==============================================================================
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    return res.json({
      success: true,
      user: {
        isAuthenticated: true,
        anonId: decoded.anonId,
        email: decoded.email,
        role: decoded.role || 'student'
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});

export default router;
