import express from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

// Fallback in-memory assessments store (seeded with initial student data)
let fallbackAssessments = [
  {
    id: 'rep_seed_kunal',
    student_email: 'kunaldubey975@gmail.com',
    student_anon_id: 'LTCE-CS-2024-8841',
    student_name: 'Kunal Dubey',
    department: 'Computer Science & Engineering',
    year: '3rd Year (Semester 5)',
    risk_level: 'Critical',
    stress_score: 8.8,
    phq9_score: 16,
    phq9_severity: 'Moderately Severe',
    phq9_self_harm_flag: true,
    phq9_answers: [
      { question: 'Little interest or pleasure in doing things', score: 2, label: 'More than half the days' },
      { question: 'Feeling down, depressed, or hopeless', score: 2, label: 'More than half the days' },
      { question: 'Trouble falling or staying asleep, or sleeping too much', score: 3, label: 'Nearly every day' },
      { question: 'Feeling tired or having little energy', score: 3, label: 'Nearly every day' },
      { question: 'Poor appetite or overeating', score: 1, label: 'Several days' },
      { question: 'Feeling bad about yourself — or that you are a failure', score: 2, label: 'More than half the days' },
      { question: 'Trouble concentrating on things, such as reading or studying', score: 2, label: 'More than half the days' },
      { question: 'Moving or speaking slowly, or fidgety/restless', score: 0, label: 'Not at all' },
      { question: 'Thoughts that you would be better off dead, or hurting yourself', score: 1, label: 'Several days' }
    ],
    gad7_score: 16,
    gad7_severity: 'Severe Anxiety',
    gad7_answers: [
      { question: 'Feeling nervous, anxious, or on edge', score: 3, label: 'Nearly every day' },
      { question: 'Not being able to stop or control worrying', score: 3, label: 'Nearly every day' },
      { question: 'Worrying too much about different things', score: 2, label: 'More than half the days' },
      { question: 'Trouble relaxing', score: 3, label: 'Nearly every day' },
      { question: 'Being so restless that it is hard to sit still', score: 2, label: 'More than half the days' },
      { question: 'Becoming easily annoyed or irritable', score: 2, label: 'More than half the days' },
      { question: 'Feeling afraid, as if something awful might happen', score: 1, label: 'Several days' }
    ],
    psychometric_score: 8.8,
    psychometric_answers: [
      { question: 'I feel overwhelmed by my academic course load and project deadlines.', domain: 'Academic Overload', score: 5, label: 'Strongly Agree' },
      { question: 'I experience physical symptoms (racing heartbeat, tension, nausea) before exams.', domain: 'Evaluation Panic', score: 5, label: 'Strongly Agree' },
      { question: 'I feel like an imposter and worry I do not belong in my program.', domain: 'Imposter Syndrome', score: 4, label: 'Agree' },
      { question: 'My sleep schedule is irregular and leaves me exhausted during lectures.', domain: 'Sleep Disruption', score: 5, label: 'Strongly Agree' },
      { question: 'I have friends or faculty on campus I can openly talk to when struggling.', domain: 'Social Support', score: 3, label: 'Neutral' }
    ],
    submitted_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'rep_seed_ananya',
    student_email: 'ananya.sharma@ltce.in',
    student_anon_id: 'LTCE-IT-2023-4102',
    student_name: 'Ananya Sharma',
    department: 'Information Technology',
    year: '2nd Year (Semester 3)',
    risk_level: 'Critical',
    stress_score: 8.4,
    phq9_score: 18,
    phq9_severity: 'Moderately Severe',
    phq9_self_harm_flag: false,
    phq9_answers: [
      { question: 'Little interest or pleasure in doing things', score: 3, label: 'Nearly every day' },
      { question: 'Feeling down, depressed, or hopeless', score: 3, label: 'Nearly every day' },
      { question: 'Trouble falling or staying asleep, or sleeping too much', score: 2, label: 'More than half the days' },
      { question: 'Feeling tired or having little energy', score: 3, label: 'Nearly every day' },
      { question: 'Poor appetite or overeating', score: 2, label: 'More than half the days' },
      { question: 'Feeling bad about yourself — or that you are a failure', score: 3, label: 'Nearly every day' },
      { question: 'Trouble concentrating on things, such as reading or studying', score: 2, label: 'More than half the days' },
      { question: 'Moving or speaking slowly, or fidgety/restless', score: 0, label: 'Not at all' },
      { question: 'Thoughts that you would be better off dead, or hurting yourself', score: 0, label: 'Not at all' }
    ],
    gad7_score: 12,
    gad7_severity: 'Moderate Anxiety',
    gad7_answers: [
      { question: 'Feeling nervous, anxious, or on edge', score: 2, label: 'More than half the days' },
      { question: 'Not being able to stop or control worrying', score: 2, label: 'More than half the days' },
      { question: 'Worrying too much about different things', score: 2, label: 'More than half the days' },
      { question: 'Trouble relaxing', score: 2, label: 'More than half the days' },
      { question: 'Being so restless that it is hard to sit still', score: 1, label: 'Several days' },
      { question: 'Becoming easily annoyed or irritable', score: 1, label: 'Several days' },
      { question: 'Feeling afraid, as if something awful might happen', score: 2, label: 'More than half the days' }
    ],
    psychometric_score: 8.4,
    psychometric_answers: [
      { question: 'I feel overwhelmed by my academic course load and project deadlines.', domain: 'Academic Overload', score: 4, label: 'Agree' },
      { question: 'I experience physical symptoms (racing heartbeat, tension, nausea) before exams.', domain: 'Evaluation Panic', score: 3, label: 'Neutral' },
      { question: 'I feel like an imposter and worry I do not belong in my program.', domain: 'Imposter Syndrome', score: 5, label: 'Strongly Agree' },
      { question: 'My sleep schedule is irregular and leaves me exhausted during lectures.', domain: 'Sleep Disruption', score: 4, label: 'Agree' },
      { question: 'I have friends or faculty on campus I can openly talk to when struggling.', domain: 'Social Support', score: 1, label: 'Strongly Disagree' }
    ],
    submitted_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'rep_seed_aarav',
    student_email: 'student.demo@gmail.com',
    student_anon_id: 'LTCE-DS-2024-1011',
    student_name: 'Aarav Sharma',
    department: 'Data Science & AI',
    year: '2nd Year (Semester 4)',
    risk_level: 'High',
    stress_score: 7.2,
    phq9_score: 7,
    phq9_severity: 'Mild',
    phq9_self_harm_flag: false,
    phq9_answers: [
      { question: 'Little interest or pleasure in doing things', score: 1, label: 'Several days' },
      { question: 'Feeling down, depressed, or hopeless', score: 1, label: 'Several days' },
      { question: 'Trouble falling or staying asleep, or sleeping too much', score: 1, label: 'Several days' },
      { question: 'Feeling tired or having little energy', score: 2, label: 'More than half the days' },
      { question: 'Poor appetite or overeating', score: 0, label: 'Not at all' },
      { question: 'Feeling bad about yourself — or that you are a failure', score: 1, label: 'Several days' },
      { question: 'Trouble concentrating on things, such as reading or studying', score: 1, label: 'Several days' },
      { question: 'Moving or speaking slowly, or fidgety/restless', score: 0, label: 'Not at all' },
      { question: 'Thoughts that you would be better off dead, or hurting yourself', score: 0, label: 'Not at all' }
    ],
    gad7_score: 14,
    gad7_severity: 'Moderate Anxiety',
    gad7_answers: [
      { question: 'Feeling nervous, anxious, or on edge', score: 2, label: 'More than half the days' },
      { question: 'Not being able to stop or control worrying', score: 3, label: 'Nearly every day' },
      { question: 'Worrying too much about different things', score: 3, label: 'Nearly every day' },
      { question: 'Trouble relaxing', score: 2, label: 'More than half the days' },
      { question: 'Being so restless that it is hard to sit still', score: 1, label: 'Several days' },
      { question: 'Becoming easily annoyed or irritable', score: 2, label: 'More than half the days' },
      { question: 'Feeling afraid, as if something awful might happen', score: 1, label: 'Several days' }
    ],
    psychometric_score: 7.2,
    psychometric_answers: [
      { question: 'I feel overwhelmed by my academic course load and project deadlines.', domain: 'Academic Overload', score: 4, label: 'Agree' },
      { question: 'I experience physical symptoms (racing heartbeat, tension, nausea) before exams.', domain: 'Evaluation Panic', score: 4, label: 'Agree' },
      { question: 'I feel like an imposter and worry I do not belong in my program.', domain: 'Imposter Syndrome', score: 4, label: 'Agree' },
      { question: 'My sleep schedule is irregular and leaves me exhausted during lectures.', domain: 'Sleep Disruption', score: 3, label: 'Neutral' },
      { question: 'I have friends or faculty on campus I can openly talk to when struggling.', domain: 'Social Support', score: 4, label: 'Agree' }
    ],
    submitted_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Helper to format DB record to frontend friendly structure
function formatAssessmentRecord(row) {
  return {
    id: row.id,
    studentEmail: row.student_email,
    studentAnonId: row.student_anon_id,
    studentName: row.student_name,
    department: row.department,
    year: row.year,
    riskLevel: row.risk_level,
    stressScore: parseFloat(row.stress_score) || 5.0,
    timestamp: row.submitted_at || row.created_at,
    phq9: {
      score: row.phq9_score,
      severity: row.phq9_severity,
      selfHarmFlag: Boolean(row.phq9_self_harm_flag),
      answers: Array.isArray(row.phq9_answers) ? row.phq9_answers : []
    },
    gad7: {
      score: row.gad7_score,
      severity: row.gad7_severity,
      answers: Array.isArray(row.gad7_answers) ? row.gad7_answers : []
    },
    psychometrics: {
      score: parseFloat(row.psychometric_score) || 5.0,
      answers: Array.isArray(row.psychometric_answers) ? row.psychometric_answers : []
    }
  };
}

// GET /api/assessments - List all student assessments (for Counselor Dashboard)
router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('psychometric_assessments')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return res.json({
          success: true,
          count: data.length,
          source: 'supabase',
          assessments: data.map(formatAssessmentRecord)
        });
      }
    }

    return res.json({
      success: true,
      count: fallbackAssessments.length,
      source: 'memory_fallback',
      assessments: fallbackAssessments.map(formatAssessmentRecord)
    });
  } catch (err) {
    console.error('[ASSESSMENTS] Error listing assessments:', err);
    return res.status(500).json({ error: 'Failed to retrieve assessment records', code: 'SERVER_ERROR' });
  }
});

