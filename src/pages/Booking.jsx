import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CounselorNotes from '../components/CounselorNotes';

const counselorProfile = {
  name: 'Ms. Shahista Kazi',
  role: 'Student Counselor & Wellness Officer',
  institution: 'Lokmanya Tilak College of Engineering (LTCE)',
  lang: 'English · Hindi · Marathi',
  tags: ['Academic Stress', 'Anxiety', 'Stress Management', 'Emotional Well-being', 'Personal Guidance'],
  slots: 'Monday to Friday · 10:00 AM – 4:00 PM (Confidential Room, LTCE Campus)',
  emoji: '👩‍🏫',
  color: '#ffffff',
};

export default function Booking({ openModal }) {
  const { isAuthenticated, user } = useAuth();
  const isCounselor = user?.role === 'counselor';
  const location = useLocation();
  const navigate = useNavigate();

  // Route & Tab state for Counselor Desk
  const isNotesRoute =
    location.pathname === '/counselor-notes' ||
    location.pathname === '/notes' ||
    location.pathname === '/counselor/notes';

  const [counselorPortalTab, setCounselorPortalTab] = useState(isNotesRoute ? 'notes' : 'appointments');
  const [selectedStudentForNotes, setSelectedStudentForNotes] = useState(null);

  useEffect(() => {
    if (
      location.pathname === '/counselor-notes' ||
      location.pathname === '/notes' ||
      location.pathname === '/counselor/notes'
    ) {
      setCounselorPortalTab('notes');
    } else if (
      location.pathname === '/booking' ||
      location.pathname === '/appointments' ||
      location.pathname === '/counselor' ||
      location.pathname === '/counselor-dashboard' ||
      location.pathname === '/counselor/dashboard' ||
      location.pathname === '/counselor/appointments'
    ) {
      setCounselorPortalTab('appointments');
    }
  }, [location.pathname]);

  // Student booking states & session history
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedSlot, setSelectedSlot] = useState('Today at 2:00 PM');
  const [studentBookingMsg, setStudentBookingMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mySessions, setMySessions] = useState([]);
  const [mySessionStats, setMySessionStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    activeSessions: 0,
    cancelledSessions: 0
  });
  const [loadingMySessions, setLoadingMySessions] = useState(false);
  const [sessionLogFilter, setSessionLogFilter] = useState('All');
  const [cancellingSessionId, setCancellingSessionId] = useState(null);

  // Counselor dashboard states
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayBookings: 0,
    monthlyCompleted: 0,
    totalStudentsConnected: 0,
    activeSessions: 0,
    totalBookings: 0
  });
  const [counselorFilter, setCounselorFilter] = useState('All');
  const [loadingDesk, setLoadingDesk] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  // Counselor & Student connection states
  const [counselorInfo, setCounselorInfo] = useState({
    name: 'Ms. Shahista Kazi',
    department: 'Computer Science & Engineering (Data Science)',
    email: 'shahista.kazi@ltce.in',
    role: 'counselor'
  });
  const [connectedStudentModal, setConnectedStudentModal] = useState(null);
  const [directMsgText, setDirectMsgText] = useState('');
  const [directMsgStatus, setDirectMsgStatus] = useState('');

  // Fetch counselor profile on mount
  useEffect(() => {
    fetch('/api/bookings/counselor')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.counselor) {
          setCounselorInfo(d.counselor);
        }
      })
      .catch(() => { });
  }, []);

  const isSameDept = (dept1, dept2) => {
    if (!dept1 || !dept2) return false;
    const a = dept1.toLowerCase().trim();
    const b = dept2.toLowerCase().trim();
    if (a === b) return true;
    if (a.includes('data science') && b.includes('data science')) return true;
    if (a.includes('aiml') && b.includes('aiml')) return true;
    if (a.includes('computer engineering') && b.includes('computer engineering')) return true;
    if (a.includes('iot') && b.includes('iot')) return true;
    return false;
  };

  // Load counselor data when logged in as counselor
  const loadCounselorData = async () => {
    setLoadingDesk(true);
    try {
      const [resAppts, resStats] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/bookings/stats')
      ]);

      const dataAppts = await resAppts.json();
      const dataStats = await resStats.json();

      if (dataAppts.success) {
        setAppointments(dataAppts.appointments || []);
      }
      if (dataStats.success) {
        setStats(dataStats.stats);
      }
    } catch (err) {
      console.error('Failed to load counselor dashboard:', err);
    } finally {
      setLoadingDesk(false);
    }
  };

  useEffect(() => {
    if (isCounselor) {
      loadCounselorData();
    }
  }, [isCounselor]);

  // Student load own counseling sessions & log
  const loadMySessions = async () => {
    if (!isAuthenticated || isCounselor) return;
    setLoadingMySessions(true);
    try {
      const params = new URLSearchParams();
      if (user?.anonId) params.append('studentAnonId', user.anonId);
      if (user?.email) params.append('studentEmail', user.email);
      const res = await fetch(`/api/bookings/my-sessions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMySessions(data.appointments || []);
        if (data.stats) setMySessionStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load student sessions:', err);
    } finally {
      setLoadingMySessions(false);
    }
  };

  useEffect(() => {
    if (!isCounselor && isAuthenticated) {
      loadMySessions();
    }
  }, [isCounselor, isAuthenticated, user?.anonId]);

  // Student cancel session handler
  const handleCancelSession = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this counseling consultation?')) return;
    setCancellingSessionId(id);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        await loadMySessions();
      }
    } catch (err) {
      console.error('Failed to cancel session:', err);
    } finally {
      setCancellingSessionId(null);
    }
  };

  // Student booking handler
  const handleStudentBook = async () => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnonId: user?.anonId || 'anon_scholar',
          studentName: user?.name || 'LTCE Scholar',
          studentEmail: user?.email || '',
          studentCourse: user?.course || 'Computer Engineering',
          studentYear: user?.year || '1st Year',
          slotTime: selectedSlot,
          counselorName: 'Ms. Shahista Kazi'
        })
      });

      const data = await response.json();
      if (data.success) {
        setStudentBookingMsg({
          name: 'Ms. Shahista Kazi',
          slots: selectedSlot,
          id: user?.anonId
        });
        await loadMySessions();
        setTimeout(() => setStudentBookingMsg(null), 8000);
      }
    } catch (err) {
      console.error('Booking submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Counselor update status handler
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a.id.toString() === id.toString() ? { ...a, status: newStatus } : a));
        // Refresh stats
        const resStats = await fetch('/api/bookings/stats');
        const statsData = await resStats.json();
        if (statsData.success) setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Counselor save note handler
  const handleSaveNote = async (id) => {
    setNoteSaving(true);
    try {
      const res = await fetch(`/api/bookings/${id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionNotes: noteText })
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a.id.toString() === id.toString() ? { ...a, session_notes: noteText } : a));
        setActiveNoteId(null);
      }
    } catch (err) {
      console.error('Save notes failed:', err);
    } finally {
      setNoteSaving(false);
    }
  };

  // ==============================================================================
  // VIEW A: COUNSELOR DASHBOARD & CLINICAL SESSION DESK (Ms. Shahista Kazi)
  // ==============================================================================
  if (isCounselor) {
    const counselorDept = user?.course || counselorInfo.department || 'Computer Science & Engineering (Data Science)';

    const filteredAppointments = appointments.filter(a => {
      if (counselorFilter === 'All') return true;
      if (counselorFilter === 'same-dept') {
        return isSameDept(a.student_course, counselorDept);
      }
      return (a.status || '').toLowerCase() === counselorFilter.toLowerCase();
    });

    return (
      <div className="page active" id="page-counselor-dashboard" style={{ paddingBottom: '4rem' }}>
        <div className="booking-layout" style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.3)', padding: '0.35rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', color: 'var(--teal)', fontWeight: 600 }}>
                  <span>👩‍🏫</span> Official LTCE Counseling Desk
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '0.35rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600 }}>
                  <span>🏛️</span> Department: <strong>{counselorDept}</strong>
                </div>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.4rem 0' }}>
                Counselor Session Portal
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
                Welcome, <Link to="/counselor-profile" style={{ color: 'var(--brand-blue)', textDecoration: 'none', fontWeight: 700 }} title="Go to Counselor Profile">Ms. Shahista Kazi ↗</Link>. Manage student consultations, connect directly with students from your department, and record private session notes.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/counselor-profile')}
                className="btn-pill"
                style={{ background: 'var(--brand-blue-pale)', border: '1px solid var(--border)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 600 }}
                title="View Counselor Profile"
              >
                👩‍🏫 Counselor Profile
              </button>
              <button
                onClick={loadCounselorData}
                className="btn-pill"
                style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem' }}
              >
                🔄 Refresh Desk
              </button>
            </div>
          </div>

          {/* View Switcher: Appointments vs Folder-based Notes System */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border)', marginBottom: '1.75rem' }}>
            <button
              onClick={() => {
                setCounselorPortalTab('appointments');
                navigate('/booking');
              }}
              style={{
                padding: '0.85rem 1.4rem',
                background: 'transparent',
                border: 'none',
                borderBottom: counselorPortalTab === 'appointments' ? '3px solid var(--teal)' : '3px solid transparent',
                color: counselorPortalTab === 'appointments' ? 'var(--teal)' : 'var(--text-muted)',
                fontWeight: counselorPortalTab === 'appointments' ? 700 : 500,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                marginBottom: '-2px'
              }}
            >
              <span>📅</span> Consultation Desk &amp; Appointments ({appointments.length})
            </button>

            <button
              onClick={() => {
                setCounselorPortalTab('notes');
                navigate('/counselor-notes');
              }}
              style={{
                padding: '0.85rem 1.4rem',
                background: 'transparent',
                border: 'none',
                borderBottom: counselorPortalTab === 'notes' ? '3px solid var(--teal)' : '3px solid transparent',
                color: counselorPortalTab === 'notes' ? 'var(--teal)' : 'var(--text-muted)',
                fontWeight: counselorPortalTab === 'notes' ? 700 : 500,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                marginBottom: '-2px'
              }}
            >
              <span>📁</span> Clinical Case Folders &amp; Notes System
            </button>
          </div>

          {counselorPortalTab === 'notes' ? (
            <CounselorNotes
              counselorDept={counselorDept}
              counselorName={counselorInfo.name || 'Ms. Shahista Kazi'}
              initialSelectedStudentId={selectedStudentForNotes}
              appointments={appointments}
            />
          ) : (
            <>
              {/* 4 Statistics KPI Cards matching design.md */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

                {/* 1. Today's Bookings - Coral Top Border */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3.5px solid var(--coral)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.4rem', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Booked Today
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px', lineHeight: 1.1 }}>
                    {String(stats.todayBookings).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Scheduled Consultations
                  </div>
                </div>

                {/* 2. Monthly Completed - Green Top Border */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3.5px solid var(--green)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.4rem', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Monthly Sessions Done
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--green)', marginTop: '6px', lineHeight: 1.1 }}>
                    {String(stats.monthlyCompleted).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Completed &amp; Archived
                  </div>
                </div>

                {/* 3. Total Students Connected - Blue Top Border */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3.5px solid var(--brand-blue)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.4rem', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Students
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-blue)', marginTop: '6px', lineHeight: 1.1 }}>
                    {String(stats.totalStudentsConnected).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Scholars in Intake
                  </div>
                </div>

                {/* 4. Active Consultations - Teal Top Border */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3.5px solid var(--teal)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.4rem', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Active Sessions
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--teal)', marginTop: '6px', lineHeight: 1.1 }}>
                    {String(stats.activeSessions).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    In-progress / Pending
                  </div>
                </div>

              </div>

              {/* Filter Bar with Department Connection tab */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'All', label: 'All Sessions' },
                    { id: 'same-dept', label: `⭐ My Department (${counselorDept.includes('Data Science') ? 'CSE Data Science' : counselorDept})` },
                    { id: 'confirmed', label: 'Confirmed' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'cancelled', label: 'Cancelled' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setCounselorFilter(f.id)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: counselorFilter === f.id ? (f.id === 'same-dept' ? '#f59e0b' : 'var(--teal)') : 'var(--border)',
                        background: counselorFilter === f.id ? (f.id === 'same-dept' ? 'rgba(245, 158, 11, 0.18)' : 'var(--teal-soft)') : 'var(--bg-card)',
                        color: counselorFilter === f.id ? (f.id === 'same-dept' ? '#fbbf24' : 'var(--teal)') : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing {filteredAppointments.length} appointment{filteredAppointments.length === 1 ? '' : 's'}
                </div>
              </div>

              {/* Appointments List */}
              {loadingDesk ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading counselor records...
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No student appointments found matching the selected filter.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredAppointments.map((appt) => {
                    const isEditingNote = activeNoteId === appt.id;
                    const matchesDept = isSameDept(appt.student_course, counselorDept);

                    return (
                      <div
                        key={appt.id}
                        style={{
                          background: 'var(--bg-card)',
                          border: matchesDept ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border)',
                          borderRadius: '16px',
                          padding: '1.25rem 1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          transition: 'border-color 0.2s ease',
                          boxShadow: matchesDept ? '0 4px 20px rgba(245, 158, 11, 0.08)' : 'none'
                        }}
                      >
                        {/* Top Row: Student Name, Details & Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                          <div>
                            {/* Student Name clearly visible to counselor */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                                {appt.student_name}
                              </h3>
                              <span style={{ fontSize: '0.78rem', background: 'var(--bg-card2)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '6px', color: 'var(--teal)', fontFamily: 'monospace' }}>
                                {appt.student_anon_id}
                              </span>
                              {matchesDept && (
                                <span style={{
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  border: '1px solid rgba(245, 158, 11, 0.4)',
                                  color: '#fbbf24',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  ⭐ Same Department ({appt.student_course})
                                </span>
                              )}
                            </div>

                            {/* Department, Year & Email */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                              <span>🎓 <strong>{appt.student_course}</strong></span>
                              <span>•</span>
                              <span>{appt.student_year}</span>
                              {appt.student_email && (
                                <>
                                  <span>•</span>
                                  <span>✉️ {appt.student_email}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Right: Slot & Status Badge */}
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: appt.status === 'completed' ? 'rgba(52, 211, 153, 0.15)' : appt.status === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: appt.status === 'completed' ? '#34d399' : appt.status === 'cancelled' ? '#f87171' : '#60a5fa',
                              border: '1px solid',
                              borderColor: appt.status === 'completed' ? 'rgba(52, 211, 153, 0.3)' : appt.status === 'cancelled' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'
                            }}>
                              ● {appt.status || 'Confirmed'}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>
                              📅 {appt.slot_time}
                            </span>
                          </div>
                        </div>

                        {/* Counselor Actions Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '0.9rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Primary 1:1 Video Call Action */}
                            <button
                              onClick={() => {
                                handleUpdateStatus(appt.id, 'confirmed');
                                const channelId = `session-${appt.student_anon_id || appt.id}`.replace(/[^a-zA-Z0-9-_]/g, '-');
                                navigate(`/video-call?channel=${encodeURIComponent(channelId)}&role=counselor&student=${encodeURIComponent(appt.student_name || 'Student')}`);
                              }}
                              style={{
                                padding: '0.45rem 1rem',
                                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                                border: 'none',
                                color: '#ffffff',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                              }}
                              title="Accept student booking and start 1:1 live consultation"
                            >
                              <span>📹</span> Accept &amp; Start 1:1 Video
                            </button>

                            {appt.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'completed')}
                                style={{ padding: '0.4rem 0.8rem', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                ✓ Done
                              </button>
                            )}
                            {appt.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                                style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedStudentForNotes(appt.student_anon_id);
                                setCounselorPortalTab('notes');
                                navigate('/counselor-notes');
                              }}
                              style={{
                                padding: '0.4rem 0.85rem',
                                borderRadius: '8px',
                                background: 'rgba(245, 158, 11, 0.12)',
                                border: '1px solid rgba(245, 158, 11, 0.35)',
                                color: '#fbbf24',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              title="Open student folder in Notes system"
                            >
                              <span>📁</span> Case Folder &rarr;
                            </button>

                            <button
                              onClick={() => {
                                setConnectedStudentModal(appt);
                                setDirectMsgText(appt.session_notes || '');
                                setDirectMsgStatus('');
                              }}
                              style={{
                                padding: '0.4rem 0.85rem',
                                background: matchesDept ? 'rgba(245, 158, 11, 0.18)' : 'var(--bg-card2)',
                                color: matchesDept ? '#fbbf24' : 'var(--teal)',
                                border: '1px solid',
                                borderColor: matchesDept ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-bright)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <span>💬</span> Connect with Student
                            </button>

                            <button
                              onClick={() => {
                                if (isEditingNote) {
                                  setActiveNoteId(null);
                                } else {
                                  setActiveNoteId(appt.id);
                                  setNoteText(appt.session_notes || '');
                                }
                              }}
                              style={{
                                padding: '0.4rem 0.9rem',
                                background: isEditingNote ? 'var(--teal)' : 'var(--bg-card2)',
                                color: isEditingNote ? '#0f172a' : 'var(--teal)',
                                border: '1px solid var(--border-bright)',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <span>📝</span> {isEditingNote ? 'Close Note Editor' : appt.session_notes ? 'View / Edit Session Note' : '+ Add Session Note'}
                            </button>
                          </div>
                        </div>

                        {/* Counselor Note Editor & Viewer */}
                        {isEditingNote ? (
                          <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '0.4rem' }}>
                              🔒 Confidential Counselor Note for {appt.student_name}:
                            </div>
                            <textarea
                              rows={3}
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Record clinical impressions, student concerns, homework exercises, follow-up dates..."
                              style={{
                                width: '100%',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                color: 'var(--text)',
                                padding: '0.6rem 0.8rem',
                                fontSize: '0.88rem',
                                resize: 'vertical',
                                boxSizing: 'border-box'
                              }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button
                                onClick={() => setActiveNoteId(null)}
                                style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => handleSaveNote(appt.id)}
                                disabled={noteSaving}
                                style={{ padding: '0.4rem 1rem', background: 'var(--teal)', border: 'none', color: '#0f172a', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                {noteSaving ? 'Saving...' : '💾 Save Private Note'}
                              </button>
                            </div>
                          </div>
                        ) : appt.session_notes ? (
                          <div style={{ background: 'var(--bg-card2)', border: '1px dashed var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: 'var(--teal)' }}>Session Note:</strong> {appt.session_notes}
                          </div>
                        ) : null}

                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Direct Student Connection Modal */}
          {connectedStudentModal && (
            <div className="modal-overlay open" onClick={(e) => { if (e.target.className.includes('modal-overlay')) setConnectedStudentModal(null); }}>
              <div className="modal" style={{ maxWidth: '520px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
                    <span>💬</span> Connect with {connectedStudentModal.student_name}
                  </h3>
                  <button
                    onClick={() => setConnectedStudentModal(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                    <strong>Student Name:</strong>
                    <span style={{ color: 'var(--text)' }}>{connectedStudentModal.student_name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                    <strong>Anonymous ID:</strong>
                    <code style={{ color: 'var(--teal)' }}>{connectedStudentModal.student_anon_id}</code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                    <strong>Department:</strong>
                    <span style={{ color: isSameDept(connectedStudentModal.student_course, counselorDept) ? '#fbbf24' : 'var(--text)', fontWeight: 600 }}>
                      {connectedStudentModal.student_course} {isSameDept(connectedStudentModal.student_course, counselorDept) && '⭐ (Same Department)'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <strong>Contact Email:</strong>
                    <span style={{ color: 'var(--text-muted)' }}>{connectedStudentModal.student_email || 'student.demo@gmail.com'}</span>
                  </div>
                </div>

                {directMsgStatus && (
                  <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '8px', color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    ✅ {directMsgStatus}
                  </div>
                )}

                <label className="modal-label">Private Consultation Message / Clinical Note:</label>
                <textarea
                  rows={3}
                  className="modal-input"
                  placeholder={`Write a direct note or counseling message to ${connectedStudentModal.student_name}...`}
                  value={directMsgText}
                  onChange={(e) => setDirectMsgText(e.target.value)}
                  style={{ resize: 'vertical' }}
                />

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
                  {connectedStudentModal.student_email && (
                    <a
                      href={`mailto:${connectedStudentModal.student_email}?subject=CampusCare Consultation with Counselor Ms. Shahista Kazi&body=Dear ${connectedStudentModal.student_name},%0D%0A%0D%0AThis is Ms. Shahista Kazi from ${counselorDept}. I am reaching out regarding our CampusCare counseling session.%0D%0A%0D%0A${encodeURIComponent(directMsgText)}`}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.9rem',
                        borderRadius: '8px',
                        background: 'var(--bg-card2)',
                        border: '1px solid var(--border-bright)',
                        color: 'var(--teal)',
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>✉️</span> Email Student
                    </a>
                  )}
                  <button
                    onClick={async () => {
                      if (!directMsgText.trim()) return;
                      await handleSaveNote(connectedStudentModal.id);
                      setDirectMsgStatus('Direct message recorded in session notes!');
                      setTimeout(() => {
                        setConnectedStudentModal(null);
                      }, 1000);
                    }}
                    className="btn-modal-submit"
                    style={{ flex: 1.2, margin: 0, background: 'linear-gradient(135deg, var(--teal), #0284c7)' }}
                  >
                    💾 Save to Session Notes
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ==============================================================================
  // VIEW B: STUDENT BOOKING INTERFACE (Booking with Ms. Shahista Kazi)
  // ==============================================================================
  const activeBooking = mySessions.find(s => (s.status || '').toLowerCase() === 'confirmed');
  const filteredSessions = mySessions.filter(s => {
    if (sessionLogFilter === 'All') return true;
    return (s.status || '').toLowerCase() === sessionLogFilter.toLowerCase();
  });

  return (
    <div className="page active" id="page-booking" style={{ paddingBottom: '4rem' }}>
      <div className="booking-layout" style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div className="booking-header">
          <h2>Student Counseling &amp; Wellness Portal</h2>
          <p>Schedule and manage confidential 1-on-1 consultations with LTCE's designated student counselor, track your completed sessions, and view clinical recommendations.</p>
        </div>

        {/* 1. Counseling Status & Session Counter Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          {/* Card A: Number of Sessions Done - Green Top Border */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3.5px solid var(--green)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.4rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sessions Done
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--green)', marginTop: '6px', lineHeight: 1.1 }}>
              {String(mySessionStats.completedSessions).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Completed Consultations
            </div>
          </div>

          {/* Card B: Active Scheduled Bookings - Blue Top Border */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3.5px solid var(--brand-blue)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.4rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active / Scheduled
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-blue)', marginTop: '6px', lineHeight: 1.1 }}>
              {String(mySessionStats.activeSessions).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Upcoming Consultations
            </div>
          </div>

          {/* Card C: Total Consultation History - Orange Top Border */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3.5px solid var(--orange)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.4rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Consultations
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--orange)', marginTop: '6px', lineHeight: 1.1 }}>
              {String(mySessionStats.totalSessions).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Lifetime History Logged
            </div>
          </div>
        </div>

        {/* 2. Success Toast */}
        {studentBookingMsg && (
          <div style={{
            background: 'rgba(20, 184, 166, 0.12)',
            border: '1px solid var(--teal)',
            borderRadius: '14px',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            color: 'var(--text)'
          }}>
            <span style={{ fontSize: '1.75rem' }}>✅</span>
            <div>
              <strong style={{ color: 'var(--teal)', fontSize: '1rem' }}>Confidential Session Confirmed &amp; Logged!</strong>
              <div style={{ fontSize: '0.88rem', marginTop: '0.25rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Your appointment with <strong>{studentBookingMsg.name}</strong> ({studentBookingMsg.slots}) has been scheduled and recorded in your session log under Anonymous ID: <code style={{ color: 'var(--teal)', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>{studentBookingMsg.id}</code>.
              </div>
            </div>
          </div>
        )}

        {/* 3. Active Consultation Status Card (Prominent Status Banner) */}
        {activeBooking && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.14), rgba(59, 130, 246, 0.1))',
            border: '1px solid rgba(20, 184, 166, 0.4)',
            borderRadius: '16px',
            padding: '1.35rem 1.6rem',
            marginBottom: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.2rem',
            boxShadow: '0 4px 20px rgba(20, 184, 166, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(20, 184, 166, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                📅
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'rgba(52, 211, 153, 0.18)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    color: '#34d399',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    ● Current Booking Status: Confirmed
                  </span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 700 }}>
                    1-on-1 with {activeBooking.counselor_name || 'Ms. Shahista Kazi'}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span>⏰ Slot: <strong style={{ color: 'var(--text)' }}>{activeBooking.slot_time}</strong></span>
                  <span>•</span>
                  <span>🏛️ Venue: <strong>Online </strong></span>
                  <span>•</span>
                  <span>🔒 Anonymous ID: <code style={{ color: 'var(--teal)' }}>{activeBooking.student_anon_id}</code></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCancelSession(activeBooking.id)}
              disabled={cancellingSessionId === activeBooking.id}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {cancellingSessionId === activeBooking.id ? 'Cancelling...' : '✕ Cancel Booking'}
            </button>
          </div>
        )}

        {/* 4. Same Department Connection Banner */}
        {isSameDept(user?.course, counselorInfo.department) && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(20, 184, 166, 0.15))',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.9rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '1.8rem' }}>⭐</span>
              <div>
                <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.95rem' }}>
                  Same Department Counselor Match!
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  You and counselor <strong>Ms. Shahista Kazi</strong> both belong to <strong>{user?.course || counselorInfo.department}</strong>. You can connect directly for priority 1-on-1 consultations.
                </div>
              </div>
            </div>
            <button
              onClick={handleStudentBook}
              disabled={isSubmitting}
              style={{
                padding: '0.55rem 1.1rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
              }}
            >
              {isSubmitting ? 'Connecting...' : '⚡ Instant Connect'}
            </button>
          </div>
        )}

        {/* 5. Counselor Booking Card Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🗓️</span> Schedule a New Consultation
            </h3>
            <div className="filter-row" style={{ margin: 0 }}>
              {['All', 'Academic Stress', 'Anxiety', 'Stress Management'].map(f => (
                <button
                  key={f}
                  className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="counselor-grid">
            <div className="counselor-card" style={{ '--card-bg': counselorProfile.color, maxWidth: '100%', width: '100%' }}>
              <div className="cc-top">
                <div className="cc-avatar">{counselorProfile.emoji}</div>
                <div>
                  <h4 style={{ fontSize: '1.25rem' }}>{counselorProfile.name}</h4>
                  <div className="cc-role" style={{ color: 'var(--teal)', fontWeight: 500 }}>{counselorProfile.role}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>🏛️ {counselorProfile.institution}</div>
                  <div style={{ fontSize: '0.84rem', color: '#fbbf24', marginTop: '3px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🎓</span> Department: {counselorInfo.department}
                  </div>
                  <div className="cc-lang" style={{ marginTop: '4px' }}>🌐 {counselorProfile.lang}</div>
                </div>
              </div>

              <div className="cc-tags">
                {counselorProfile.tags.map(t => <span key={t} className="cc-tag">{t}</span>)}
              </div>

              {/* Select Slot */}
              <div style={{ margin: '1.1rem 0 0.8rem' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Select Preferred Consultation Time:
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Today at 2:00 PM">Today at 2:00 PM · Counseling Session</option>
                  <option value="Today at 3:30 PM">Today at 3:30 PM · Counseling Session</option>
                  <option value="Tomorrow at 11:00 AM">Tomorrow at 11:00 AM · Counseling Session</option>
                  <option value="Tomorrow at 1:30 PM">Tomorrow at 1:30 PM · Counseling Session</option>
                  <option value="Wednesday at 10:30 AM">Wednesday at 10:30 AM · Counseling Session</option>
                </select>
              </div>

              <div className="cc-slots" style={{ fontSize: '0.84rem', color: 'var(--text-dim)' }}>
                📅 Regular Hours: <span>{counselorProfile.slots}</span>
              </div>

              <button
                className="btn-book"
                onClick={handleStudentBook}
                disabled={isSubmitting}
                style={{
                  marginTop: '1.1rem',
                  padding: '0.8rem',
                  fontSize: '0.95rem',
                  background: isSameDept(user?.course, counselorInfo.department) ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined
                }}
              >
                {isSubmitting ? 'Booking Confidential Session...' : isSameDept(user?.course, counselorInfo.department) ? '⚡ Connect with Department Counselor' : 'Book Confidential Session'}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* 6. COUNSELING SESSION LOG & CONSULTATION HISTORY */}
        {/* ============================================================================== */}
        <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📜</span> Counseling Session Log &amp; Attendance History
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Confidential log of your past and scheduled counseling sessions and attendance status. Clinical notes taken during sessions remain strictly confidential to the counselor.
              </p>
            </div>

            {/* Session Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'All', label: `All (${mySessions.length})` },
                { id: 'completed', label: `🏆 Done (${mySessionStats.completedSessions})` },
                { id: 'confirmed', label: `⏳ Scheduled (${mySessionStats.activeSessions})` },
                { id: 'cancelled', label: `✕ Cancelled (${mySessionStats.cancelledSessions})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSessionLogFilter(tab.id)}
                  style={{
                    padding: '0.38rem 0.78rem',
                    borderRadius: '7px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: sessionLogFilter === tab.id ? 'var(--teal)' : 'var(--border)',
                    background: sessionLogFilter === tab.id ? 'var(--teal-soft)' : 'var(--bg-card)',
                    color: sessionLogFilter === tab.id ? 'var(--teal)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loadingMySessions ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Loading your counseling records...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '16px', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>🌿</div>
              <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--text)', fontSize: '1.05rem' }}>No sessions found in this category</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
                {sessionLogFilter === 'All'
                  ? 'You have not booked any counseling sessions yet. Choose a preferred time slot above to schedule your first 1-on-1 consultation.'
                  : `No sessions found with status "${sessionLogFilter}".`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              {filteredSessions.map((session, idx) => {
                const isCompleted = (session.status || '').toLowerCase() === 'completed';
                const isConfirmed = (session.status || '').toLowerCase() === 'confirmed';
                const isCancelled = (session.status || '').toLowerCase() === 'cancelled';

                return (
                  <div
                    key={session.id || idx}
                    style={{
                      background: 'var(--bg-card)',
                      border: isConfirmed ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid var(--border)',
                      borderRadius: '16px',
                      padding: '1.25rem 1.45rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      boxShadow: isConfirmed ? '0 4px 20px rgba(20, 184, 166, 0.06)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Top Row: Session Title, Date & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>
                            Session #{filteredSessions.length - idx} · Confidential Consultation
                          </span>
                          <span style={{ fontSize: '0.78rem', background: 'var(--bg-card2)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-muted)' }}>
                            📅 {session.booking_date || (session.created_at ? session.created_at.split('T')[0] : 'Scheduled')}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                          <span>👩‍🏫 Counselor: <strong>{session.counselor_name || 'Ms. Shahista Kazi'}</strong></span>
                          <span>•</span>
                          <span>⏰ Slot Time: <strong style={{ color: 'var(--text)' }}>{session.slot_time}</strong></span>
                          <span>•</span>
                          <span>🏛️ Venue: online </span>
                        </div>
                      </div>

                      {/* Status Badge & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '0.3rem 0.85rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                          background: isCompleted ? 'rgba(52, 211, 153, 0.15)' : isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: isCompleted ? '#34d399' : isCancelled ? '#f87171' : '#60a5fa',
                          border: '1px solid',
                          borderColor: isCompleted ? 'rgba(52, 211, 153, 0.35)' : isCancelled ? 'rgba(239, 68, 68, 0.35)' : 'rgba(59, 130, 246, 0.35)'
                        }}>
                          {isCompleted ? '✓ Session Done' : isCancelled ? '✕ Cancelled' : '● Scheduled'}
                        </span>

                        {isConfirmed && (
                          <button
                            onClick={() => handleCancelSession(session.id)}
                            disabled={cancellingSessionId === session.id}
                            style={{
                              padding: '0.28rem 0.75rem',
                              background: 'transparent',
                              border: '1px solid var(--border)',
                              borderRadius: '7px',
                              color: 'var(--text-dim)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            title="Cancel this scheduled appointment"
                          >
                            {cancellingSessionId === session.id ? '...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Session Status & Confidentiality Notice (Counselor notes remain private to counselor) */}
                    {isCompleted ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        padding: '0.65rem 0.95rem',
                        background: 'rgba(52, 211, 153, 0.06)',
                        border: '1px solid rgba(52, 211, 153, 0.2)',
                        borderRadius: '10px',
                        fontSize: '0.82rem'
                      }}>
                        <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>✓</span> Counseling session attended &amp; completed
                        </span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>🔒</span> Clinical notes are private to counselor records
                        </span>
                      </div>
                    ) : isConfirmed ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                        padding: '0.75rem 1rem',
                        background: 'rgba(20, 184, 166, 0.08)',
                        border: '1px solid rgba(20, 184, 166, 0.25)',
                        borderRadius: '10px',
                        fontSize: '0.82rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--teal)' }}>
                          <span>ℹ️</span>
                          <span>Online 1:1 consultation is ready with Ms. Shahista Kazi.</span>
                        </div>
                        <button
                          onClick={() => {
                            const channelId = `session-${session.student_anon_id || user?.anonId || session.id}`.replace(/[^a-zA-Z0-9-_]/g, '-');
                            navigate(`/video-call?channel=${encodeURIComponent(channelId)}&role=student`);
                          }}
                          style={{
                            padding: '0.4rem 0.95rem',
                            background: 'linear-gradient(135deg, var(--teal), #0284c7)',
                            border: 'none',
                            color: '#ffffff',
                            borderRadius: '7px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <span>📹</span> Join 1:1 Video Consultation
                        </button>
                      </div>
                    ) : isCancelled ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.55rem 0.85rem',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: '#f87171'
                      }}>
                        <span>✕</span> This counseling consultation was cancelled.
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
