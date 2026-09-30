import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  HeartPulse, 
  Video, 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  MessageSquare, 
  PhoneCall, 
  Eye, 
  X, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  HelpCircle,
  Calendar,
  Save,
  Check,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Comprehensive Authentic Mock & Seeded Student Behavioral Telemetry
const INITIAL_STUDENTS_BEHAVIOR = [
  {
    id: 'std_01',
    name: 'Kunal Dubey',
    email: 'kunaldubey975@gmail.com',
    anonId: 'LTCE-CS-2024-8841',
    department: 'Computer Science & Engineering',
    year: '3rd Year (Semester 5)',
    avatar: '👨‍🎓',
    riskLevel: 'Critical', // 'Critical' | 'High' | 'Moderate' | 'Stable'
    stressScore: 8.8,
    primaryIssue: 'Acute Exam Panic & Pre-test Palpitations',
    emotionalState: 'Severe Anxiety & Insomnia',
    detectedBehaviors: [
      'Reports physical palpitations and blanking out 24h before practicals',
      'Chronic sleep deprivation (<4 hours average logged in sleep tracker)',
      'Frequent late-night Sarthi AI chat sessions (01:45 AM - 03:30 AM)',
      'Completed 6-day self-care breathing streak; responsive to mindfulness'
    ],
    aiSentimentScore: 'Negative (High Agitation)',
    lastActive: 'Today at 02:45 AM',
    appointmentsCount: 2,
    screeningScores: {
      gad7: '16/21 (Severe Anxiety)',
      phq9: '9/27 (Mild Depression)',
      sleepScore: '4.2/10'
    },
    counselorRecommendation: 'Schedule urgent 1:1 video desensitization & cognitive reframing before exams.'
  },
  {
    id: 'std_02',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@ltce.in',
    anonId: 'LTCE-IT-2023-4102',
    department: 'Information Technology',
    year: '2nd Year (Semester 3)',
    avatar: '👩‍🎓',
    riskLevel: 'Critical',
    stressScore: 8.4,
    primaryIssue: 'Social Isolation & Academic Alienation',
    emotionalState: 'Depressive Affect & Withdrawal',
    detectedBehaviors: [
      'Avoidance behavior reported in hostel; skipped 4 consecutive laboratory classes',
      'Persistent low energy and self-deprecating phrasing in AI chat interactions',
      'Zero participation in peer study groups or campus extracurriculars',
      'Expressed feeling "invisible and overwhelmed by engineering expectations"'
    ],
    aiSentimentScore: 'Severely Low (Passive / Apathetic)',
    lastActive: 'Yesterday at 11:20 PM',
    appointmentsCount: 1,
    screeningScores: {
      gad7: '12/21 (Moderate Anxiety)',
      phq9: '18/27 (Moderately Severe Depression)',
      sleepScore: '3.8/10'
    },
    counselorRecommendation: 'Immediate clinical outreach; coordinate with academic mentor for attendance relief.'
  },
  {
    id: 'std_03',
    name: 'Aarav Sharma',
    email: 'student.demo@gmail.com',
    anonId: 'LTCE-DS-2024-1011',
    department: 'Data Science & AI',
    year: '2nd Year (Semester 4)',
    avatar: '👨‍🎓',
    riskLevel: 'High',
    stressScore: 7.2,
    primaryIssue: 'Academic Imposter Syndrome & Family Pressure',
    emotionalState: 'Chronic Worry & Performance Anxiety',
    detectedBehaviors: [
      'Extreme comparison anxiety with top rankers in coding contests',
      'Family expectation pressure regarding placement packages and CGPA',
      'Proactive user: books consultation slots ahead of exam weeks',
      'Engages positively with structured 4-7-8 relaxation exercises'
    ],
    aiSentimentScore: 'Guarded / Stressed',
    lastActive: 'Today at 09:15 AM',
    appointmentsCount: 3,
    screeningScores: {
      gad7: '14/21 (Moderate Anxiety)',
      phq9: '7/27 (Mild Depression)',
      sleepScore: '6.0/10'
    },
    counselorRecommendation: 'Validate individual pacing; explore irrational perfectionist cognitive distortions.'
  },
  {
    id: 'std_04',
    name: 'Shivam Mourya',
    email: 'mouryashiv15@gmail.com',
    anonId: 'LTCE-DS-2022-7729',
    department: 'Data Science & AI',
    year: '3rd Year (Semester 6)',
    avatar: '👨‍🎓',
    riskLevel: 'High',
    stressScore: 7.0,
    primaryIssue: 'Capstone Burnout & Workload Fatigue',
    emotionalState: 'Mental Exhaustion & Irritability',
    detectedBehaviors: [
      'Juggle between mini-project submissions, external internships, and backlog exams',
      'Irregular eating cycles and heavy caffeine consumption logged',
      'High motivation but physical fatigue causing cognitive brain fog',
      'Requested advice on time-blocking and deadline anxiety'
    ],
    aiSentimentScore: 'Fatigued / Overwhelmed',
    lastActive: 'Yesterday at 04:50 PM',
    appointmentsCount: 2,
    screeningScores: {
      gad7: '11/21 (Moderate Anxiety)',
      phq9: '8/27 (Mild Depression)',
      sleepScore: '4.8/10'
    },
    counselorRecommendation: 'Prescribe strict sleep hygiene boundary; discuss assignment de-escalation.'
  },
  {
    id: 'std_05',
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@ltce.in',
    anonId: 'LTCE-ME-2021-3914',
    department: 'Mechanical Engineering',
    year: 'Final Year (Semester 7)',
    avatar: '👨‍🎓',
    riskLevel: 'Moderate',
    stressScore: 6.1,
    primaryIssue: 'Campus Placement & Future Career Dread',
    emotionalState: 'Apprehensive & Restless',
    detectedBehaviors: [
      'Anxiety peaks after aptitude test rejection rounds',
      'Frequently checks campus placement bulletin at odd hours',
      'Supportive peer in student forums; provides encouragement to juniors',
      'Moderate stress manageable through regular physical fitness'
    ],
    aiSentimentScore: 'Anxious but Resilient',
    lastActive: 'Today at 10:40 AM',
    appointmentsCount: 1,
    screeningScores: {
      gad7: '9/21 (Mild Anxiety)',
      phq9: '5/27 (Minimal Depression)',
      sleepScore: '6.5/10'
    },
    counselorRecommendation: 'Mock behavioral interview counseling to rebuild placement confidence.'
  },
  {
    id: 'std_06',
    name: 'Sneha Patil',
    email: 'sneha.patil@ltce.in',
    anonId: 'LTCE-EXTC-2023-5521',
    department: 'Electronics & Telecommunication',
    year: '2nd Year (Semester 3)',
    avatar: '👩‍🎓',
    riskLevel: 'Moderate',
    stressScore: 5.6,
    primaryIssue: 'Interpersonal Conflict & Hostel Homesickness',
    emotionalState: 'Homesick & Tearful',
    detectedBehaviors: [
      'First time away from home; difficulty adapting to hostel mess and commute',
      'Roommate friction causing evening anxiety and study concentration loss',
      'Frequent calls home; responds well to empathy and campus mentorship clubs',
      'Has not required clinical medication; benefit from peer buddy pairing'
    ],
    aiSentimentScore: 'Vulnerable / Seeking Support',
    lastActive: '2 days ago',
    appointmentsCount: 1,
    screeningScores: {
      gad7: '8/21 (Mild Anxiety)',
      phq9: '6/27 (Mild Depression)',
      sleepScore: '6.8/10'
    },
    counselorRecommendation: 'Connect with campus hostel warden & senior student peer mentor.'
  },
  {
    id: 'std_07',
    name: 'Tanvi Kulkarni',
    email: 'tanvi.kulkarni@ltce.in',
    anonId: 'LTCE-CS-2023-1189',
    department: 'Computer Science & Engineering',
    year: '2nd Year (Semester 4)',
    avatar: '👩‍🎓',
    riskLevel: 'Stable',
    stressScore: 3.4,
    primaryIssue: 'Routine Wellness Maintenance',
    emotionalState: 'Calm & Adaptable',
    detectedBehaviors: [
      'Active daily use of gratitude reflection and mood logging features',
      'Consistent 7+ hours sleep logs; regular meditation check-ins',
      'Scores consistently within healthy normal psychometric baselines',
      'No critical behavioral flags or acute distress indicators'
    ],
    aiSentimentScore: 'Positive / Balanced',
    lastActive: 'Today at 08:30 AM',
    appointmentsCount: 0,
    screeningScores: {
      gad7: '3/21 (Minimal Anxiety)',
      phq9: '2/27 (Minimal Depression)',
      sleepScore: '8.5/10'
    },
    counselorRecommendation: 'Encourage leadership in campus peer-support volunteer wellness group.'
  },
  {
    id: 'std_08',
    name: 'Priyansh Verma',
    email: 'priyansh.verma@ltce.in',
    anonId: 'LTCE-CIVIL-2022-6632',
    department: 'Civil Engineering',
    year: '3rd Year (Semester 5)',
    avatar: '👨‍🎓',
    riskLevel: 'Stable',
    stressScore: 4.1,
    primaryIssue: 'Mild Workload Adjustment',
    emotionalState: 'Stable & Focused',
    detectedBehaviors: [
      'Occasional stress during mid-term submission cycle, promptly resolved',
      'Healthy extracurricular participation in college sports and cultural fest',
      'Good peer network support; high self-regulation scores',
      'Uses Sarthi AI primarily for motivational study quotes and pomodoro focus'
    ],
    aiSentimentScore: 'Stable / Optimistic',
    lastActive: 'Yesterday at 06:15 PM',
    appointmentsCount: 0,
    screeningScores: {
      gad7: '4/21 (Minimal Anxiety)',
      phq9: '3/27 (Minimal Depression)',
      sleepScore: '7.6/10'
    },
    counselorRecommendation: 'Routine quarterly check-in; healthy coping strategies observed.'
  }
];

