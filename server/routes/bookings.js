import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

// Fixed Counselor Credentials
export const COUNSELOR_CREDENTIALS = {
  username: 'shahista kazi',
  altUsernames: ['shahista kazi', 'shahista.kazi', 'shahista_kazi'],
  email: 'shahista.kazi@ltce.in',
  rawPassword: 'beb40c8aa0ffa05a2157bc3fbbc49b54b9ff5a3fee00539b0b9ebeef845f5d49',
  name: 'Ms. Shahista Kazi',
  role: 'counselor',
  course: 'Computer Science & Engineering (Data Science)',
  year: 'Faculty / Staff'
};

// In-memory appointments fallback store
let fallbackAppointments = [
  {
    id: 101,
    student_anon_id: 'anon_demo123456789',
    student_name: 'Aarav Sharma',
    student_email: 'student.demo@gmail.com',
    student_course: 'Computer Science & Engineering (Data Science)',
    student_year: '2nd Year',
    counselor_name: 'Ms. Shahista Kazi',
    slot_time: 'Today at 2:00 PM',
    status: 'confirmed',
    session_notes: 'Initial intake consultation. Discussed semester examination stress and coping mechanisms.',
    booking_date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 102,
    student_anon_id: 'anon_sunkzbpsns4b',
    student_name: 'Shivam Mourya',
    student_email: 'mouryashiv15@gmail.com',
    student_course: 'Computer Science & Engineering (Data Science)',
    student_year: '3rd Year',
    counselor_name: 'Ms. Shahista Kazi',
    slot_time: 'Tomorrow at 11:00 AM',
    status: 'confirmed',
    session_notes: 'Follow-up session regarding balancing engineering project deadlines with personal well-being.',
    booking_date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

// Auto-seed Counselor account into Supabase on startup
export async function seedCounselorAccount() {
  if (!isSupabaseConfigured) return;

  try {
    const passwordHash = await bcrypt.hash(COUNSELOR_CREDENTIALS.rawPassword, 10);

    // Check if counselor exists by any of the usernames or email
    const { data: existingUsers, error: checkErr } = await supabase
      .from('users')
      .select('id, email, anon_id')
      .or(`anon_id.eq."shahista kazi",anon_id.eq."shahista.kazi",email.eq.${COUNSELOR_CREDENTIALS.email}`)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      // Update role, course, and password
      await supabase
        .from('users')
        .update({
          anon_id: COUNSELOR_CREDENTIALS.username,
          password_hash: passwordHash,
          role: 'counselor',
          full_name: COUNSELOR_CREDENTIALS.name,
          course: COUNSELOR_CREDENTIALS.course
        })
        .eq('id', existingUsers[0].id);
      console.log(' [COUNSELOR] Ms. Shahista Kazi account verified in Supabase (Course: Data Science).');
    } else {
      // Insert new counselor
      const { error: insertErr } = await supabase.from('users').insert({
        anon_id: COUNSELOR_CREDENTIALS.username,
        email: COUNSELOR_CREDENTIALS.email,
        password_hash: passwordHash,
        full_name: COUNSELOR_CREDENTIALS.name,
        course: COUNSELOR_CREDENTIALS.course,
        year: COUNSELOR_CREDENTIALS.year,
        role: 'counselor'
      });

      if (!insertErr) {
        console.log(' [COUNSELOR] Ms. Shahista Kazi account successfully seeded into Supabase.');
      } else {
        console.warn(' Notice seeding counselor into public.users:', insertErr.message);
      }
    }
  } catch (err) {
    console.warn(' Counselor auto-seed notice:', err.message);
  }
}

// Counselor Profile In-Memory / Hybrid Store
let counselorProfileData = {
  name: 'Ms. Shahista Kazi',
  designation: 'Student Counselor & Wellness Officer',
  department: 'Computer Science & Engineering (Data Science)',
  institution: 'Lokmanya Tilak College of Engineering (LTCE)',
  campusLocation: 'Koparkhairane, Navi Mumbai',
  room: '',
  email: 'shahista.kazi@ltce.in',
  phone: '',
  workingHours: '',
  languages: 'English, Hindi, Marathi',
  bio: '',
  photo: '',
  qualifications: [],
  specializations: []
};

// GET /api/bookings/counselor - Return active counselor info
router.get('/counselor', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data: counselors } = await supabase
        .from('users')
        .select('id, full_name, email, course, role')
        .eq('role', 'counselor')
        .limit(1);

      if (counselors && counselors.length > 0) {
        return res.json({
          success: true,
          counselor: {
            ...counselorProfileData,
            name: counselors[0].full_name || counselorProfileData.name,
            department: counselors[0].course || counselorProfileData.department,
            email: counselors[0].email || counselorProfileData.email,
            role: 'counselor'
          }
        });
      }
    }

    return res.json({
      success: true,
      counselor: {
        ...counselorProfileData,
        name: COUNSELOR_CREDENTIALS.name,
        department: COUNSELOR_CREDENTIALS.course,
        email: COUNSELOR_CREDENTIALS.email,
        role: 'counselor'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bookings/counselor - Counselor updates her own profile data
router.put('/counselor', async (req, res) => {
  try {
    const update = req.body || {};
    counselorProfileData = {
      ...counselorProfileData,
      ...update
    };

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('users')
          .update({
            full_name: counselorProfileData.name,
            course: counselorProfileData.department,
            updated_at: new Date().toISOString()
          })
          .eq('role', 'counselor');
      } catch (dbErr) {
        // continue with memory update
      }
    }

    return res.json({
      success: true,
      message: 'Counselor profile updated successfully',
      counselor: counselorProfileData
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bookings - Student books a session
router.post('/', async (req, res) => {
  try {
    const { 
      studentAnonId, 
      studentName, 
      studentEmail, 
      studentCourse, 
      studentYear, 
      slotTime, 
      counselorName 
    } = req.body;

    if (!studentAnonId || !slotTime) {
      return res.status(400).json({ success: false, error: 'Student ID and Slot time are required.' });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const newRecord = {
      student_anon_id: studentAnonId,
      student_name: studentName?.trim() || 'Anonymous Student',
      student_email: studentEmail?.trim() || '',
      student_course: studentCourse?.trim() || 'Computer Engineering',
      student_year: studentYear?.trim() || '1st Year',
      counselor_name: counselorName || 'Ms. Shahista Kazi',
      slot_time: slotTime,
      status: 'confirmed',
      session_notes: '',
      booking_date: todayDate,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert(newRecord)
          .select()
          .single();

        if (!error && data) {
          return res.status(201).json({ success: true, appointment: data });
        }
      } catch (dbErr) {
        console.warn('Falling back to local appointment store:', dbErr.message);
      }
    }

    // Fallback store
    const fallbackItem = { id: Date.now(), ...newRecord };
    fallbackAppointments.unshift(fallbackItem);

    return res.status(201).json({ success: true, appointment: fallbackItem });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ success: false, error: 'Failed to record booking: ' + err.message });
  }
});

// GET /api/bookings - Counselor views all booked sessions
router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return res.json({ success: true, appointments: data });
        }
      } catch (dbErr) {
        console.warn('Supabase appointments fetch:', dbErr.message);
      }
    }

    return res.json({ success: true, appointments: fallbackAppointments });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bookings/stats - Counselor dashboard metrics
router.get('/stats', async (req, res) => {
  try {
    let allAppointments = fallbackAppointments;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('appointments').select('*');
        if (!error && data) {
          allAppointments = data;
        }
      } catch (dbErr) {
        // use fallback
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // 1. Number of students booked appointment today
    const todayBookings = allAppointments.filter(a => {
      const bDate = a.booking_date || (a.created_at ? a.created_at.split('T')[0] : '');
      return bDate === todayStr;
    }).length;

    // 2. Monthly sessions done (status = 'completed')
    const monthlyCompleted = allAppointments.filter(a => {
      if (a.status !== 'completed') return false;
      const d = new Date(a.created_at || a.booking_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    // 3. Total unique students connected to counselor
    const uniqueStudents = new Set(allAppointments.map(a => a.student_anon_id)).size;

    // 4. Active upcoming appointments
    const activeSessions = allAppointments.filter(a => a.status === 'confirmed').length;

    return res.json({
      success: true,
      stats: {
        todayBookings,
        monthlyCompleted,
        totalStudentsConnected: uniqueStudents,
        activeSessions,
        totalBookings: allAppointments.length
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bookings/my-sessions - Student views their own bookings & counseling log
router.get('/my-sessions', async (req, res) => {
  try {
    const studentAnonId = (req.query.studentAnonId || req.query.anonId || '').trim();
    const studentEmail = (req.query.studentEmail || req.query.email || '').toLowerCase().trim();

    let list = fallbackAppointments;

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('appointments').select('*').order('created_at', { ascending: false });
        if (studentAnonId && studentEmail) {
          query = query.or(`student_anon_id.eq."${studentAnonId}",student_email.eq."${studentEmail}"`);
        } else if (studentAnonId) {
          query = query.eq('student_anon_id', studentAnonId);
        } else if (studentEmail) {
          query = query.eq('student_email', studentEmail);
        }
        const { data, error } = await query;
        if (!error && data) {
          list = data;
        }
      } catch (dbErr) {
        console.warn('Supabase my-sessions fetch error:', dbErr.message);
      }
    }

    if (studentAnonId || studentEmail) {
      list = list.filter(a => {
        const matchId = studentAnonId && a.student_anon_id === studentAnonId;
        const matchEmail = studentEmail && (a.student_email || '').toLowerCase() === studentEmail;
        return matchId || matchEmail;
      });
    }

    const totalSessions = list.length;
    const completedSessions = list.filter(a => (a.status || '').toLowerCase() === 'completed').length;
    const activeSessions = list.filter(a => (a.status || '').toLowerCase() === 'confirmed').length;
    const cancelledSessions = list.filter(a => (a.status || '').toLowerCase() === 'cancelled').length;

    // Counselor clinical session notes are strictly confidential and NOT shared with students
    const studentSafeList = list.map(a => {
      const { session_notes, ...safeItem } = a;
      return safeItem;
    });

    return res.json({
      success: true,
      stats: {
        totalSessions,
        completedSessions,
        activeSessions,
        cancelledSessions
      },
      appointments: studentSafeList
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/bookings/:id/cancel - Student cancels their appointment
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          return res.json({ success: true, id, status: 'cancelled' });
        }
      } catch (dbErr) {
        console.warn('Supabase cancel update fallback:', dbErr.message);
      }
    }

    const item = fallbackAppointments.find(a => a.id.toString() === id.toString());
    if (item) {
      item.status = 'cancelled';
      item.updated_at = new Date().toISOString();
    }

    return res.json({ success: true, id, status: 'cancelled' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/bookings/:id/status - Update session status (e.g. 'completed', 'cancelled')
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          return res.json({ success: true, id, status });
        }
      } catch (dbErr) {
        console.warn('Supabase status update fallback:', dbErr.message);
      }
    }

    // Fallback store
    const item = fallbackAppointments.find(a => a.id.toString() === id.toString());
    if (item) {
      item.status = status;
      item.updated_at = new Date().toISOString();
    }

    return res.json({ success: true, id, status });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/bookings/:id/notes - Save session clinical/counseling notes
router.patch('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionNotes } = req.body;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ session_notes: sessionNotes || '', updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          return res.json({ success: true, id, sessionNotes });
        }
      } catch (dbErr) {
        console.warn('Supabase notes update fallback:', dbErr.message);
      }
    }

    // Fallback store
    const item = fallbackAppointments.find(a => a.id.toString() === id.toString());
    if (item) {
      item.session_notes = sessionNotes || '';
      item.updated_at = new Date().toISOString();
    }

    return res.json({ success: true, id, sessionNotes });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================================================
// CLINICAL NOTE FILES & FOLDERS (Folder system for counselor notes)
// ==============================================================================

let clinicalNoteFiles = [
  {
    id: 'note_101',
    student_anon_id: 'anon_demo123456789',
    student_name: 'Aarav Sharma',
    student_course: 'Computer Science & Engineering (Data Science)',
    student_year: '2nd Year',
    student_email: 'student.demo@gmail.com',
    file_name: 'Intake_Assessment_2026-09-20.note',
    title: 'Initial Psychological Intake & Stress Assessment',
    session_date: '2026-09-20',
    session_time: '02:00 PM',
    category: 'Intake Consultation',
    severity: 'Requires Follow-up',
    clinical_observations: 'Student reports heightened somatic anxiety symptoms prior to laboratory exams. Experiencing mild sleep disruption. Cognitive appraisal shows catastrophizing patterns regarding semester grading.',
    action_plan: '1. Recommended 4-7-8 diaphragmatic breathing before study periods.\n2. Introduced Pomodoro-style 25-minute study intervals.\n3. Scheduled bi-weekly progress check-in.',
    created_at: '2026-09-20T14:00:00.000Z',
    updated_at: '2026-09-20T14:45:00.000Z'
  },
  {
    id: 'note_102',
    student_anon_id: 'anon_demo123456789',
    student_name: 'Aarav Sharma',
    student_course: 'Computer Science & Engineering (Data Science)',
    student_year: '2nd Year',
    student_email: 'student.demo@gmail.com',
    file_name: 'Followup_Exam_Preparation.note',
    title: 'Academic Coping & Time Blocking Progress',
    session_date: '2026-09-21',
    session_time: '02:30 PM',
    category: 'Academic Stress',
    severity: 'Normal',
    clinical_observations: 'Student utilized the breathing exercises during practical assignments. Self-reported anxiety dropped from 8/10 to 4/10. Sleep rhythm stabilizing.',
    action_plan: 'Continue time-blocking routine. Prepare questions for faculty mentoring session.',
    created_at: '2026-09-21T14:30:00.000Z',
    updated_at: '2026-09-21T15:00:00.000Z'
  },
  {
    id: 'note_201',
    student_anon_id: 'anon_sunkzbpsns4b',
    student_name: 'Shivam Mourya',
    student_course: 'Computer Science & Engineering (Data Science)',
    student_year: '3rd Year',
    student_email: 'mouryashiv15@gmail.com',
    file_name: 'Project_Burnout_Assessment.note',
    title: 'Balancing Engineering Project Lead Responsibilities',
    session_date: '2026-09-21',
    session_time: '11:00 AM',
    category: 'Career & Burnout',
    severity: 'Normal',
    clinical_observations: 'Student managing heavy development sprint workload as project team lead. Felt reluctant to delegate tasks. Discussed peer leadership boundaries and self-care.',
    action_plan: 'Task delegation matrix created. Set firm screen-off hour at 11:30 PM.',
    created_at: '2026-09-21T11:00:00.000Z',
    updated_at: '2026-09-21T11:40:00.000Z'
  },
  {
    id: 'note_301',
    student_anon_id: 'anon_bnpxfc4m8nsy',
    student_name: 'Priya Patel',
    student_course: 'Computer Science & Engineering (AIML)',
    student_year: '2nd Year',
    student_email: 'priya.google.auth@gmail.com',
    file_name: 'Hostel_Adjustment_Support.note',
    title: 'Campus & Hostel Social Adjustment Check-in',
    session_date: '2026-09-18',
    session_time: '03:00 PM',
    category: 'Emotional Well-being',
    severity: 'Resolved',
    clinical_observations: 'Transitioning from hometown to Navi Mumbai campus. Experiencing initial homesickness. Student is reflective and open to peer group participation.',
    action_plan: 'Connected with LTCE student welfare peer circles. Scheduled optional follow-up in 2 weeks.',
    created_at: '2026-09-18T15:00:00.000Z',
    updated_at: '2026-09-18T15:30:00.000Z'
  }
];

// GET /api/bookings/notes - Fetch all clinical note files
router.get('/notes', async (req, res) => {
  try {
    const { studentAnonId } = req.query;

    // Check Supabase first if configured
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('clinical_notes').select('*').order('created_at', { ascending: false });
        if (studentAnonId) {
          query = query.eq('student_anon_id', studentAnonId);
        }
        const { data: dbNotes, error: dbErr } = await query;
        if (!dbErr && dbNotes && dbNotes.length > 0) {
          return res.json({ success: true, notes: dbNotes });
        }
      } catch (e) {
        console.warn('Supabase clinical notes read notice:', e.message);
      }
    }

    let list = [...clinicalNoteFiles];
    if (studentAnonId) {
      list = list.filter(n => n.student_anon_id === studentAnonId);
    }

    return res.json({ success: true, notes: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bookings/notes - Create a new clinical note file inside a student's folder
router.post('/notes', async (req, res) => {
  try {
    const {
      studentAnonId,
      studentName,
      studentCourse,
      studentYear,
      studentEmail,
      fileName,
      title,
      sessionDate,
      sessionTime,
      category,
      severity,
      clinicalObservations,
      actionPlan
    } = req.body;

    if (!studentAnonId) {
      return res.status(400).json({ success: false, error: 'Student Anonymous ID is required.' });
    }

    const cleanDate = sessionDate || new Date().toISOString().split('T')[0];
    const cleanTime = sessionTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const cleanTitle = (title || 'Clinical Consultation Note').trim();
    
    let generatedFileName = (fileName || '').trim();
    if (!generatedFileName) {
      const sanitizedTitle = cleanTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25);
      generatedFileName = `${sanitizedTitle}_${cleanDate}.note`;
    }
    if (!generatedFileName.endsWith('.note')) {
      generatedFileName += '.note';
    }

    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      student_anon_id: studentAnonId,
      student_name: studentName?.trim() || 'Anonymous Student',
      student_course: studentCourse?.trim() || 'Computer Engineering',
      student_year: studentYear?.trim() || '1st Year',
      student_email: studentEmail?.trim() || '',
      file_name: generatedFileName,
      title: cleanTitle,
      session_date: cleanDate,
      session_time: cleanTime,
      category: category || 'General Consultation',
      severity: severity || 'Normal',
      clinical_observations: clinicalObservations?.trim() || '',
      action_plan: actionPlan?.trim() || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data: dbInserted, error: insertErr } = await supabase
          .from('clinical_notes')
          .insert(newNote)
          .select()
          .single();

        if (!insertErr && dbInserted) {
          clinicalNoteFiles.unshift(dbInserted);
          console.log(` [SUPABASE NOTE CREATED] ${dbInserted.file_name} for student ${dbInserted.student_anon_id}`);
          return res.status(201).json({ success: true, note: dbInserted });
        }
      } catch (e) {
        console.warn('Supabase clinical notes insert notice:', e.message);
      }
    }

    clinicalNoteFiles.unshift(newNote);
    console.log(` [NOTE FILE CREATED] ${newNote.file_name} for student ${newNote.student_anon_id}`);

    return res.status(201).json({ success: true, note: newNote });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bookings/notes/:id - Update an existing clinical note file
router.put('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fileName,
      title,
      sessionDate,
      sessionTime,
      category,
      severity,
      clinicalObservations,
      actionPlan
    } = req.body;

    const updates = {
      updated_at: new Date().toISOString()
    };
    if (fileName) updates.file_name = fileName.endsWith('.note') ? fileName : `${fileName}.note`;
    if (title !== undefined) updates.title = title.trim();
    if (sessionDate) updates.session_date = sessionDate;
    if (sessionTime) updates.session_time = sessionTime;
    if (category) updates.category = category;
    if (severity) updates.severity = severity;
    if (clinicalObservations !== undefined) updates.clinical_observations = clinicalObservations;
    if (actionPlan !== undefined) updates.action_plan = actionPlan;

    if (isSupabaseConfigured) {
      try {
        const { data: updatedDb, error: updateErr } = await supabase
          .from('clinical_notes')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!updateErr && updatedDb) {
          const idx = clinicalNoteFiles.findIndex(n => n.id.toString() === id.toString());
          if (idx !== -1) clinicalNoteFiles[idx] = updatedDb;
          return res.json({ success: true, note: updatedDb });
        }
      } catch (e) {
        console.warn('Supabase clinical notes update notice:', e.message);
      }
    }

    const note = clinicalNoteFiles.find(n => n.id.toString() === id.toString());
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note file not found.' });
    }

    Object.assign(note, updates);
    return res.json({ success: true, note });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/bookings/notes/:id - Delete a note file
router.delete('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured) {
      try {
        await supabase.from('clinical_notes').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase clinical notes delete notice:', e.message);
      }
    }

    const initialLen = clinicalNoteFiles.length;
    clinicalNoteFiles = clinicalNoteFiles.filter(n => n.id.toString() !== id.toString());

    if (clinicalNoteFiles.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Note file not found.' });
    }

    return res.json({ success: true, message: 'Note file deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
