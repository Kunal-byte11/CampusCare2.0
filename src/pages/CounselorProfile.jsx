import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  ShieldCheck,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Award,
  FileText,
  CheckCircle2,
  Building2,
  Phone,
  ArrowLeft,
  Edit3,
  Save,
  Sparkles,
  GraduationCap,
  Globe2,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  FolderOpen,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

const SUGGESTED_TEMPLATE = {
  room: 'Room 204, Academic Block A, Counseling Suite',
  phone: '+91 22 2754 1005 (Ext. 402)',
  workingHours: 'Monday – Friday · 10:00 AM – 4:00 PM',
  languages: 'English, Hindi, Marathi',
  bio: 'Dedicated to student well-being, psychological safety, and stress mitigation across all engineering departments. Conducting confidential consultations, anxiety triage, exam stress support, and evidence-based cognitive coping strategies for LTCE scholars.',
  qualifications: [
    {
      degree: 'Master of Arts in Clinical Psychology',
      institution: 'University of Mumbai',
      year: 'First Class with Distinction'
    },
    {
      degree: 'Postgraduate Diploma in Psychological Counseling',
      institution: 'Tata Institute of Social Sciences (TISS) Affiliate Program',
      year: 'Certified Counseling Practitioner'
    },
    {
      degree: 'Cognitive Behavioral Therapy (CBT) Practitioner Certificate',
      institution: 'Academy of Modern Applied Psychology',
      year: 'Evidence-Based Practice'
    }
  ],
  specializations: [
    {
      title: 'Academic & Exam Stress',
      desc: 'Overcoming burnout, procrastination, and testing anxiety during engineering semesters.'
    },
    {
      title: 'Anxiety & Panic De-escalation',
      desc: 'Somatic grounding, diaphragmatic breathing drills, and cognitive reframing.'
    },
    {
      title: 'Peer & Hostel Adjustment',
      desc: 'Navigating roommate dynamics, homesickness, and campus transition.'
    }
  ]
};