// Seeded Comprehensive Clinical Assessments (PHQ-9, GAD-7, Psychometric Stress)
const SEEDED_PSYCHOMETRIC_REPORTS = {
  'kunaldubey975@gmail.com': {
    id: 'report_kunal_demo',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    studentName: 'Kunal Dubey',
    studentEmail: 'kunaldubey975@gmail.com',
    studentAnonId: 'LTCE-CS-2024-8841',
    department: 'Computer Science & Engineering',
    year: '3rd Year (Semester 5)',
    riskLevel: 'Critical',
    stressScore: 8.8,
    phq9: {
      score: 16,
      severity: 'Moderately Severe',
      selfHarmFlag: true,
      answers: [
        { question: 'Little interest or pleasure in doing things', score: 2, label: 'More than half the days' },
        { question: 'Feeling down, depressed, or hopeless', score: 2, label: 'More than half the days' },
        { question: 'Trouble falling or staying asleep, or sleeping too much', score: 3, label: 'Nearly every day' },
        { question: 'Feeling tired or having little energy', score: 3, label: 'Nearly every day' },
        { question: 'Poor appetite or overeating', score: 1, label: 'Several days' },
        { question: 'Feeling bad about yourself — or that you are a failure', score: 2, label: 'More than half the days' },
        { question: 'Trouble concentrating on things, such as reading or studying', score: 2, label: 'More than half the days' },
        { question: 'Moving or speaking slowly, or fidgety/restless', score: 0, label: 'Not at all' },
        { question: 'Thoughts that you would be better off dead, or hurting yourself', score: 1, label: 'Several days' }
      ]
    },
    gad7: {
      score: 16,
      severity: 'Severe Anxiety',
      answers: [
        { question: 'Feeling nervous, anxious, or on edge', score: 3, label: 'Nearly every day' },
        { question: 'Not being able to stop or control worrying', score: 3, label: 'Nearly every day' },
        { question: 'Worrying too much about different things', score: 2, label: 'More than half the days' },
        { question: 'Trouble relaxing', score: 3, label: 'Nearly every day' },
        { question: 'Being so restless that it is hard to sit still', score: 2, label: 'More than half the days' },
        { question: 'Becoming easily annoyed or irritable', score: 2, label: 'More than half the days' },
        { question: 'Feeling afraid, as if something awful might happen', score: 1, label: 'Several days' }
      ]
    },
    psychometrics: {
      score: 8.8,
      answers: [
        { question: 'I feel overwhelmed by my academic course load and project deadlines.', domain: 'Academic Overload', score: 5, label: 'Strongly Agree' },
        { question: 'I experience physical symptoms (racing heartbeat, tension, nausea) before exams.', domain: 'Evaluation Panic', score: 5, label: 'Strongly Agree' },
        { question: 'I feel like an imposter and worry I do not belong in my program.', domain: 'Imposter Syndrome', score: 4, label: 'Agree' },
        { question: 'My sleep schedule is irregular and leaves me exhausted during lectures.', domain: 'Sleep Disruption', score: 5, label: 'Strongly Agree' },
        { question: 'I have friends or faculty on campus I can openly talk to when struggling.', domain: 'Social Support', score: 3, label: 'Neutral' }
      ]
    }
  },
  'ananya.sharma@ltce.in': {
    id: 'report_ananya_demo',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    studentName: 'Ananya Sharma',
    studentEmail: 'ananya.sharma@ltce.in',
    studentAnonId: 'LTCE-IT-2023-4102',
    department: 'Information Technology',
    year: '2nd Year (Semester 3)',
    riskLevel: 'Critical',
    stressScore: 8.4,
    phq9: {
      score: 18,
      severity: 'Moderately Severe',
      selfHarmFlag: false,
      answers: [
        { question: 'Little interest or pleasure in doing things', score: 3, label: 'Nearly every day' },
        { question: 'Feeling down, depressed, or hopeless', score: 3, label: 'Nearly every day' },
        { question: 'Trouble falling or staying asleep, or sleeping too much', score: 2, label: 'More than half the days' },
        { question: 'Feeling tired or having little energy', score: 3, label: 'Nearly every day' },
        { question: 'Poor appetite or overeating', score: 2, label: 'More than half the days' },
        { question: 'Feeling bad about yourself — or that you are a failure', score: 3, label: 'Nearly every day' },
        { question: 'Trouble concentrating on things, such as reading or studying', score: 2, label: 'More than half the days' },
        { question: 'Moving or speaking slowly, or fidgety/restless', score: 0, label: 'Not at all' },
        { question: 'Thoughts that you would be better off dead, or hurting yourself', score: 0, label: 'Not at all' }
      ]
    },
    gad7: {
      score: 12,
      severity: 'Moderate Anxiety',
      answers: [
        { question: 'Feeling nervous, anxious, or on edge', score: 2, label: 'More than half the days' },
        { question: 'Not being able to stop or control worrying', score: 2, label: 'More than half the days' },
        { question: 'Worrying too much about different things', score: 2, label: 'More than half the days' },
        { question: 'Trouble relaxing', score: 2, label: 'More than half the days' },
        { question: 'Being so restless that it is hard to sit still', score: 1, label: 'Several days' },
        { question: 'Becoming easily annoyed or irritable', score: 1, label: 'Several days' },
        { question: 'Feeling afraid, as if something awful might happen', score: 2, label: 'More than half the days' }
      ]
    },
    psychometrics: {
      score: 8.4,
      answers: [
        { question: 'I feel overwhelmed by my academic course load and project deadlines.', domain: 'Academic Overload', score: 4, label: 'Agree' },
        { question: 'I experience physical symptoms (racing heartbeat, tension, nausea) before exams.', domain: 'Evaluation Panic', score: 3, label: 'Neutral' },
        { question: 'I feel like an imposter and worry I do not belong in my program.', domain: 'Imposter Syndrome', score: 5, label: 'Strongly Agree' },
        { question: 'My sleep schedule is irregular and leaves me exhausted during lectures.', domain: 'Sleep Disruption', score: 4, label: 'Agree' },
        { question: 'I have friends or faculty on campus I can openly talk to when struggling.', domain: 'Social Support', score: 1, label: 'Strongly Disagree' }
      ]
    }
  },
  'student.demo@gmail.com': {
    id: 'report_aarav_demo',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    studentName: 'Aarav Sharma',
    studentEmail: 'student.demo@gmail.com',
    studentAnonId: 'LTCE-DS-2024-1011',
    department: 'Data Science & AI',
    year: '2nd Year (Semester 4)',
    riskLevel: 'High',
    stressScore: 7.2,
    phq9: {
      score: 7,
      severity: 'Mild',
      selfHarmFlag: false,
      answers: [
        { question: 'Little interest or pleasure in doing things', score: 1, label: 'Several days' },
        { question: 'Feeling down, depressed, or hopeless', score: 1, label: 'Several days' },
        { question: 'Trouble falling or staying asleep, or sleeping too much', score: 1, label: 'Several days' },
        { question: 'Feeling tired or having little energy', score: 2, label: 'More than half the days' },
        { question: 'Poor appetite or overeating', score: 0, label: 'Not at all' },
        { question: 'Feeling bad about yourself — or that you are a failure', score: 1, label: 'Several days' },
        { question: 'Trouble concentrating on things, such as reading or studying', score: 1, label: 'Several days' },
        { question: 'Moving or speaking slowly, or fidgety/restless', score: 0, label: 'Not at all' },
        { question: 'Thoughts that you would be better off dead, or hurting yourself', score: 0, label: 'Not at all' }
      ]
    },
    gad7: {
      score: 14,
      severity: 'Moderate Anxiety',
      answers: [
        { question: 'Feeling nervous, anxious, or on edge', score: 2, label: 'More than half the days' },
        { question: 'Not being able to stop or control worrying', score: 3, label: 'Nearly every day' },
        { question: 'Worrying too much about different things', score: 3, label: 'Nearly every day' },
        { question: 'Trouble relaxing', score: 2, label: 'More than half the days' },
        { question: 'Being so restless that it is hard to sit still', score: 1, label: 'Several days' },
        { question: 'Becoming easily annoyed or irritable', score: 2, label: 'More than half the days' },
        { question: 'Feeling afraid, as if something awful might happen', score: 1, label: 'Several days' }
      ]
    },
    psychometrics: {
      score: 7.2,
      answers: [
        { question: 'I feel overwhelmed by my academic course load and project deadlines.', domain: 'Academic Overload', score: 4, label: 'Agree' },
        { question: 'I experience physical symptoms (racing heartbeat, tension, nausea) before exams.', domain: 'Evaluation Panic', score: 4, label: 'Agree' },
        { question: 'I feel like an imposter and worry I do not belong in my program.', domain: 'Imposter Syndrome', score: 4, label: 'Agree' },
        { question: 'My sleep schedule is irregular and leaves me exhausted during lectures.', domain: 'Sleep Disruption', score: 3, label: 'Neutral' },
        { question: 'I have friends or faculty on campus I can openly talk to when struggling.', domain: 'Social Support', score: 4, label: 'Agree' }
      ]
    }
  }
};

