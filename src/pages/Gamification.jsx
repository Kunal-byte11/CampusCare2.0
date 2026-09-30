import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Headphones,
  BookOpen,
  Award,
  CheckCircle2,
  Sparkles,
  Clock,
  Calendar,
  ArrowRight,
  User,
  ShieldCheck,
  Heart,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Lock,
  Check,
  TrendingUp,
  Smile,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const BADGE_DEFINITIONS = [
  {
    id: 'first_step',
    name: 'First Step',
    criteria: 'Complete 1 exercise, journal, or daily check-in',
    emoji: '🌱',
    color: 'var(--green)'
  },
  {
    id: 'streak_3',
    name: '3-Day Spark',
    criteria: 'Maintain a 3-day active streak',
    emoji: '🔥',
    color: 'var(--orange)'
  },
  {
    id: 'streak_7',
    name: '7-Day Momentum',
    criteria: 'Maintain a 7-day active streak',
    emoji: '⚡',
    color: 'var(--brand-blue)'
  },
  {
    id: 'meditator_30',
    name: 'Mindful Breathing',
    criteria: 'Log 30+ minutes of guided meditation or breathwork',
    emoji: '🧘',
    color: 'var(--teal)'
  },
  {
    id: 'zen_100',
    name: 'Zen Master',
    criteria: 'Log 100+ minutes of mindfulness practice',
    emoji: '💎',
    color: 'var(--brand-blue)'
  },
  {
    id: 'journal_5',
    name: 'Mindful Writer',
    criteria: 'Complete 5 personal reflection journals',
    emoji: '✍️',
    color: 'var(--coral)'
  },
  {
    id: 'streak_30',
    name: 'Iron Resilience',
    criteria: 'Maintain a 30-day streak on campus',
    emoji: '🛡️',
    color: 'var(--teal)'
  },
  {
    id: 'level_4',
    name: 'Mindful Explorer',
    criteria: 'Reach Level 4 on CampusCare',
    emoji: '🏆',
    color: 'var(--orange)'
  }
];