export default function CounselorProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Profile data initialized with real counselor info from account / storage
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscare-counselor-profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {
      name: user?.name || user?.full_name || 'Ms. Shahista Kazi',
      designation: 'Student Counselor & Wellness Officer',
      department: user?.course || 'Computer Science & Engineering (Data Science)',
      institution: 'Lokmanya Tilak College of Engineering (LTCE)',
      campusLocation: 'Koparkhairane, Navi Mumbai',
      room: '',
      email: user?.email || 'shahista.kazi@ltce.in',
      phone: '',
      workingHours: '',
      languages: 'English, Hindi, Marathi',
      bio: '',
      photo: '',
      qualifications: [],
      specializations: []
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Real live stats from database
  const [stats, setStats] = useState({
    todayBookings: 0,
    monthlyCompleted: 0,
    totalStudentsConnected: 0,
    activeSessions: 0,
    totalBookings: 0
  });
  const [notesCount, setNotesCount] = useState(0);

  // Fetch real profile from backend if available
  useEffect(() => {
    fetch('/api/bookings/counselor')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.counselor) {
          setProfile(prev => {
            const updated = {
              ...prev,
              name: d.counselor.name || prev.name,
              department: d.counselor.department || prev.department,
              email: d.counselor.email || prev.email,
              room: prev.room || d.counselor.room || '',
              phone: prev.phone || d.counselor.phone || '',
              workingHours: prev.workingHours || d.counselor.workingHours || '',
              languages: prev.languages || d.counselor.languages || 'English, Hindi, Marathi',
              bio: prev.bio || d.counselor.bio || '',
              photo: prev.photo || d.counselor.photo || '',
              qualifications: prev.qualifications?.length ? prev.qualifications : (d.counselor.qualifications || []),
              specializations: prev.specializations?.length ? prev.specializations : (d.counselor.specializations || [])
            };
            return updated;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real live statistics
  useEffect(() => {
    fetch('/api/bookings/stats')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.stats) setStats(d.stats);
      })
      .catch(() => {});

    fetch('/api/bookings/notes')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.notes)) setNotesCount(d.notes.length);
      })
      .catch(() => {});
  }, []);

  // Sync formData with profile
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Image scaling & optimization helper (keeps storage footprint compact <80KB)
  const processImageFile = (file, callback) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Please choose an image under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 500;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        callback(optimizedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Instant photo upload from hero avatar box
  const handleHeroPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file, (dataUrl) => {
      const updated = { ...profile, photo: dataUrl };
      setProfile(updated);
      setFormData(updated);

      try {
        localStorage.setItem('campuscare-counselor-profile', JSON.stringify(updated));
        window.dispatchEvent(new Event('counselor-profile-updated'));
      } catch (err) {
        console.error('Storage error:', err);
      }

      fetch('/api/bookings/counselor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    });
  };

  // Photo upload from inside Edit Mode
  const handleEditPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file, (dataUrl) => {
      setFormData(prev => ({ ...prev, photo: dataUrl }));
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      localStorage.setItem('campuscare-counselor-profile', JSON.stringify(formData));
      window.dispatchEvent(new Event('counselor-profile-updated'));
    } catch (err) {
      console.error('Storage error:', err);
    }

    try {
      await fetch('/api/bookings/counselor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (apiErr) {
      console.warn('API save warning:', apiErr);
    }

    setProfile(formData);
    setLoading(false);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Helper to load template if counselor wants a quick foundation to customize
  const handleLoadTemplate = () => {
    setFormData(prev => ({
      ...prev,
      ...SUGGESTED_TEMPLATE,
      name: prev.name || 'Ms. Shahista Kazi',
      department: prev.department || 'Computer Science & Engineering (Data Science)',
      email: prev.email || 'shahista.kazi@ltce.in',
      photo: prev.photo || ''
    }));
  };

  // Qualification item handlers
  const handleAddQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [
        ...(prev.qualifications || []),
        { degree: '', institution: '', year: '' }
      ]
    }));
  };

  const handleUpdateQualification = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.qualifications || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, qualifications: updated };
    });
  };

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  // Specialization item handlers
  const handleAddSpecialization = () => {
    setFormData(prev => ({
      ...prev,
      specializations: [
        ...(prev.specializations || []),
        { title: '', desc: '' }
      ]
    }));
  };

  const handleUpdateSpecialization = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.specializations || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, specializations: updated };
    });
  };

  const handleRemoveSpecialization = (index) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="page active" id="page-counselor-profile">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem 5rem' }}>
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <button
            onClick={() => navigate('/booking')}
            className="btn-tertiary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <ArrowLeft size={14} /> Back to Appointments Desk
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/counselor-notes')}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={14} /> Clinical Case Notes
            </button>
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setFormData(profile);
              }}
              className={isEditing ? 'btn-secondary' : 'btn-primary'}
              style={{ fontSize: '13px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit3 size={14} /> {isEditing ? 'Cancel Edit' : 'Edit My Profile'}
            </button>
          </div>
        </div>

        {/* Save confirmation banner */}
        {saveSuccess && (
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
            <Check size={16} /> Counselor profile &amp; photo successfully saved and updated!
          </div>
        )}

        {/* Hero Counselor Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle brand blue line at top */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, var(--brand-blue) 0%, var(--teal) 50%, var(--green) 100%)'
          }} />

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            {/* Counselor Avatar / Photo Box with Instant Upload Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '108px',
                height: '108px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-blue-pale)',
                border: '2px solid var(--border-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                flexShrink: 0,
                boxShadow: 'var(--shadow-subtle)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  '👩‍🏫'
                )}
              </div>

              {/* Hidden file input for hero avatar */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleHeroPhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-tertiary"
                style={{
                  fontSize: '11.5px',
                  padding: '3px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
                title="Click to upload or change profile picture"
              >
                <Camera size={12} /> {profile.photo ? 'Change Photo' : 'Upload Photo'}
              </button>
            </div>

            {/* Profile Info */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <h1 style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  {profile.name}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--teal-pale)',
                  color: 'var(--teal)',
                  border: '1px solid rgba(50, 165, 178, 0.3)',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  fontWeight: 600
                }}>
                  <ShieldCheck size={13} /> Official Counselor
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--green-pale)',
                  color: 'var(--green)',
                  border: '1px solid rgba(98, 173, 69, 0.3)',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  fontWeight: 600
                }}>
                  ● Active On-Campus
                </span>
              </div>

              <div style={{
                fontSize: '14.5px',
                fontWeight: 600,
                color: 'var(--brand-blue)',
                marginBottom: '0.35rem'
              }}>
                {profile.designation || 'Student Counselor'} · {profile.department}
              </div>

              <div style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Building2 size={14} /> {profile.institution} ({profile.campusLocation})
              </div>

              {profile.bio ? (
                <p style={{
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  margin: 0,
                  maxWidth: '820px'
                }}>
                  {profile.bio}
                </p>
              ) : (
                <div style={{
                  background: 'var(--sidebar-bg)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <span>No guidance philosophy or bio added yet. Tell engineering students about your counseling approach.</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-blue)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      textDecoration: 'underline'
                    }}
                  >
                    + Add Bio
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Counselor Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} style={{
            background: 'var(--surface)',
            border: '2px solid var(--brand-blue)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
            padding: '1.75rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--brand-blue)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Edit3 size={18} /> Edit Your Counselor Profile &amp; Office Information
              </h3>

              <button
                type="button"
                onClick={handleLoadTemplate}
                className="btn-tertiary"
                style={{ fontSize: '12px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                title="Populate standard academic counseling starter template"
              >
                <Sparkles size={13} style={{ color: 'var(--brand-blue)' }} /> Load Suggested Template
              </button>
            </div>

            {/* Profile Photo Section in Form */}
            <div style={{
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)',
                border: '2px solid var(--border-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.8rem',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '👩‍🏫'
                )}
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Counselor Profile Picture
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Upload a clear portrait or headshot (JPG, PNG, WebP). Your picture will appear on the top navigation bar, consultation desk, and student booking view.
                </div>

                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditPhotoUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Upload size={13} /> Upload from Computer
                  </button>

                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                      className="btn-tertiary"
                      style={{ fontSize: '12px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--error)' }}
                    >
                      <Trash2 size={13} /> Remove Photo
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '8px' }}>
                  <input
                    type="url"
                    className="modal-input"
                    style={{ margin: 0, fontSize: '12px', padding: '6px 10px' }}
                    placeholder="Or paste an image web URL (e.g. https://...)"
                    value={formData.photo || ''}
                    onChange={e => setFormData({ ...formData, photo: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Basic Info Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="modal-label">Counselor Full Name *</label>
                <input
                  type="text"
                  className="modal-input"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ms. Shahista Kazi"
                  required
                />
              </div>

              <div>
                <label className="modal-label">Official Designation *</label>
                <input
                  type="text"
                  className="modal-input"
                  value={formData.designation || ''}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Student Counselor & Wellness Officer"
                  required
                />
              </div>

              <div>
                <label className="modal-label">Department *</label>
                <input
                  type="text"
                  className="modal-input"
                  value={formData.department || ''}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering (Data Science)"
                  required
                />
              </div>

              <div>
                <label className="modal-label">Consultation Room / Office Suite</label>
                <input
                  type="text"
                  className="modal-input"
                  value={formData.room || ''}
                  onChange={e => setFormData({ ...formData, room: e.target.value })}
                  placeholder="e.g. Room 204, Academic Block A"
                />
              </div>

              <div>
                <label className="modal-label">Official Email Address *</label>
                <input
                  type="email"
                  className="modal-input"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. shahista.kazi@ltce.in"
                  required
                />
              </div>

              <div>
                <label className="modal-label">Campus Phone / Intercom Extension</label>
                <input
                  type="text"
                  className="modal-input"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 22 2754 1005 (Ext. 402)"
                />
              </div>

              <div>
                <label className="modal-label">Working Hours / Consultation Timings</label>
                <input
                  type="text"
                  className="modal-input"
                  value={formData.workingHours || ''}
                  onChange={e => setFormData({ ...formData, workingHours: e.target.value })}
                  placeholder="e.g. Monday – Friday · 10:00 AM – 4:00 PM"
                />
              </div>

              <div>
                <label className="modal-label">Consultation Languages</label>
                <input
                  type="text"
                  className="modal-input"
                  value={formData.languages || ''}
                  onChange={e => setFormData({ ...formData, languages: e.target.value })}
                  placeholder="e.g. English, Hindi, Marathi"
                />
              </div>
            </div>

            {/* Bio Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="modal-label">About You &amp; Student Guidance Philosophy</label>
              <textarea
                className="modal-input"
                rows="3"
                value={formData.bio || ''}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your background, student welfare approach, and counseling philosophy..."
              />
            </div>

            {/* Dynamic Qualifications List */}
            <div style={{
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={16} style={{ color: 'var(--brand-blue)' }} /> Your Degrees, Diplomas &amp; Certifications
                </div>
                <button
                  type="button"
                  onClick={handleAddQualification}
                  className="btn-tertiary"
                  style={{ fontSize: '12px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={13} /> Add Qualification
                </button>
              </div>

              {(!formData.qualifications || formData.qualifications.length === 0) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', padding: '0.5rem 0' }}>
                  No qualifications added yet. Click &quot;Add Qualification&quot; to list your educational background.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.qualifications.map((q, idx) => (
                    <div key={idx} style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1.5fr 1fr 36px',
                      gap: '8px',
                      alignItems: 'center',
                      background: 'var(--surface)',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)'
                    }}>
                      <input
                        type="text"
                        className="modal-input"
                        style={{ margin: 0 }}
                        placeholder="Degree / Certificate (e.g. M.A. Clinical Psychology)"
                        value={q.degree || ''}
                        onChange={e => handleUpdateQualification(idx, 'degree', e.target.value)}
                      />
                      <input
                        type="text"
                        className="modal-input"
                        style={{ margin: 0 }}
                        placeholder="University / Board (e.g. University of Mumbai)"
                        value={q.institution || ''}
                        onChange={e => handleUpdateQualification(idx, 'institution', e.target.value)}
                      />
                      <input
                        type="text"
                        className="modal-input"
                        style={{ margin: 0 }}
                        placeholder="Year / Detail (e.g. 2021 · Distinction)"
                        value={q.year || ''}
                        onChange={e => handleUpdateQualification(idx, 'year', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(idx)}
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'var(--coral-pale)',
                          color: 'var(--error)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove qualification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Specializations List */}
            <div style={{
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} style={{ color: 'var(--orange)' }} /> Clinical Specializations &amp; Guidance Areas
                </div>
                <button
                  type="button"
                  onClick={handleAddSpecialization}
                  className="btn-tertiary"
                  style={{ fontSize: '12px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={13} /> Add Specialization
                </button>
              </div>

              {(!formData.specializations || formData.specializations.length === 0) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', padding: '0.5rem 0' }}>
                  No specializations added yet. Click &quot;Add Specialization&quot; to list your core focus areas.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.specializations.map((s, idx) => (
                    <div key={idx} style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 2.5fr 36px',
                      gap: '8px',
                      alignItems: 'center',
                      background: 'var(--surface)',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)'
                    }}>
                      <input
                        type="text"
                        className="modal-input"
                        style={{ margin: 0 }}
                        placeholder="Focus Area (e.g. Academic Stress)"
                        value={s.title || ''}
                        onChange={e => handleUpdateSpecialization(idx, 'title', e.target.value)}
                      />
                      <input
                        type="text"
                        className="modal-input"
                        style={{ margin: 0 }}
                        placeholder="Brief summary or approach (e.g. Overcoming burnout and exam anxiety)"
                        value={s.desc || ''}
                        onChange={e => handleUpdateSpecialization(idx, 'desc', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialization(idx)}
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'var(--coral-pale)',
                          color: 'var(--error)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove specialization"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={14} /> {loading ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        )}

        {/* Real Live Operational Metrics from Database (Zero Dummy Data) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="about-stat-card border-top-blue">
            <div className="about-stat-val" style={{ color: 'var(--brand-blue)' }}>
              {stats.todayBookings}
            </div>
            <div className="about-stat-lbl">Today&apos;s Appointments</div>
            <div className="about-stat-sub">Scheduled Consultations Today</div>
          </div>

          <div className="about-stat-card border-top-teal">
            <div className="about-stat-val" style={{ color: 'var(--teal)' }}>
              {stats.activeSessions}
            </div>
            <div className="about-stat-lbl">Active Sessions</div>
            <div className="about-stat-sub">Upcoming Confirmed Bookings</div>
          </div>

          <div className="about-stat-card border-top-green">
            <div className="about-stat-val" style={{ color: 'var(--green)' }}>
              {stats.monthlyCompleted}
            </div>
            <div className="about-stat-lbl">Completed Consultations</div>
            <div className="about-stat-sub">Concluded Session Records</div>
          </div>

          <div className="about-stat-card border-top-coral">
            <div className="about-stat-val" style={{ color: 'var(--coral)' }}>
              {notesCount}
            </div>
            <div className="about-stat-lbl">Clinical Case Files</div>
            <div className="about-stat-sub">Confidential Student Dossiers</div>
          </div>
        </div>

        {/* Two-Column Section: Office Information & Credentials */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Office & Contact Card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            padding: '1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin size={18} style={{ color: 'var(--brand-blue)' }} /> Campus Consultation Office
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-blue)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  Edit Office
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Building2 size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Chamber Location</div>
                  <div style={{ color: profile.room ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {profile.room || 'Not specified yet (click Edit to specify room)'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{profile.institution}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Clock size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Office Hours</div>
                  <div style={{ color: profile.workingHours ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {profile.workingHours || 'Not specified yet (click Edit to set timings)'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Mail size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Official Email</div>
                  <a href={`mailto:${profile.email}`} style={{ color: 'var(--brand-blue)', textDecoration: 'none', fontWeight: 500 }}>
                    {profile.email}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Phone size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Campus Phone &amp; Intercom</div>
                  <div style={{ color: profile.phone ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {profile.phone || 'Not specified yet'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Globe2 size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Consultation Languages</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{profile.languages || 'English, Hindi, Marathi'}</div>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '1.5rem',
              padding: '0.85rem',
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              🔒 <strong>Confidentiality Policy:</strong> Consultations conducted at the LTCE Wellness Chamber are strictly private under clinical ethics and AICTE student safety directives.
            </div>
          </div>

          {/* Clinical Qualifications Card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            padding: '1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Award size={18} style={{ color: 'var(--teal)' }} /> Credentials &amp; Degrees
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-blue)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  + Manage Credentials
                </button>
              )}
            </div>

            {(!profile.qualifications || profile.qualifications.length === 0) ? (
              <div style={{
                background: 'var(--sidebar-bg)',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.75rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px'
              }}>
                <GraduationCap size={28} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>No Credentials Listed Yet</div>
                <div style={{ marginBottom: '1rem', fontSize: '12px' }}>Add your clinical psychology degrees, psychotherapy diplomas, and counseling certifications.</div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-tertiary"
                  style={{ fontSize: '12.5px', padding: '5px 12px' }}
                >
                  <Plus size={13} /> Add Your Degrees
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {profile.qualifications.map((q, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    paddingBottom: idx !== profile.qualifications.length - 1 ? '1rem' : 0,
                    borderBottom: idx !== profile.qualifications.length - 1 ? '1px solid var(--border-light)' : 'none'
                  }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--brand-blue-pale)',
                      color: 'var(--brand-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                        {q.degree}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        {q.institution}
                      </div>
                      {q.year && (
                        <div style={{ fontSize: '11.5px', color: 'var(--teal)', fontWeight: 500 }}>
                          {q.year}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Clinical Specialization Areas */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          padding: '1.75rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={18} style={{ color: 'var(--orange)' }} /> Focus &amp; Clinical Specializations
            </h3>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-blue)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                + Manage Focus Areas
              </button>
            )}
          </div>

          {(!profile.specializations || profile.specializations.length === 0) ? (
            <div style={{
              background: 'var(--sidebar-bg)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.75rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px'
            }}>
              <Sparkles size={28} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>No Clinical Focus Areas Added</div>
              <div style={{ marginBottom: '1rem', fontSize: '12px' }}>List specific areas such as exam stress, panic de-escalation, career clarity, or peer adjustment.</div>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-tertiary"
                style={{ fontSize: '12.5px', padding: '5px 12px' }}
              >
                <Plus size={13} /> Add Specializations
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem'
            }}>
              {profile.specializations.map((spec, i) => (
                <div key={i} style={{
                  background: 'var(--sidebar-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem 1.15rem'
                }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '13.5px',
                    color: 'var(--brand-blue)',
                    marginBottom: '4px'
                  }}>
                    {spec.title}
                  </div>
                  {spec.desc && (
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {spec.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operational Desks Quick Actions */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '2px' }}>
              Live Operational Desks
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Manage student appointment bookings or confidential folder-based clinical notes.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/booking')}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Calendar size={14} /> Open Appointments Desk
            </button>
            <button
              onClick={() => navigate('/counselor-notes')}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <FileText size={14} /> Open Clinical Notes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