// GET /api/assessments/student/:identifier - Fetch specific student assessment
router.get('/student/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('psychometric_assessments')
        .select('*')
        .or(`student_email.eq.${identifier},student_anon_id.eq.${identifier}`)
        .order('submitted_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        return res.json({
          success: true,
          source: 'supabase',
          assessment: formatAssessmentRecord(data[0])
        });
      }
    }

    const found = fallbackAssessments.find(a => 
      a.student_email?.toLowerCase() === identifier.toLowerCase() || 
      a.student_anon_id === identifier
    );

    if (found) {
      return res.json({
        success: true,
        source: 'memory_fallback',
        assessment: formatAssessmentRecord(found)
      });
    }

    return res.status(404).json({ error: 'No assessment found for this student', code: 'NOT_FOUND' });
  } catch (err) {
    console.error('[ASSESSMENTS] Error fetching student assessment:', err);
    return res.status(500).json({ error: 'Failed to fetch student assessment', code: 'SERVER_ERROR' });
  }
});

// POST /api/assessments - Save or update student assessment dynamically
router.post('/', async (req, res) => {
  try {
    const {
      studentEmail,
      studentAnonId,
      studentName,
      department,
      year,
      riskLevel,
      stressScore,
      phq9,
      gad7,
      psychometrics
    } = req.body;

    if (!studentEmail && !studentAnonId) {
      return res.status(400).json({ error: 'Student email or anonymous ID is required', code: 'VALIDATION_FAILED' });
    }

    const assessmentId = req.body.id || `rep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();

    const dbRow = {
      id: assessmentId,
      student_email: studentEmail || 'student@ltce.in',
      student_anon_id: studentAnonId || 'LTCE-INTAKE-ANON',
      student_name: studentName || 'Student Participant',
      department: department || 'Engineering',
      year: year || '2nd Year',
      risk_level: riskLevel || 'Moderate',
      stress_score: stressScore || 5.0,
      phq9_score: phq9?.score ?? 0,
      phq9_severity: phq9?.severity || 'Minimal',
      phq9_self_harm_flag: Boolean(phq9?.selfHarmFlag),
      phq9_answers: phq9?.answers || [],
      gad7_score: gad7?.score ?? 0,
      gad7_severity: gad7?.severity || 'Minimal',
      gad7_answers: gad7?.answers || [],
      psychometric_score: psychometrics?.score ?? 5.0,
      psychometric_answers: psychometrics?.answers || [],
      submitted_at: now,
      updated_at: now
    };

    let savedToSupabase = false;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('psychometric_assessments')
        .upsert(dbRow, { onConflict: 'id' })
        .select();

      if (!error) {
        savedToSupabase = true;
      } else {
        console.warn('[ASSESSMENTS] Supabase upsert notice:', error.message);
      }
    }

    // Update in-memory fallback list (prepend or replace)
    const existingIdx = fallbackAssessments.findIndex(a => 
      a.student_email?.toLowerCase() === dbRow.student_email.toLowerCase() || 
      a.student_anon_id === dbRow.student_anon_id
    );

    if (existingIdx !== -1) {
      fallbackAssessments[existingIdx] = dbRow;
    } else {
      fallbackAssessments.unshift(dbRow);
    }

    console.log(`[ASSESSMENTS] Recorded assessment for ${dbRow.student_name} (${dbRow.student_email}) - Risk: ${dbRow.risk_level}, PHQ-9: ${dbRow.phq9_score}, GAD-7: ${dbRow.gad7_score} [Supabase: ${savedToSupabase ? 'YES' : 'MEMORY'}]`);

    return res.status(201).json({
      success: true,
      source: savedToSupabase ? 'supabase' : 'memory_fallback',
      assessment: formatAssessmentRecord(dbRow)
    });
  } catch (err) {
    console.error('[ASSESSMENTS] Error saving assessment:', err);
    return res.status(500).json({ error: 'Failed to record assessment', code: 'SERVER_ERROR' });
  }
});

export default router;