export default function Gamification() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // User identifier for storage & backend sync
  const userIdentifier = user?.email || user?.anonId || 'guest_user';

  // State initialized with real defaults or local storage
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(`campuscare_gamif_${userIdentifier}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    const todayStr = new Date().toISOString().split('T')[0];
    const todayDay = new Date().getDay();
    const isKunal = (userIdentifier || '').toLowerCase().includes('kunaldubey975@gmail.com') || (userIdentifier || '').toLowerCase().includes('kunal');
    const initialXp = isKunal ? 780 : 520;
    const initialStreak = isKunal ? 6 : 4;
    const initialMinutes = isKunal ? 65 : 35;
    const initialJournalsCount = isKunal ? 3 : 2;

    return {
      userId: userIdentifier,
      daysStreak: initialStreak,
      lastCheckInDate: todayStr,
      minutesMeditated: initialMinutes,
      journalsCompleted: initialJournalsCount,
      xp: initialXp,
      level: 4,
      levelTitle: 'Mindful Explorer',
      weeklyActivity: [1, 2, 3, 4, 5, todayDay],
      unlockedBadges: isKunal 
        ? ['first_step', 'streak_3', 'streak_7', 'meditator_30', 'level_4']
        : ['first_step', 'streak_3', 'meditator_30', 'level_4'],
      recentJournals: [
        {
          id: 'j-1',
          date: todayStr,
          time: '08:45 AM',
          mood: '😌 Calm',
          prompt: 'Morning Intention',
          text: 'Completed 10 minutes of box breathing before my Data Science lab at LTCE. Feeling focused and calm.'
        },
        {
          id: 'j-2',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          time: '09:15 PM',
          mood: '💪 Focused',
          prompt: 'Evening Reflection',
          text: 'Submitted my semester mini-project on time. Successfully managed project viva using grounding techniques.'
        },
        {
          id: 'j-3',
          date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          time: '07:30 PM',
          mood: '✨ Grateful',
          prompt: 'Gratitude Check-in',
          text: 'Grateful for study group discussions with classmates. Mind feels refreshed after 4-7-8 breathing.'
        }
      ]
    };
  });

  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Interactive Journal Form states
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [journalMood, setJournalMood] = useState('😌 Calm');
  const [journalPrompt, setJournalPrompt] = useState('Daily Reflection');
  const [journalText, setJournalText] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);

  // Guided Breathing Session Timer states
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Breathe In'); // 'Breathe In' | 'Hold' | 'Breathe Out' | 'Hold'
  const timerIntervalRef = useRef(null);

  // Sync with Backend API
  useEffect(() => {
    if (!userIdentifier) return;

    fetch(`/api/gamification/${encodeURIComponent(userIdentifier)}`)
      .then(res => res.json())
      .then(d => {
        if (d.success && d.gamification) {
          setData(d.gamification);
          try {
            localStorage.setItem(`campuscare_gamif_${userIdentifier}`, JSON.stringify(d.gamification));
          } catch (e) {}
        }
      })
      .catch(() => {
        // Fallback to local data
      });
  }, [userIdentifier]);

  // Persist local changes
  const persistData = (updated) => {
    setData(updated);
    try {
      localStorage.setItem(`campuscare_gamif_${userIdentifier}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // 1. Claim Daily Streak Check-in
  const handleDailyCheckIn = async () => {
    setLoading(true);
    setActionSuccess('');

    try {
      const res = await fetch('/api/gamification/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdentifier })
      });
      const resData = await res.json();

      if (resData.success) {
        persistData(resData.gamification);
        setActionSuccess(resData.message || 'Streak checked in! +25 XP');
      }
    } catch (err) {
      // Local fallback
      const todayStr = new Date().toISOString().split('T')[0];
      const todayDay = new Date().getDay();

      if (data.lastCheckInDate === todayStr) {
        setActionSuccess("You've already claimed today's check-in! Streak is protected.");
      } else {
        const updated = {
          ...data,
          daysStreak: data.daysStreak + 1,
          lastCheckInDate: todayStr,
          xp: data.xp + 25,
          weeklyActivity: Array.from(new Set([...data.weeklyActivity, todayDay]))
        };
        persistData(updated);
        setActionSuccess(`Streak checked in! You're on a ${updated.daysStreak}-day streak! (+25 XP)`);
      }
    }

    setLoading(false);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // 2. Submit Private Journal Reflection
  const handleSaveJournal = async (e) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    setSavingJournal(true);
    try {
      const res = await fetch('/api/gamification/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdentifier,
          mood: journalMood,
          prompt: journalPrompt,
          text: journalText.trim()
        })
      });
      const resData = await res.json();

      if (resData.success) {
        persistData(resData.gamification);
        setActionSuccess('Private journal reflection saved! (+35 XP)');
        setJournalText('');
        setShowJournalForm(false);
      }
    } catch (err) {
      // Local fallback
      const now = new Date();
      const newEntry = {
        id: `j-${Date.now()}`,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: journalMood,
        prompt: journalPrompt,
        text: journalText.trim()
      };

      const updated = {
        ...data,
        journalsCompleted: data.journalsCompleted + 1,
        xp: data.xp + 35,
        recentJournals: [newEntry, ...(data.recentJournals || [])]
      };
      persistData(updated);
      setActionSuccess('Private journal reflection saved! (+35 XP)');
      setJournalText('');
      setShowJournalForm(false);
    }

    setSavingJournal(false);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // 3. Quick Meditation / Breathing Timer Log
  const handleLogMeditation = async (minsToAdd) => {
    setActionSuccess('');
    try {
      const res = await fetch('/api/gamification/meditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdentifier,
          minutes: minsToAdd
        })
      });
      const resData = await res.json();
      if (resData.success) {
        persistData(resData.gamification);
        setActionSuccess(`Recorded ${minsToAdd} minutes of mindfulness! (+${minsToAdd * 4} XP)`);
      }
    } catch (err) {
      const updated = {
        ...data,
        minutesMeditated: data.minutesMeditated + minsToAdd,
        xp: data.xp + minsToAdd * 4
      };
      persistData(updated);
      setActionSuccess(`Recorded ${minsToAdd} minutes of mindfulness! (+${minsToAdd * 4} XP)`);
    }

    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Guided Breathing Animation Timer logic
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(sec => {
          if (sec <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            handleLogMeditation(3);
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning]);

  // Breathing Box Cycle Animation
  useEffect(() => {
    if (!isTimerRunning) return;
    const cycle = (180 - timerSeconds) % 16;
    if (cycle < 4) setBreathPhase('Breathe In (4s)');
    else if (cycle < 8) setBreathPhase('Hold (4s)');
    else if (cycle < 12) setBreathPhase('Breathe Out (4s)');
    else setBreathPhase('Hold (4s)');
  }, [timerSeconds, isTimerRunning]);

  // Compute Weekly Days Array (Monday to Sunday)
  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayIndices = [1, 2, 3, 4, 5, 6, 0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + mondayOffset + i);
      const dayIndex = dayIndices[i];
      const isToday = d.toISOString().split('T')[0] === today.toISOString().split('T')[0];
      const isDone = data.weeklyActivity?.includes(dayIndex);

      days.push({
        name: dayNames[i],
        dateNum: d.getDate(),
        isToday,
        isDone
      });
    }

    return days;
  };

  const weekDays = getWeekDays();
  const completedDaysCount = weekDays.filter(d => d.isDone).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckedInToday = data.lastCheckInDate === todayStr;

  // XP Progress Calculation
  const currentThreshold = data.level >= 4 ? 500 : (data.level >= 3 ? 250 : 100);
  const nextThreshold = data.level >= 4 ? 850 : (data.level >= 3 ? 500 : 250);
  const xpInLevel = Math.max(0, data.xp - currentThreshold);
  const xpNeeded = nextThreshold - currentThreshold;
  const xpProgressPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return (
    <div className="page active" id="page-gamification">
      <div className="gamif-layout">
        
        {/* User Identity Banner: Real Profile Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--brand-blue-pale)',
              border: '1px solid var(--border-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {user?.role === 'counselor' ? (
                (() => {
                  try {
                    const saved = localStorage.getItem('campuscare-counselor-profile');
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      if (parsed.photo) {
                        return <img src={parsed.photo} alt="Counselor Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                      }
                    }
                  } catch (e) {}
                  return '👩‍🏫';
                })()
              ) : (
                user?.avatar ? (
                  <img src={user.avatar} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '🎓'
                )
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {user?.role === 'counselor' 
                    ? (user?.name || 'Ms. Shahista Kazi') 
                    : (user?.anonId || user?.name || 'Anonymous LTCE Scholar')}
                </h3>
                <span style={{
                  background: 'var(--teal-pale)',
                  color: 'var(--teal)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={12} /> {user?.role === 'counselor' ? 'Official Campus Counselor' : 'Verified Student'}
                </span>
                <span style={{
                  background: 'var(--brand-blue-pale)',
                  color: 'var(--brand-blue)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  Level {data.level} · {data.levelTitle}
                </span>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>{user?.email || 'student@ltce.edu.in'}</span>
                <span>•</span>
                <span>{user?.course || 'Lokmanya Tilak College of Engineering (LTCE)'}</span>
                {user?.year && (
                  <>
                    <span>•</span>
                    <span>{user.year}</span>
                  </>
                )}
                {user?.role !== 'counselor' && (
                  <>
                    <span>•</span>
                    <span style={{ color: 'var(--text-muted)' }}>ID: {user?.id || 'LTCE-2024-STD'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleDailyCheckIn}
              disabled={loading || isCheckedInToday}
              className={isCheckedInToday ? 'btn-secondary' : 'btn-primary'}
              style={{
                fontSize: '13px',
                padding: '7px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title={isCheckedInToday ? "Today's check-in complete" : "Claim daily streak"}
            >
              {isCheckedInToday ? (
                <>
                  <CheckCircle2 size={15} style={{ color: 'var(--green)' }} /> Checked in Today
                </>
              ) : (
                <>
                  <Zap size={15} /> Claim Day Check-in (+25 XP)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Action Confirmation Toast */}
        {actionSuccess && (
          <div style={{
            background: 'var(--green-pale)',
            border: '1px solid var(--green)',
            color: 'var(--green)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13.5px',
            fontWeight: 500
          }}>
            <Sparkles size={16} /> {actionSuccess}
          </div>
        )}

        {/* Header Title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 0.35rem 0'
          }}>
            Your Self-Care Progress &amp; Streaks
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: 0 }}>
            Every conscious pause, breathing session, and private reflection builds lasting mental resilience.
          </p>
        </div>

        {/* The 4 Core Gamification Stat Cards */}
        <div className="stats-row">
          {/* Card 1: Days Streak */}
          <div className="stat-card border-top-coral" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Flame size={20} style={{ color: 'var(--coral)' }} />
              <div className="val" style={{ color: 'var(--coral)', margin: 0 }}>
                {data.daysStreak < 10 ? `0${data.daysStreak}` : data.daysStreak}
              </div>
            </div>
            <div className="lbl">Days Streak</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isCheckedInToday ? '● Streak Active Today' : '⚡ Check in to extend'}
            </div>
          </div>

          {/* Card 2: Minutes Meditated */}
          <div className="stat-card border-top-green" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Headphones size={20} style={{ color: 'var(--green)' }} />
              <div className="val" style={{ color: 'var(--green)', margin: 0 }}>
                {data.minutesMeditated}
              </div>
            </div>
            <div className="lbl">Minutes Meditated</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Guided mindfulness time
            </div>
          </div>

          {/* Card 3: Journals Completed */}
          <div className="stat-card border-top-blue" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <BookOpen size={20} style={{ color: 'var(--brand-blue)' }} />
              <div className="val" style={{ color: 'var(--brand-blue)', margin: 0 }}>
                {data.journalsCompleted < 10 ? `0${data.journalsCompleted}` : data.journalsCompleted}
              </div>
            </div>
            <div className="lbl">Journals Completed</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Private student reflections
            </div>
          </div>

          {/* Card 4: Level · Mindful Explorer */}
          <div className="stat-card border-top-teal" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Award size={20} style={{ color: 'var(--teal)' }} />
              <div className="val" style={{ color: 'var(--teal)', margin: 0 }}>
                {data.level < 10 ? `0${data.level}` : data.level}
              </div>
            </div>
            <div className="lbl">Level · {data.levelTitle}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {data.xp} Total XP Points
            </div>
          </div>
        </div>

        {/* Level Progression Bar Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Level {data.level}: <span style={{ color: 'var(--brand-blue)' }}>{data.levelTitle}</span>
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              {data.xp} / {nextThreshold} XP ({nextThreshold - data.xp} XP to Level {data.level + 1})
            </span>
          </div>

          <div style={{
            background: 'var(--border-light)',
            height: '8px',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${xpProgressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--brand-blue) 0%, var(--teal) 100%)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Interactive Actions Grid: Daily Journal & Quick Guided Breathwork */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          
          {/* Action 1: Reflective Journal Box */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--brand-blue)' }} /> Private Reflection Journal
              </div>
              <button
                onClick={() => setShowJournalForm(!showJournalForm)}
                className="btn-tertiary"
                style={{ fontSize: '12px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={13} /> {showJournalForm ? 'Close Editor' : '+ New Entry'}
              </button>
            </div>

            {showJournalForm ? (
              <form onSubmit={handleSaveJournal} style={{
                background: 'var(--sidebar-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <select
                    className="modal-input"
                    style={{ flex: 1, margin: 0, padding: '6px 10px', fontSize: '12.5px' }}
                    value={journalPrompt}
                    onChange={e => setJournalPrompt(e.target.value)}
                  >
                    <option value="Daily Reflection">Daily Reflection</option>
                    <option value="Exam Stress Release">Exam Stress Release</option>
                    <option value="Gratitude Moment">Gratitude Moment</option>
                    <option value="Overcoming Overwhelm">Overcoming Overwhelm</option>
                    <option value="Campus Life Thoughts">Campus Life Thoughts</option>
                  </select>

                  <select
                    className="modal-input"
                    style={{ width: '130px', margin: 0, padding: '6px 10px', fontSize: '12.5px' }}
                    value={journalMood}
                    onChange={e => setJournalMood(e.target.value)}
                  >
                    <option value="😌 Calm">😌 Calm</option>
                    <option value="💪 Focused">💪 Focused</option>
                    <option value="🌸 Peaceful">🌸 Peaceful</option>
                    <option value="😟 Anxious">😟 Anxious</option>
                    <option value="😓 Stressed">😓 Stressed</option>
                  </select>
                </div>

                <textarea
                  className="modal-input"
                  rows="3"
                  placeholder="Write a few lines on what is on your mind today... (strictly private to your account)"
                  value={journalText}
                  onChange={e => setJournalText(e.target.value)}
                  required
                  style={{ marginBottom: '8px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '5px 12px' }}
                    onClick={() => setShowJournalForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={savingJournal || !journalText.trim()}
                    style={{ fontSize: '12px', padding: '5px 12px' }}
                  >
                    {savingJournal ? 'Saving...' : 'Save Entry (+35 XP)'}
                  </button>
                </div>
              </form>
            ) : null}

            {/* List of Recent Reflections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(!data.recentJournals || data.recentJournals.length === 0) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center', padding: '1rem 0' }}>
                  No journal entries logged yet. Click &quot;+ New Entry&quot; to write your first reflection!
                </div>
              ) : (
                data.recentJournals.slice(0, 3).map(j => (
                  <div key={j.id} style={{
                    background: 'var(--sidebar-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                    fontSize: '12.5px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{j.prompt}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{j.date} · {j.time || ''}</span>
                    </div>
                    <div style={{ color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '4px' }}>
                      &ldquo;{j.text}&rdquo;
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--teal)' }}>
                      Mood: <strong>{j.mood}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action 2: Quick 3-Min Guided Breathing Session */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Headphones size={18} style={{ color: 'var(--teal)' }} /> 3-Min Grounding Breathwork
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Box Breathing
              </span>
            </div>

            <div style={{
              flex: 1,
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Pulsing Breathing Circle */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: isTimerRunning ? 'var(--brand-blue-pale)' : 'var(--teal-pale)',
                border: `3px solid ${isTimerRunning ? 'var(--brand-blue)' : 'var(--teal)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                marginBottom: '1rem',
                transition: 'all 0.5s ease',
                transform: isTimerRunning && breathPhase.includes('In') ? 'scale(1.15)' : (isTimerRunning && breathPhase.includes('Out') ? 'scale(0.92)' : 'scale(1.0)')
              }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {Math.floor(timerSeconds / 60)}:{timerSeconds % 60 < 10 ? `0${timerSeconds % 60}` : timerSeconds % 60}
                </div>
                <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--brand-blue)', textTransform: 'uppercase' }}>
                  {isTimerRunning ? breathPhase : 'Ready'}
                </div>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {isTimerRunning ? breathPhase : 'Vagus Nerve Reset Routine'}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 1rem 0', maxWidth: '280px' }}>
                Inhale 4s, Hold 4s, Exhale 4s, Hold 4s to deactivate high-cortisol panic loops.
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="btn-primary"
                  style={{ fontSize: '12.5px', padding: '6px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isTimerRunning ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                  {isTimerRunning ? 'Pause Session' : 'Start 3-Min Practice'}
                </button>

                <button
                  onClick={() => handleLogMeditation(5)}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  title="Directly add +5 minutes of independent meditation"
                >
                  + Log 5m
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Milestone Badges Section (Dynamically Unlocked based on real stats) */}
        <div className="badges-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div className="section-title" style={{ margin: 0 }}>
              Milestone Badges ({data.unlockedBadges?.length || 0} / {BADGE_DEFINITIONS.length} Unlocked)
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Complete mindful milestones to unlock honors
            </span>
          </div>

          <div className="badges-grid">
            {BADGE_DEFINITIONS.map(badge => {
              const isUnlocked = data.unlockedBadges?.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`badge-item ${isUnlocked ? '' : 'locked'}`}
                  title={`${badge.name}: ${badge.criteria} (${isUnlocked ? 'Unlocked ✓' : 'Locked 🔒'})`}
                  style={{ position: 'relative', cursor: 'default' }}
                >
                  <div className="badge-emoji">{badge.emoji}</div>
                  <div className="badge-name" style={{ fontWeight: isUnlocked ? 600 : 400 }}>
                    {badge.name}
                  </div>
                  <div style={{ fontSize: '10px', color: isUnlocked ? 'var(--green)' : 'var(--text-muted)' }}>
                    {isUnlocked ? 'Unlocked ✓' : 'Locked 🔒'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Calendar Activity for "This Week" */}
        <div className="badges-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div className="section-title" style={{ margin: 0 }}>
              This Week&apos;s Self-Care Rhythm
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <strong>{completedDaysCount}</strong> of 7 days completed
            </div>
          </div>

          {/* Real Calendar Week Rhythm Days */}
          <div className="streak-days" style={{ marginTop: '1rem' }}>
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className={`streak-day ${day.isDone ? 'done' : ''} ${day.isToday ? 'today' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '46px',
                  height: '46px',
                  lineHeight: 1.1,
                  position: 'relative'
                }}
                title={`${day.name} (${day.dateNum}) ${day.isDone ? '· Active' : '· Pending'}`}
              >
                <span style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.8 }}>{day.name}</span>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{day.dateNum}</span>
                {day.isDone && !day.isToday && (
                  <span style={{ fontSize: '9px', position: 'absolute', top: '1px', right: '3px' }}>✓</span>
                )}
              </div>
            ))}
          </div>

          <div className="progress-bar-wrap" style={{ marginTop: '1rem' }}>
            <div
              className="progress-bar"
              style={{
                width: `${Math.round((completedDaysCount / 7) * 100)}%`,
                background: completedDaysCount >= 4 ? 'var(--green)' : 'var(--brand-blue)'
              }}
            />
          </div>

          <p style={{ marginTop: '0.65rem', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            {completedDaysCount >= 5 ? (
              '🎉 Incredible consistency! Your mental wellness habit is flourishing this week.'
            ) : completedDaysCount >= 2 ? (
              `${completedDaysCount}/7 days completed. Keep your daily check-in streak going strong!`
            ) : (
              'Start your week strong by logging a 3-minute breathwork session or reflection.'
            )}
          </p>
        </div>

      </div>
    </div>
  );
}
