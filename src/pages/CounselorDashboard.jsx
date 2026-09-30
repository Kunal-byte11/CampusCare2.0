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
  Check
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

    </div>
  );
}