// Helper: Synthesize or retrieve student's full psychometric clinical assessment
const getStudentClinicalReport = (student) => {
  if (student.psychometricReport) return student.psychometricReport;

  try {
    const stored = JSON.parse(localStorage.getItem('campuscare_psychometric_reports') || '[]');
    const match = stored.find(r => 
      (r.studentEmail && student.email && r.studentEmail.toLowerCase() === student.email.toLowerCase()) || 
      r.studentAnonId === student.anonId
    );
    if (match) return match;
  } catch (e) {}

  if (student.email && SEEDED_PSYCHOMETRIC_REPORTS[student.email]) {
    return SEEDED_PSYCHOMETRIC_REPORTS[student.email];
  }

  // Fallback synthesized clinical report
  const isCrit = student.riskLevel === 'Critical';
  const isHigh = student.riskLevel === 'High';
  const isMod = student.riskLevel === 'Moderate';
  const phqScore = isCrit ? 16 : isHigh ? 11 : isMod ? 7 : 3;
  const gadScore = isCrit ? 15 : isHigh ? 12 : isMod ? 8 : 2;

  return {
    id: `report_${student.id}`,
    timestamp: new Date().toISOString(),
    studentName: student.name,
    studentEmail: student.email,
    studentAnonId: student.anonId,
    department: student.department,
    year: student.year,
    riskLevel: student.riskLevel,
    stressScore: student.stressScore,
    phq9: {
      score: phqScore,
      severity: phqScore >= 20 ? 'Severe' : phqScore >= 15 ? 'Moderately Severe' : phqScore >= 10 ? 'Moderate' : phqScore >= 5 ? 'Mild' : 'Minimal',
      selfHarmFlag: isCrit,
      answers: [
        { question: 'Little interest or pleasure in doing things', score: isCrit ? 2 : 1, label: isCrit ? 'More than half the days' : 'Several days' },
        { question: 'Feeling down, depressed, or hopeless', score: isCrit ? 2 : 1, label: isCrit ? 'More than half the days' : 'Several days' },
        { question: 'Trouble falling or staying asleep, or sleeping too much', score: isCrit ? 3 : isHigh ? 2 : 1, label: isCrit ? 'Nearly every day' : 'Several days' },
        { question: 'Feeling tired or having little energy', score: isCrit ? 3 : 2, label: isCrit ? 'Nearly every day' : 'More than half the days' },
        { question: 'Poor appetite or overeating', score: isCrit ? 2 : 1, label: isCrit ? 'More than half the days' : 'Several days' },
        { question: 'Feeling bad about yourself — or that you are a failure', score: isCrit ? 2 : 1, label: isCrit ? 'More than half the days' : 'Several days' },
        { question: 'Trouble concentrating on things, such as reading or studying', score: isCrit ? 2 : 1, label: isCrit ? 'More than half the days' : 'Several days' },
        { question: 'Moving or speaking slowly, or fidgety/restless', score: 0, label: 'Not at all' },
        { question: 'Thoughts that you would be better off dead, or hurting yourself', score: isCrit ? 1 : 0, label: isCrit ? 'Several days' : 'Not at all' }
      ]
    },
    gad7: {
      score: gadScore,
      severity: gadScore >= 15 ? 'Severe Anxiety' : gadScore >= 10 ? 'Moderate Anxiety' : gadScore >= 5 ? 'Mild Anxiety' : 'Minimal Anxiety',
      answers: [
        { question: 'Feeling nervous, anxious, or on edge', score: isCrit ? 3 : isHigh ? 2 : 1, label: isCrit ? 'Nearly every day' : 'Several days' },
        { question: 'Not being able to stop or control worrying', score: isCrit ? 3 : 2, label: isCrit ? 'Nearly every day' : 'More than half the days' },
        { question: 'Worrying too much about different things', score: isCrit ? 2 : 2, label: 'More than half the days' },
        { question: 'Trouble relaxing', score: isCrit ? 2 : 1, label: isCrit ? 'More than half the days' : 'Several days' },
        { question: 'Being so restless that it is hard to sit still', score: isCrit ? 2 : 1, label: isCrit ? 'More than half the days' : 'Several days' },
        { question: 'Becoming easily annoyed or irritable', score: isCrit ? 2 : 1, label: isCrit ? 'More than half the days' : 'Several days' },
        { question: 'Feeling afraid, as if something awful might happen', score: isCrit ? 1 : 1, label: 'Several days' }
      ]
    },
    psychometrics: {
      score: student.stressScore,
      answers: [
        { question: 'I feel overwhelmed by my academic course load and project deadlines.', domain: 'Academic Overload', score: isCrit ? 5 : 4, label: isCrit ? 'Strongly Agree' : 'Agree' },
        { question: 'I experience physical symptoms (racing heartbeat, tension, nausea) before exams.', domain: 'Evaluation Panic', score: isCrit ? 5 : 3, label: isCrit ? 'Strongly Agree' : 'Neutral' },
        { question: 'I feel like an imposter and worry I do not belong in my program.', domain: 'Imposter Syndrome', score: isCrit ? 4 : 3, label: isCrit ? 'Agree' : 'Neutral' },
        { question: 'My sleep schedule is irregular and leaves me exhausted during lectures.', domain: 'Sleep Disruption', score: isCrit ? 5 : 3, label: isCrit ? 'Strongly Agree' : 'Neutral' },
        { question: 'I have friends or faculty on campus I can openly talk to when struggling.', domain: 'Social Support', score: isCrit ? 2 : 4, label: isCrit ? 'Disagree' : 'Agree' }
      ]
    }
  };
};

export default function CounselorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [students, setStudents] = useState(INITIAL_STUDENTS_BEHAVIOR);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL' | 'Critical' | 'High' | 'Moderate' | 'Stable'
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Quick Clinical Note Modal State
  const [noteModalStudent, setNoteModalStudent] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Clinical Psychometric Report Modal State (PHQ-9, GAD-7, Psychometrics)
  const [clinicalReportStudent, setClinicalReportStudent] = useState(null);
  const [activeReportTab, setActiveReportTab] = useState('phq9'); // 'phq9' | 'gad7' | 'psychometrics'

  // Load and merge student submissions from localStorage
  useEffect(() => {
    try {
      const storedReports = JSON.parse(localStorage.getItem('campuscare_psychometric_reports') || '[]');
      if (storedReports && storedReports.length > 0) {
        setStudents(prev => {
          let updated = [...prev];
          storedReports.forEach(rep => {
            const existingIdx = updated.findIndex(s => 
              (s.email && rep.studentEmail && s.email.toLowerCase() === rep.studentEmail.toLowerCase()) || 
              s.anonId === rep.studentAnonId
            );
            if (existingIdx !== -1) {
              updated[existingIdx] = {
                ...updated[existingIdx],
                riskLevel: rep.riskLevel || updated[existingIdx].riskLevel,
                stressScore: rep.stressScore || updated[existingIdx].stressScore,
                screeningScores: {
                  ...updated[existingIdx].screeningScores,
                  phq9: `${rep.phq9.score}/27 (${rep.phq9.severity})`,
                  gad7: `${rep.gad7.score}/21 (${rep.gad7.severity})`
                },
                psychometricReport: rep
              };
            } else {
              // Prepend newly submitted live student
              updated.unshift({
                id: `std_live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                name: rep.studentName || 'Student Participant',
                email: rep.studentEmail || 'student@ltce.in',
                anonId: rep.studentAnonId || 'LTCE-INTAKE-LIVE',
                department: rep.department || 'Computer Science & Engineering',
                year: rep.year || '3rd Year',
                avatar: '👨‍🎓',
                riskLevel: rep.riskLevel || 'Moderate',
                stressScore: rep.stressScore || 6.5,
                primaryIssue: 'Intake Mental Health Screening Completed',
                emotionalState: rep.riskLevel === 'Critical' ? 'Elevated Distress' : 'Moderate Agitation',
                detectedBehaviors: [
                  `Intake assessment submitted on ${new Date(rep.timestamp).toLocaleDateString()}`,
                  `PHQ-9 Score: ${rep.phq9.score}/27 (${rep.phq9.severity})`,
                  `GAD-7 Score: ${rep.gad7.score}/21 (${rep.gad7.severity})`,
                  rep.phq9.selfHarmFlag ? '🚨 Safety Flag: Endorsed Question 9 (Self-harm / suicidal thoughts)' : 'No acute safety flag detected'
                ],
                aiSentimentScore: rep.riskLevel === 'Critical' ? 'High Risk' : 'Moderate',
                lastActive: 'Just now (Screening completed)',
                appointmentsCount: 0,
                screeningScores: {
                  gad7: `${rep.gad7.score}/21 (${rep.gad7.severity})`,
                  phq9: `${rep.phq9.score}/27 (${rep.phq9.severity})`,
                  sleepScore: '5.0/10'
                },
                counselorRecommendation: rep.riskLevel === 'Critical' 
                  ? 'Urgent clinical intake session required; schedule 1:1 consultation immediately.'
                  : 'Review responses during next scheduled academic wellness check-in.',
                psychometricReport: rep
              });
            }
          });
          return updated;
        });
      }
    } catch (e) {
      console.error('Error parsing stored psychometric reports:', e);
    }
  }, []);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.anonId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.primaryIssue.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRisk = riskFilter === 'ALL' || s.riskLevel === riskFilter;
      const matchDept = deptFilter === 'ALL' || s.department.toLowerCase().includes(deptFilter.toLowerCase());

      return matchSearch && matchRisk && matchDept;
    });
  }, [students, searchQuery, riskFilter, deptFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = students.length;
    const critical = students.filter(s => s.riskLevel === 'Critical').length;
    const high = students.filter(s => s.riskLevel === 'High').length;
    const moderate = students.filter(s => s.riskLevel === 'Moderate').length;
    const stable = students.filter(s => s.riskLevel === 'Stable').length;
    const avgStress = (students.reduce((acc, curr) => acc + curr.stressScore, 0) / total).toFixed(1);

    return { total, critical, high, moderate, stable, avgStress };
  }, [students]);

  // Update Risk Level on the fly
  const handleUpdateRisk = (studentId, newRisk) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, riskLevel: newRisk };
      }
      return s;
    }));
    setActionSuccessMsg(`Updated status to ${newRisk}`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // Launch 1:1 Video Call with Student
  const handleStartVideoConsult = (student) => {
    const channel = `session_${student.anonId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    navigate(`/video-call?channel=${encodeURIComponent(channel)}`);
  };

  // Save Clinical Note for Student
  const handleSaveQuickNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim() || !noteModalStudent) return;
    setSavingNote(true);

    try {
      const payload = {
        studentAnonId: noteModalStudent.anonId,
        studentName: noteModalStudent.name,
        fileName: `Behavior_Review_${Date.now()}.note`,
        title: `Behavioral Assessment - ${noteModalStudent.name}`,
        category: noteModalStudent.primaryIssue,
        severity: noteModalStudent.riskLevel,
        clinicalObservations: noteContent.trim(),
        actionPlan: noteModalStudent.counselorRecommendation
      };

      let res;
      try {
        res = await fetch('/api/bookings/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok || res.headers.get('content-type')?.includes('text/html')) {
          res = await fetch('https://campuscare2-0-backend.onrender.com/api/bookings/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } catch (err) {
        res = await fetch('https://campuscare2-0-backend.onrender.com/api/bookings/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setActionSuccessMsg(`✓ Clinical note recorded for ${noteModalStudent.name}`);
      setNoteModalStudent(null);
      setNoteContent('');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      alert('Error saving note.');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-height))',
      paddingTop: 'var(--header-height)',
      backgroundColor: 'var(--page-bg)',
      color: 'var(--text-primary)',
      paddingBottom: '60px'
    }}>
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          background: 'var(--green)',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: '100px',
          fontSize: '0.85rem',
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 24px' }}>
        
        {/* Top Header Banner */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: 'var(--brand-blue-pale)',
                color: 'var(--brand-blue)',
                padding: '3px 10px',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Clinical Intelligence Center
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--green)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--green)', display: 'inline-block' }} />
                Live Sarthi AI Telemetry Active
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-primary)' }}>
              Student Behavioral &amp; Wellbeing Dashboard
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
              Monitoring caseload behaviors, emotional signals, exam stress spikes, and intervention readiness across all engineering departments.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/booking')}
              style={{
                background: 'var(--sidebar-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                padding: '10px 16px',
                borderRadius: '100px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Calendar size={15} color="var(--brand-blue)" />
              <span>Appointments Desk</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/video-call')}
              style={{
                background: 'var(--brand-blue)',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '100px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(38, 118, 166, 0.25)'
              }}
            >
              <Video size={16} />
              <span>Launch 1:1 Room</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* Card 1: Critical Alerts */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            borderLeft: '4px solid var(--coral)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Critical Alert Flags
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--coral-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--coral)'
              }}>
                <AlertTriangle size={17} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--coral)', lineHeight: 1 }}>
              {metrics.critical}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Requires immediate counselor 1:1 intervention
            </div>
          </div>

          {/* Card 2: High Concern Cases */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            borderLeft: '4px solid var(--orange)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                High Concern Cases
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--orange-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--orange)'
              }}>
                <Clock size={17} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--orange)', lineHeight: 1 }}>
              {metrics.high}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Bi-weekly check-in &amp; workload management
            </div>
          </div>

          {/* Card 3: Monitored Students */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            borderLeft: '4px solid var(--brand-blue)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Active Student Caseload
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--brand-blue-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-blue)'
              }}>
                <Users size={17} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-blue)', lineHeight: 1 }}>
              {metrics.total}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              {metrics.moderate} Moderate • {metrics.stable} Stable / Thriving
            </div>
          </div>

          {/* Card 4: Campus Wellbeing Index */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            borderLeft: '4px solid var(--green)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Average Stress Index
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--green-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--green)'
              }}>
                <Activity size={17} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {metrics.avgStress} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ 10</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Elevated due to upcoming mid-semester practicals
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--sidebar-bg)',
            border: '1px solid var(--border)',
            borderRadius: '100px',
            padding: '8px 16px',
            maxWidth: '380px',
            width: '100%'
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text"
              placeholder="Search by student name, roll ID, or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                width: '100%'
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '4px' }}>
              Risk Level:
            </span>

            {['ALL', 'Critical', 'High', 'Moderate', 'Stable'].map(level => {
              const isActive = riskFilter === level;
              let activeBg = 'var(--brand-blue)';
              if (level === 'Critical') activeBg = 'var(--coral)';
              if (level === 'High') activeBg = 'var(--orange)';
              if (level === 'Moderate') activeBg = 'var(--teal)';
              if (level === 'Stable') activeBg = 'var(--green)';

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRiskFilter(level)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '100px',
                    border: isActive ? `1px solid ${activeBg}` : '1px solid var(--border)',
                    background: isActive ? activeBg : 'var(--sidebar-bg)',
                    color: isActive ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {level === 'ALL' ? 'All Risks' : level}
                </button>
              );
            })}

            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

            {/* Department Select */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '100px',
                border: '1px solid var(--border)',
                background: 'var(--sidebar-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Engineering Branches</option>
              <option value="Computer Science">Computer Science &amp; Engg</option>
              <option value="Data Science">Data Science &amp; AI</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Civil">Civil Engineering</option>
              <option value="Electronics">Electronics &amp; Telecom</option>
            </select>
          </div>
        </div>

        {/* Student Behavioral Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredStudents.length === 0 ? (
            <div style={{
              background: 'var(--surface)',
              borderRadius: '14px',
              padding: '48px',
              textAlign: 'center',
              border: '1px dashed var(--border)'
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                No students match your filter criteria.
              </p>
            </div>
          ) : (
            filteredStudents.map(student => {
              const isCrit = student.riskLevel === 'Critical';
              const isHigh = student.riskLevel === 'High';
              const isMod = student.riskLevel === 'Moderate';
              const badgeBg = isCrit ? 'var(--coral-pale)' : isHigh ? 'var(--orange-pale)' : isMod ? 'var(--teal-pale)' : 'var(--green-pale)';
              const badgeColor = isCrit ? 'var(--coral)' : isHigh ? 'var(--orange)' : isMod ? 'var(--teal)' : 'var(--green)';

              return (
                <div
                  key={student.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'border-color 0.2s ease',
                    borderLeft: `5px solid ${badgeColor}`
                  }}
                >
                  {/* Row 1: Header Info & Risk Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: 'var(--sidebar-bg)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem'
                      }}>
                        {student.avatar}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            {student.name}
                          </h3>
                          <span style={{
                            background: 'var(--sidebar-bg)',
                            color: 'var(--text-secondary)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontFamily: 'monospace',
                            fontWeight: 600
                          }}>
                            {student.anonId}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {student.department} • {student.year} • <span style={{ color: 'var(--text-muted)' }}>{student.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Metrics & Risk Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Stress Index
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: badgeColor }}>
                          {student.stressScore} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ 10</span>
                        </div>
                      </div>

                      <span style={{
                        background: badgeBg,
                        color: badgeColor,
                        padding: '6px 14px',
                        borderRadius: '100px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: badgeColor }} />
                        {student.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Behavioral Diagnostic Signals */}
                  <div style={{
                    background: 'var(--sidebar-bg)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Primary Mental Health Concern
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {student.primaryIssue}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Affect: <strong style={{ color: badgeColor }}>{student.emotionalState}</strong>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Last AI Telemetry: {student.lastActive}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Detected Behavioral Indicators (Sarthi AI Telemetry)
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {student.detectedBehaviors.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: '2px' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Row 3: Action Buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    paddingTop: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Update Risk:
                      </span>
                      {['Critical', 'High', 'Moderate', 'Stable'].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleUpdateRisk(student.id, r)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: student.riskLevel === r ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                            background: student.riskLevel === r ? 'var(--text-primary)' : 'transparent',
                            color: student.riskLevel === r ? '#fff' : 'var(--text-secondary)'
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {/* View PHQ-9 & GAD-7 Report Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setClinicalReportStudent(student);
                          setActiveReportTab('phq9');
                        }}
                        style={{
                          background: 'rgba(235, 87, 87, 0.1)',
                          color: 'var(--coral)',
                          border: '1px solid rgba(235, 87, 87, 0.35)',
                          padding: '7px 14px',
                          borderRadius: '100px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(235, 87, 87, 0.08)'
                        }}
                      >
                        <ShieldAlert size={14} />
                        <span>📋 PHQ-9 &amp; GAD-7 Report</span>
                      </button>

                      {/* View Full Dossier */}
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        style={{
                          background: 'transparent',
                          color: 'var(--brand-blue)',
                          border: '1px solid var(--brand-blue)',
                          padding: '7px 14px',
                          borderRadius: '100px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Eye size={13} />
                        <span>View Behavioral Dossier</span>
                      </button>

                      {/* Log Clinical Note */}
                      <button
                        type="button"
                        onClick={() => setNoteModalStudent(student)}
                        style={{
                          background: 'var(--teal-pale)',
                          color: 'var(--teal)',
                          border: '1px solid rgba(50, 165, 178, 0.3)',
                          padding: '7px 14px',
                          borderRadius: '100px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <FileText size={13} />
                        <span>Log Clinical Note</span>
                      </button>

                      {/* Launch 1:1 Video Consultation */}
                      <button
                        type="button"
                        onClick={() => handleStartVideoConsult(student)}
                        style={{
                          background: 'var(--brand-blue)',
                          color: '#fff',
                          border: 'none',
                          padding: '7px 16px',
                          borderRadius: '100px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(38, 118, 166, 0.25)'
                        }}
                      >
                        <Video size={14} />
                        <span>Start 1:1 Video</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STUDENT DETAILED BEHAVIORAL DOSSIER MODAL                              */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 10000
        }}>
          <div style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{selectedStudent.avatar}</span>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {selectedStudent.name}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {selectedStudent.anonId} • {selectedStudent.department}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: 'var(--sidebar-bg)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Screening Scores Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '18px'
            }}>
              <div style={{ background: 'var(--sidebar-bg)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>GAD-7 ANXIETY</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--coral)', marginTop: '4px' }}>
                  {selectedStudent.screeningScores.gad7}
                </div>
              </div>

              <div style={{ background: 'var(--sidebar-bg)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>PHQ-9 DEPRESSION</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--orange)', marginTop: '4px' }}>
                  {selectedStudent.screeningScores.phq9}
                </div>
              </div>

              <div style={{ background: 'var(--sidebar-bg)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SLEEP QUALITY</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--teal)', marginTop: '4px' }}>
                  {selectedStudent.screeningScores.sleepScore}
                </div>
              </div>
            </div>

            {/* AI Sentiment Analysis */}
            <div style={{
              background: 'var(--brand-blue-pale)',
              border: '1px solid rgba(38, 118, 166, 0.25)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-blue)' }}>
                <Sparkles size={15} />
                <span>Sarthi AI Emotion Recognition Analysis</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                Overall Sentiment: <strong>{selectedStudent.aiSentimentScore}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Active cues: Repetitive catastrophic thinking patterns before grading deadlines; positive relaxation response noted when breathing pacer is engaged.
              </div>
            </div>

            {/* Clinical Recommendation */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Recommended Clinical Action Plan
              </div>
              <div style={{
                background: 'var(--sidebar-bg)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45
              }}>
                {selectedStudent.counselorRecommendation}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setNoteModalStudent(selectedStudent);
                  setSelectedStudent(null);
                }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '9px 16px',
                  borderRadius: '100px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Write Clinical Note
              </button>

              <button
                type="button"
                onClick={() => {
                  handleStartVideoConsult(selectedStudent);
                  setSelectedStudent(null);
                }}
                style={{
                  background: 'var(--brand-blue)',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '100px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Video size={15} />
                <span>Start Video Consultation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LOG CLINICAL NOTE MODAL                                                */}
      {/* ========================================================================= */}
      {noteModalStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 10000
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Log Clinical Consultation Note
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Student: {noteModalStudent.name} ({noteModalStudent.anonId})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNoteModalStudent(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickNote}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Clinical Observations &amp; Coping Feedback
                </label>
                <textarea
                  rows={5}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record behavioral demeanor, specific cognitive distress patterns discussed, emotional regulation capacity..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--sidebar-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    lineHeight: 1.45,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNoteModalStudent(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    padding: '8px 16px',
                    borderRadius: '100px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  style={{
                    background: 'var(--brand-blue)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '100px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: savingNote ? 'not-allowed' : 'pointer'
                  }}
                >
                  {savingNote ? 'Saving...' : 'Save to Student File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONFIDENTIAL CLINICAL INTAKE REPORT MODAL (PHQ-9, GAD-7, PSYCHOMETRICS) */}
      {/* ========================================================================= */}
      {clinicalReportStudent && (() => {
        const report = getStudentClinicalReport(clinicalReportStudent);
        const hasSafetyAlert = report.phq9?.selfHarmFlag || (report.phq9?.answers && report.phq9.answers[8]?.score > 0);
        const isCrit = report.riskLevel === 'Critical';
        const isHigh = report.riskLevel === 'High';
        const isMod = report.riskLevel === 'Moderate';
        const badgeBg = isCrit ? 'var(--coral-pale)' : isHigh ? 'var(--orange-pale)' : isMod ? 'var(--teal-pale)' : 'var(--green-pale)';
        const badgeColor = isCrit ? 'var(--coral)' : isHigh ? 'var(--orange)' : isMod ? 'var(--teal)' : 'var(--green)';

        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 10000,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}>
            <div style={{
              maxWidth: '850px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '28px 32px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
              position: 'relative'
            }}>
              {/* Top Institutional Classification Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border)',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: 'rgba(235, 87, 87, 0.12)',
                    color: 'var(--coral)',
                    padding: '4px 12px',
                    borderRadius: '100px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <ShieldAlert size={13} />
                    Confidential Clinical Dossier • Counselor Access Only
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Assessment ID: <strong style={{ fontFamily: 'monospace' }}>{report.id}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setClinicalReportStudent(null)}
                  style={{
                    background: 'var(--sidebar-bg)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Patient Identity & Submission Timestamp */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'var(--sidebar-bg)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem'
                  }}>
                    {clinicalReportStudent.avatar}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {report.studentName}
                    </h2>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {report.studentAnonId} • {report.department} ({report.year})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Verified Email: {report.studentEmail} • Submitted: {new Date(report.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Triage Risk Stratification
                  </div>
                  <span style={{
                    background: badgeBg,
                    color: badgeColor,
                    padding: '6px 16px',
                    borderRadius: '100px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    letterSpacing: '0.4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: badgeColor }} />
                    {report.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
              </div>

              {/* Suicide / Self-Harm Safety Alert Callout if Q9 Flagged */}
              {hasSafetyAlert && (
                <div style={{
                  background: 'rgba(235, 87, 87, 0.1)',
                  border: '1.5px solid var(--coral)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <AlertTriangle size={20} color="var(--coral)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--coral)' }}>
                      CRITICAL SAFETY ALERT: Suicidal / Self-Harm Ideation Endorsement (PHQ-9 Question 9)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '3px', lineHeight: 1.45 }}>
                      The student endorsed having thoughts that they would be "better off dead, or hurting themselves". Immediate clinical triage protocol is triggered: verify immediate safety, review support systems, and schedule a priority 1:1 consultation.
                    </div>
                  </div>
                </div>
              )}

              {/* Informational Privacy Note Banner */}
              <div style={{
                background: 'var(--sidebar-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}>
                <Info size={16} color="var(--brand-blue)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Student Safeguard Active:</strong> To prevent diagnostic anxiety and clinical stigmatization, these standardized scores and severity ratings are <strong>strictly hidden from the student</strong>. The student received a calming self-care summary with breathing exercises.
                </span>
              </div>

              {/* Clinical Tri-Metric Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                marginBottom: '24px'
              }}>
                {/* PHQ-9 Card */}
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '16px',
                  borderTop: '4px solid var(--coral)',
                  boxShadow: 'var(--shadow-subtle)'
                }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    PHQ-9 Depression Screener
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 4px' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--coral)' }}>
                      {report.phq9.score}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 27</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {report.phq9.severity}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Cutoffs: 0-4 Min • 5-9 Mild • 10-14 Mod • 15-19 Mod-Sev • 20+ Sev
                  </div>
                </div>

                {/* GAD-7 Card */}
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '16px',
                  borderTop: '4px solid var(--orange)',
                  boxShadow: 'var(--shadow-subtle)'
                }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    GAD-7 Anxiety Screener
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 4px' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--orange)' }}>
                      {report.gad7.score}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 21</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {report.gad7.severity}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Cutoffs: 0-4 Min • 5-9 Mild • 10-14 Mod • 15-21 Severe
                  </div>
                </div>

                {/* Academic Stress Card */}
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '16px',
                  borderTop: '4px solid var(--teal)',
                  boxShadow: 'var(--shadow-subtle)'
                }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Psychometric Academic Stress
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 4px' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--teal)' }}>
                      {report.stressScore}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 10</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {report.stressScore >= 8 ? 'High Academic Distress' : report.stressScore >= 5 ? 'Moderate Academic Strain' : 'Well-Balanced'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Domains: Workload, Exam Panic, Imposter Syndrome, Sleep
                  </div>
                </div>
              </div>

              {/* Interactive Tabs for Itemized Review */}
              <div style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid var(--border)',
                marginBottom: '16px',
                paddingBottom: '2px'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveReportTab('phq9')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    borderBottom: activeReportTab === 'phq9' ? '2.5px solid var(--coral)' : '2.5px solid transparent',
                    background: activeReportTab === 'phq9' ? 'var(--sidebar-bg)' : 'transparent',
                    color: activeReportTab === 'phq9' ? 'var(--coral)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  PHQ-9 Depression Screener ({report.phq9?.answers?.length || 9} Items)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveReportTab('gad7')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    borderBottom: activeReportTab === 'gad7' ? '2.5px solid var(--orange)' : '2.5px solid transparent',
                    background: activeReportTab === 'gad7' ? 'var(--sidebar-bg)' : 'transparent',
                    color: activeReportTab === 'gad7' ? 'var(--orange)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  GAD-7 Anxiety Scale ({report.gad7?.answers?.length || 7} Items)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveReportTab('psychometrics')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    borderBottom: activeReportTab === 'psychometrics' ? '2.5px solid var(--teal)' : '2.5px solid transparent',
                    background: activeReportTab === 'psychometrics' ? 'var(--sidebar-bg)' : 'transparent',
                    color: activeReportTab === 'psychometrics' ? 'var(--teal)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Academic Stress Subscale ({report.psychometrics?.answers?.length || 5} Items)
                </button>
              </div>

              {/* Itemized Question & Response Table */}
              <div style={{
                background: 'var(--sidebar-bg)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                overflow: 'hidden',
                marginBottom: '24px'
              }}>
                {activeReportTab === 'phq9' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px 14px', width: '40px' }}>#</th>
                        <th style={{ padding: '12px 14px' }}>Clinical Prompt (Past 2 Weeks)</th>
                        <th style={{ padding: '12px 14px', width: '180px' }}>Student Response</th>
                        <th style={{ padding: '12px 14px', width: '70px', textAlign: 'center' }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.phq9.answers.map((item, idx) => {
                        const isQ9 = idx === 8;
                        const isHighlighted = item.score >= 2 || (isQ9 && item.score > 0);
                        return (
                          <tr 
                            key={idx} 
                            style={{ 
                              borderBottom: '1px solid var(--border-light)',
                              background: isQ9 && item.score > 0 ? 'rgba(235, 87, 87, 0.08)' : isHighlighted ? 'rgba(242, 153, 74, 0.05)' : 'transparent'
                            }}
                          >
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-muted)' }}>
                              Q{idx + 1}
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                              {item.question}
                              {isQ9 && item.score > 0 && (
                                <span style={{
                                  display: 'inline-block',
                                  marginLeft: '8px',
                                  background: 'var(--coral)',
                                  color: '#fff',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: '4px'
                                }}>
                                  SELF-HARM FLAG
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 600, color: item.score >= 2 ? 'var(--coral)' : 'var(--text-primary)' }}>
                              {item.label}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: item.score >= 2 ? 'var(--coral)' : 'var(--text-secondary)' }}>
                              +{item.score}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {activeReportTab === 'gad7' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px 14px', width: '40px' }}>#</th>
                        <th style={{ padding: '12px 14px' }}>Clinical Prompt (Past 2 Weeks)</th>
                        <th style={{ padding: '12px 14px', width: '180px' }}>Student Response</th>
                        <th style={{ padding: '12px 14px', width: '70px', textAlign: 'center' }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.gad7.answers.map((item, idx) => {
                        const isHighlighted = item.score >= 2;
                        return (
                          <tr 
                            key={idx} 
                            style={{ 
                              borderBottom: '1px solid var(--border-light)',
                              background: isHighlighted ? 'rgba(242, 153, 74, 0.05)' : 'transparent'
                            }}
                          >
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-muted)' }}>
                              Q{idx + 1}
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                              {item.question}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 600, color: item.score >= 2 ? 'var(--orange)' : 'var(--text-primary)' }}>
                              {item.label}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: item.score >= 2 ? 'var(--orange)' : 'var(--text-secondary)' }}>
                              +{item.score}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {activeReportTab === 'psychometrics' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px 14px', width: '140px' }}>Stress Domain</th>
                        <th style={{ padding: '12px 14px' }}>Diagnostic Indicator</th>
                        <th style={{ padding: '12px 14px', width: '160px' }}>Student Rating</th>
                        <th style={{ padding: '12px 14px', width: '70px', textAlign: 'center' }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.psychometrics.answers.map((item, idx) => {
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--brand-blue)' }}>
                              {item.domain}
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                              {item.question}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {item.label}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: 'var(--teal)' }}>
                              {item.score}/5
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Counselor Action Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)'
              }}>
                <button
                  type="button"
                  onClick={() => setClinicalReportStudent(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    padding: '9px 18px',
                    borderRadius: '100px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Close Dossier
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteModalStudent(clinicalReportStudent);
                      setClinicalReportStudent(null);
                    }}
                    style={{
                      background: 'var(--teal-pale)',
                      color: 'var(--teal)',
                      border: '1px solid rgba(50, 165, 178, 0.3)',
                      padding: '9px 18px',
                      borderRadius: '100px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={15} />
                    <span>Log Clinical Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleStartVideoConsult(clinicalReportStudent);
                      setClinicalReportStudent(null);
                    }}
                    style={{
                      background: 'var(--brand-blue)',
                      color: '#fff',
                      border: 'none',
                      padding: '9px 20px',
                      borderRadius: '100px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      boxShadow: '0 4px 14px rgba(38, 118, 166, 0.3)'
                    }}
                  >
                    <Video size={16} />
                    <span>Start 1:1 Video Consultation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
