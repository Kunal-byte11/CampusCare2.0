import React, { useState, useEffect } from 'react';

export default function CounselorNotes({ 
  counselorDept = 'Computer Science & Engineering (Data Science)',
  counselorName = 'Ms. Shahista Kazi',
  initialSelectedStudentId = null,
  appointments = []
}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentFolder, setSelectedStudentFolder] = useState(initialSelectedStudentId);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  
  // Modals
  const [activeFileModal, setActiveFileModal] = useState(null); // note object for viewing
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [fileModalData, setFileModalData] = useState({
    id: null,
    studentAnonId: '',
    studentName: '',
    studentCourse: counselorDept,
    studentYear: '1st Year',
    studentEmail: '',
    fileName: '',
    title: '',
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: '02:00 PM',
    category: 'Follow-up Session',
    severity: 'Normal',
    clinicalObservations: '',
    actionPlan: ''
  });
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderData, setNewFolderData] = useState({
    studentAnonId: '',
    studentName: '',
    studentCourse: counselorDept,
    studentYear: '2nd Year',
    studentEmail: ''
  });

  const [savingNote, setSavingNote] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Load notes from backend
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings/notes');
      const data = await res.json();
      if (data.success && Array.isArray(data.notes)) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.warn('Failed to load notes from backend, using localStorage or fallback:', err);
      const savedLocal = localStorage.getItem('campuscare_counselor_notes');
      if (savedLocal) {
        try { setNotes(JSON.parse(savedLocal)); } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Update selected folder if passed prop changes
  useEffect(() => {
    if (initialSelectedStudentId) {
      setSelectedStudentFolder(initialSelectedStudentId);
    }
  }, [initialSelectedStudentId]);

  // Save notes copy to localStorage for offline resilience
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('campuscare_counselor_notes', JSON.stringify(notes));
    }
  }, [notes]);

  const isSameDept = (dept1, dept2) => {
    if (!dept1 || !dept2) return false;
    const d1 = dept1.toLowerCase().trim();
    const d2 = dept2.toLowerCase().trim();
    return d1 === d2 || (d1.includes('data science') && d2.includes('data science'));
  };

  // Group notes into Student Folders
  // Also incorporate any students from appointments who don't have notes yet
  const studentFoldersMap = {};

  // First seed from appointments so any booked student has an active folder
  appointments.forEach(a => {
    if (!a.student_anon_id) return;
    if (!studentFoldersMap[a.student_anon_id]) {
      studentFoldersMap[a.student_anon_id] = {
        anonId: a.student_anon_id,
        name: a.student_name || 'LTCE Student',
        course: a.student_course || 'Computer Engineering',
        year: a.student_year || '1st Year',
        email: a.student_email || '',
        files: [],
        lastUpdated: a.booking_date || a.created_at || new Date().toISOString()
      };
    }
  });

  // Now populate with all notes files
  notes.forEach(n => {
    if (!n.student_anon_id) return;
    if (!studentFoldersMap[n.student_anon_id]) {
      studentFoldersMap[n.student_anon_id] = {
        anonId: n.student_anon_id,
        name: n.student_name || 'LTCE Student',
        course: n.student_course || 'Computer Engineering',
        year: n.student_year || '1st Year',
        email: n.student_email || '',
        files: [],
        lastUpdated: n.updated_at || n.created_at || n.session_date
      };
    }
    studentFoldersMap[n.student_anon_id].files.push(n);

    // Keep newest updated timestamp
    const noteDate = n.updated_at || n.created_at || n.session_date;
    if (new Date(noteDate) > new Date(studentFoldersMap[n.student_anon_id].lastUpdated)) {
      studentFoldersMap[n.student_anon_id].lastUpdated = noteDate;
    }
  });

  const allFolders = Object.values(studentFoldersMap);

  // Filter folders
  const filteredFolders = allFolders.filter(folder => {
    if (departmentFilter === 'same-dept' && !isSameDept(folder.course, counselorDept)) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      folder.name.toLowerCase().includes(q) ||
      folder.anonId.toLowerCase().includes(q) ||
      folder.course.toLowerCase().includes(q) ||
      folder.files.some(f => 
        (f.title && f.title.toLowerCase().includes(q)) || 
        (f.file_name && f.file_name.toLowerCase().includes(q)) ||
        (f.clinical_observations && f.clinical_observations.toLowerCase().includes(q))
      )
    );
  });

  const currentFolder = selectedStudentFolder ? studentFoldersMap[selectedStudentFolder] : null;

  // Open Create Note File modal
  const handleOpenCreateNote = (folder = null) => {
    const targetFolder = folder || currentFolder || allFolders[0];
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setFileModalData({
      id: null,
      studentAnonId: targetFolder ? targetFolder.anonId : 'anon_demo123456789',
      studentName: targetFolder ? targetFolder.name : 'Student',
      studentCourse: targetFolder ? targetFolder.course : counselorDept,
      studentYear: targetFolder ? targetFolder.year : '1st Year',
      studentEmail: targetFolder ? targetFolder.email : '',
      fileName: `Session_${dateStr}.note`,
      title: 'Consultation & Clinical Assessment',
      sessionDate: dateStr,
      sessionTime: timeStr,
      category: 'Follow-up Session',
      severity: 'Normal',
      clinicalObservations: '',
      actionPlan: ''
    });
    setIsEditingFile(true);
    setActiveFileModal(null);
  };

  // Open Edit Note File modal
  const handleOpenEditNote = (note) => {
    setFileModalData({
      id: note.id,
      studentAnonId: note.student_anon_id,
      studentName: note.student_name,
      studentCourse: note.student_course,
      studentYear: note.student_year,
      studentEmail: note.student_email || '',
      fileName: note.file_name,
      title: note.title || '',
      sessionDate: note.session_date || '',
      sessionTime: note.session_time || '',
      category: note.category || 'General Consultation',
      severity: note.severity || 'Normal',
      clinicalObservations: note.clinical_observations || '',
      actionPlan: note.action_plan || ''
    });
    setIsEditingFile(true);
    setActiveFileModal(null);
  };

  // Save Note File (Create or Update)
  const handleSaveNoteFile = async (e) => {
    e?.preventDefault();
    if (!fileModalData.studentAnonId.trim()) {
      alert('Student Anonymous ID is required.');
      return;
    }
    setSavingNote(true);
    setSaveSuccessMsg('');

    try {
      const isUpdate = Boolean(fileModalData.id);
      const url = isUpdate ? `/api/bookings/notes/${fileModalData.id}` : '/api/bookings/notes';
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileModalData)
      });

      const data = await res.json();
      if (data.success && data.note) {
        if (isUpdate) {
          setNotes(prev => prev.map(n => n.id === data.note.id ? data.note : n));
        } else {
          setNotes(prev => [data.note, ...prev]);
        }
        setSaveSuccessMsg(`File "${data.note.file_name}" saved to student folder successfully!`);
        setTimeout(() => {
          setIsEditingFile(false);
          setSaveSuccessMsg('');
          // Keep current folder open
          setSelectedStudentFolder(data.note.student_anon_id);
        }, 800);
      } else {
        // Fallback local update
        const fallbackNote = {
          id: fileModalData.id || `local_note_${Date.now()}`,
          student_anon_id: fileModalData.studentAnonId,
          student_name: fileModalData.studentName,
          student_course: fileModalData.studentCourse,
          student_year: fileModalData.studentYear,
          student_email: fileModalData.studentEmail,
          file_name: fileModalData.fileName.endsWith('.note') ? fileModalData.fileName : `${fileModalData.fileName}.note`,
          title: fileModalData.title,
          session_date: fileModalData.sessionDate,
          session_time: fileModalData.sessionTime,
          category: fileModalData.category,
          severity: fileModalData.severity,
          clinical_observations: fileModalData.clinicalObservations,
          action_plan: fileModalData.actionPlan,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (isUpdate) {
          setNotes(prev => prev.map(n => n.id === fallbackNote.id ? fallbackNote : n));
        } else {
          setNotes(prev => [fallbackNote, ...prev]);
        }
        setIsEditingFile(false);
        setSelectedStudentFolder(fallbackNote.student_anon_id);
      }
    } catch (err) {
      console.error('Error saving note file:', err);
    } finally {
      setSavingNote(false);
    }
  };

  // Delete Note File
  const handleDeleteNoteFile = async (noteId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this clinical note file?')) return;

    try {
      await fetch(`/api/bookings/notes/${noteId}`, { method: 'DELETE' });
    } catch (e) {}

    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (activeFileModal?.id === noteId) {
      setActiveFileModal(null);
    }
  };

  // Create New Student Folder
  const handleCreateNewFolder = (e) => {
    e?.preventDefault();
    const cleanId = newFolderData.studentAnonId.trim();
    if (!cleanId) {
      alert('Please provide a Student Anonymous ID or Name.');
      return;
    }

    const folderAnonId = cleanId.startsWith('anon_') ? cleanId : `anon_${cleanId.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Create an initial intake note file to establish the folder
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newNote = {
      id: `note_${Date.now()}`,
      student_anon_id: folderAnonId,
      student_name: newFolderData.studentName.trim() || 'LTCE Scholar',
      student_course: newFolderData.studentCourse,
      student_year: newFolderData.studentYear,
      student_email: newFolderData.studentEmail.trim(),
      file_name: `Case_File_Opened_${dateStr}.note`,
      title: 'Case Folder Established & Initial Intake',
      session_date: dateStr,
      session_time: timeStr,
      category: 'Intake Consultation',
      severity: 'Normal',
      clinical_observations: 'Student profile registered in Counselor Clinical Notes. Ready for confidential therapy sessions and guidance.',
      action_plan: 'Coordinate schedule for initial intake interview.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    setIsNewFolderModalOpen(false);
    setSelectedStudentFolder(folderAnonId);
  };

  // Print/Download single note file
  const handlePrintNote = (note) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${note.file_name} - CampusCare Confidential Note</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.6; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0 0 5px 0; }
          .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0284c7; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; background: #f8fafc; border: 1px solid #e2e8f0; }
          .meta-table td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 13px; }
          .meta-table td.label { font-weight: bold; color: #475569; width: 160px; background: #f1f5f9; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
          .content-box { background: #ffffff; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; white-space: pre-wrap; font-size: 14px; }
          .footer { margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="badge">CONFIDENTIAL CLINICAL RECORD • CAMPUSCARE</div>
          <h1 class="title">${note.title || 'Clinical Consultation Record'}</h1>
          <div style="color: #64748b; font-size: 13px;">File: <code>${note.file_name}</code> • Lokmanya Tilak College of Engineering</div>
        </div>

        <table class="meta-table">
          <tr>
            <td class="label">Student Name / Pseudonym:</td>
            <td><strong>${note.student_name}</strong></td>
            <td class="label">Anonymous ID:</td>
            <td><code>${note.student_anon_id}</code></td>
          </tr>
          <tr>
            <td class="label">Department:</td>
            <td>${note.student_course}</td>
            <td class="label">Academic Year:</td>
            <td>${note.student_year}</td>
          </tr>
          <tr>
            <td class="label">Session Date & Time:</td>
            <td><strong>${note.session_date}</strong> at <strong>${note.session_time}</strong></td>
            <td class="label">Consultation Category:</td>
            <td><strong>${note.category}</strong> (${note.severity})</td>
          </tr>
          <tr>
            <td class="label">Designated Counselor:</td>
            <td colspan="3">${counselorName} (${counselorDept})</td>
          </tr>
        </table>

        <div class="section">
          <div class="section-title">Clinical Observations & Session Discussion</div>
          <div class="content-box">${note.clinical_observations || 'No specific clinical observations recorded for this session.'}</div>
        </div>

        <div class="section">
          <div class="section-title">Action Plan & Recommendations for Student</div>
          <div class="content-box">${note.action_plan || 'No ongoing action plan specified.'}</div>
        </div>

        <div class="footer">
          Lokmanya Tilak College of Engineering • Student Welfare & Psychological Counseling Portal<br/>
          This document contains protected and privileged educational/psychological counsel. Unauthorized reproduction is prohibited.
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  const getCategoryColor = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('intake')) return { bg: 'var(--brand-blue-pale)', text: 'var(--brand-blue)', border: 'var(--border)' };
    if (c.includes('stress') || c.includes('anxiety')) return { bg: 'var(--orange-pale)', text: 'var(--orange)', border: 'var(--border)' };
    if (c.includes('crisis')) return { bg: 'var(--coral-pale)', text: 'var(--error)', border: 'var(--border)' };
    if (c.includes('well-being') || c.includes('resolved')) return { bg: 'var(--green-pale)', text: 'var(--green)', border: 'var(--border)' };
    return { bg: 'var(--teal-pale)', text: 'var(--teal)', border: 'var(--border)' };
  };

  return (
    <div className="counselor-notes-container" style={{ marginTop: '0.5rem' }}>
      
      {/* Top Banner & Folder Stats Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        padding: '1.25rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: 'var(--radius-sm)', 
            background: 'var(--orange-pale)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.4rem',
            border: '1px solid var(--border)'
          }}>
            📁
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Clinical Case Folders &amp; Session Notes
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Folder-based records with student case info, consultation timestamps, and individual <code>.note</code> files.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsNewFolderModalOpen(true)}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📁➕</span> New Student Folder
          </button>
          <button
            onClick={() => handleOpenCreateNote()}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid transparent',
              background: 'var(--brand-blue)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(35, 65, 90, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📄➕</span> Create Note File
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.8rem',
        marginBottom: '1.25rem',
        padding: '0.65rem 1rem',
        background: 'var(--bg-card2)',
        borderRadius: '10px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
          <span 
            onClick={() => setSelectedStudentFolder(null)}
            style={{ 
              cursor: 'pointer', 
              color: selectedStudentFolder ? 'var(--teal)' : 'var(--text)', 
              fontWeight: selectedStudentFolder ? 500 : 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📁 All Student Case Folders ({allFolders.length})
          </span>

          {currentFolder && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: 'var(--orange)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                📂 {currentFolder.name} ({currentFolder.anonId})
              </span>
            </>
          )}
        </div>

        {selectedStudentFolder && (
          <button
            onClick={() => setSelectedStudentFolder(null)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            ← Back to All Folders
          </button>
        )}
      </div>

      {/* Search & Department Filters (Visible in All Folders view) */}
      {!selectedStudentFolder && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setDepartmentFilter('All')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: departmentFilter === 'All' ? 'var(--teal)' : 'var(--border)',
                background: departmentFilter === 'All' ? 'var(--teal-soft)' : 'var(--bg-card)',
                color: departmentFilter === 'All' ? 'var(--teal)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              All Folders ({allFolders.length})
            </button>
            <button
              onClick={() => setDepartmentFilter('same-dept')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: departmentFilter === 'same-dept' ? 'var(--orange)' : 'var(--border)',
                background: departmentFilter === 'same-dept' ? 'var(--orange-pale)' : 'var(--surface)',
                color: departmentFilter === 'same-dept' ? 'var(--orange)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              ⭐ My Department Folders
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              placeholder="Search student, ID, or file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modal-input no-mb"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
            />
          </div>
        </div>
      )}

      {/* VIEW 1: ALL STUDENT FOLDERS GRID */}
      {!selectedStudentFolder ? (
        <div>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading student case folders...
            </div>
          ) : filteredFolders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>No student case folders match this filter.</p>
              <button 
                onClick={() => setIsNewFolderModalOpen(true)}
                className="btn-pill"
                style={{ background: 'var(--teal-soft)', color: 'var(--teal)', border: '1px solid var(--border-bright)' }}
              >
                📁➕ Create First Student Folder
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
              {filteredFolders.map(folder => {
                const matchesDept = isSameDept(folder.course, counselorDept);
                return (
                  <div
                    key={folder.anonId}
                    onClick={() => setSelectedStudentFolder(folder.anonId)}
                    style={{
                      background: 'var(--bg-card)',
                      border: matchesDept ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: matchesDept ? '0 4px 18px rgba(245, 158, 11, 0.08)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = matchesDept ? '#f59e0b' : 'var(--teal)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = matchesDept ? 'rgba(245, 158, 11, 0.4)' : 'var(--border)'}
                  >
                    <div>
                      {/* Top folder badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '2rem' }}>📁</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>
                              {folder.name}
                            </div>
                            <code style={{ fontSize: '0.75rem', color: 'var(--teal)' }}>
                              {folder.anonId}
                            </code>
                          </div>
                        </div>

                        {matchesDept && (
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 600, 
                            background: 'rgba(245, 158, 11, 0.15)', 
                            color: '#fbbf24', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '6px',
                            border: '1px solid rgba(245, 158, 11, 0.3)'
                          }}>
                            ⭐ Same Dept
                          </span>
                        )}
                      </div>

                      {/* Course & Year */}
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                        <div>🏛️ <strong>{folder.course}</strong></div>
                        <div>🎓 Year: {folder.year}</div>
                        {folder.email && <div>✉️ {folder.email}</div>}
                      </div>
                    </div>

                    {/* Folder footer */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border)',
                      fontSize: '0.78rem',
                      color: 'var(--text-dim)'
                    }}>
                      <span>📄 <strong>{folder.files.length}</strong> note file{folder.files.length === 1 ? '' : 's'}</span>
                      <span style={{ color: 'var(--teal)', fontWeight: 600 }}>Open Folder &rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: INSIDE A SPECIFIC STUDENT'S CASE FOLDER */
        <div>
          {/* Student Dossier Header Card */}
          <div style={{ 
            background: 'var(--bg-card)', 
            border: isSameDept(currentFolder?.course, counselorDept) ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '1.75rem' }}>📂</span>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)' }}>
                  {currentFolder?.name}'s Case Folder
                </h2>
                {isSameDept(currentFolder?.course, counselorDept) && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '0.2rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    ⭐ Same Department Scholar
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <span>🆔 Anonymous ID: <strong style={{ color: 'var(--teal)' }}>{currentFolder?.anonId}</strong></span>
                <span>🏛️ Course: <strong>{currentFolder?.course}</strong></span>
                <span>🎓 Year: <strong>{currentFolder?.year}</strong></span>
                {currentFolder?.email && <span>✉️ Email: <strong>{currentFolder?.email}</strong></span>}
                <span>📊 Case Files: <strong>{currentFolder?.files.length}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {currentFolder?.email && (
                <a
                  href={`mailto:${currentFolder.email}?subject=CampusCare Consultation with Counselor ${counselorName}&body=Dear ${currentFolder.name},%0D%0A%0D%0AThis is counselor ${counselorName} regarding our clinical consultation notes.`}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card2)',
                    color: 'var(--teal)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>✉️</span> Email Student
                </a>
              )}
              <button
                onClick={() => handleOpenCreateNote(currentFolder)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid transparent',
                  background: 'var(--brand-blue)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(35, 65, 90, 0.08)'
                }}
              >
                <span>➕</span> Add Note File
              </button>
            </div>
          </div>

          {/* Files in Folder */}
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Clinical Session Files in this Folder ({currentFolder?.files.length || 0})
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Click on any file card to view, read, or print full case record.
            </span>
          </div>

          {currentFolder?.files.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>No note files created yet in this folder.</p>
              <button 
                onClick={() => handleOpenCreateNote(currentFolder)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--brand-blue)',
                  color: '#fff',
                  border: '1px solid transparent',
                  fontWeight: 500,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ➕ Create First Note File
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {currentFolder.files.map((file) => {
                const badgeTheme = getCategoryColor(file.category);
                return (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileModal(file)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--teal)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div>
                      {/* Top: File icon and category badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '1.3rem' }}>📄</span>
                          <code style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24', wordBreak: 'break-all' }}>
                            {file.file_name}
                          </code>
                        </div>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 600, 
                          background: badgeTheme.bg, 
                          color: badgeTheme.text, 
                          border: `1px solid ${badgeTheme.border}`,
                          padding: '0.15rem 0.45rem', 
                          borderRadius: '4px' 
                        }}>
                          {file.category || 'Consultation'}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.98rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                        {file.title || 'Clinical Session Note'}
                      </h4>

                      {/* Time & Date Tag */}
                      <div style={{ fontSize: '0.78rem', color: 'var(--teal)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📅 {file.session_date}</span>
                        <span>•</span>
                        <span>⏰ {file.session_time}</span>
                        {file.severity && (
                          <>
                            <span>•</span>
                            <span style={{ color: file.severity === 'Priority' ? '#f87171' : 'var(--text-muted)' }}>
                              Status: {file.severity}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Excerpt */}
                      <p style={{ 
                        margin: 0, 
                        fontSize: '0.82rem', 
                        color: 'var(--text-muted)', 
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {file.clinical_observations || 'Click to view details and action plan...'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginTop: '1rem', 
                      paddingTop: '0.6rem', 
                      borderTop: '1px solid var(--border)',
                      fontSize: '0.78rem'
                    }}>
                      <span style={{ color: 'var(--teal)', fontWeight: 600 }}>
                        👁️ Open &amp; Read File
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditNote(file)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card2)',
                            color: 'var(--text)',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Edit File"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={(e) => handleDeleteNoteFile(file.id, e)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#f87171',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Delete File"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FILE VIEWER (READ NOTE FILE)                                     */}
      {/* ========================================================================= */}
      {activeFileModal && (
        <div 
          className="modal-overlay open" 
          onClick={(e) => { if (e.target.className.includes('modal-overlay')) setActiveFileModal(null); }}
          style={{ zIndex: 1050 }}
        >
          <div className="modal" style={{ maxWidth: '650px', width: '95%', background: 'var(--bg-card)', border: '1px solid var(--border-bright)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  <span>📄 FILE:</span> {activeFileModal.file_name}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text)' }}>
                  {activeFileModal.title || 'Clinical Session Record'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveFileModal(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Metadata Table */}
            <div style={{ 
              background: 'var(--bg-card2)', 
              borderRadius: '10px', 
              padding: '0.9rem', 
              marginBottom: '1rem', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '0.6rem',
              fontSize: '0.82rem' 
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Student:</span>{' '}
                <strong>{activeFileModal.student_name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Anonymous ID:</span>{' '}
                <code style={{ color: 'var(--teal)' }}>{activeFileModal.student_anon_id}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Date &amp; Time:</span>{' '}
                <strong>{activeFileModal.session_date}</strong> at <strong>{activeFileModal.session_time}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Category:</span>{' '}
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{activeFileModal.category}</span> ({activeFileModal.severity})
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Department:</span>{' '}
                <strong>{activeFileModal.student_course}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Counselor:</span>{' '}
                <strong>{counselorName}</strong>
              </div>
            </div>

            {/* Clinical Observations */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="modal-label" style={{ color: 'var(--teal)', fontSize: '0.85rem' }}>
                🧠 Clinical Observations &amp; Session Notes
              </label>
              <div style={{ 
                background: 'var(--bg-card2)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                padding: '0.85rem', 
                fontSize: '0.88rem', 
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                color: 'var(--text)'
              }}>
                {activeFileModal.clinical_observations || 'No observations recorded.'}
              </div>
            </div>

            {/* Action Plan */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="modal-label" style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
                🎯 Action Plan &amp; Recommendations for Student
              </label>
              <div style={{ 
                background: 'var(--bg-card2)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                padding: '0.85rem', 
                fontSize: '0.88rem', 
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                color: 'var(--text)'
              }}>
                {activeFileModal.action_plan || 'No ongoing action plan recorded.'}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handlePrintNote(activeFileModal)}
                style={{
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  background: 'var(--bg-card2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖨️</span> Print / Export Note
              </button>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={() => handleOpenEditNote(activeFileModal)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--brand-blue)',
                    color: '#fff',
                    border: '1px solid transparent',
                    fontWeight: 500,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Edit This File
                </button>
                <button
                  onClick={() => setActiveFileModal(null)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    background: 'var(--bg-card2)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE / EDIT NOTE FILE                                          */}
      {/* ========================================================================= */}
      {isEditingFile && (
        <div 
          className="modal-overlay open" 
          onClick={(e) => { if (e.target.className.includes('modal-overlay')) setIsEditingFile(false); }}
          style={{ zIndex: 1060 }}
        >
          <div className="modal" style={{ maxWidth: '650px', width: '95%', background: 'var(--bg-card)', border: '1px solid var(--border-bright)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>{fileModalData.id ? '✏️' : '📄➕'}</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>
                  {fileModalData.id ? `Edit File: ${fileModalData.fileName}` : `Create Note File for ${fileModalData.studentName}`}
                </h3>
              </div>
              <button 
                onClick={() => setIsEditingFile(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {saveSuccessMsg && (
              <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '8px', color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ✅ {saveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveNoteFile}>
              {/* File Name & Title */}
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <label className="modal-label">File Name (.note)</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={fileModalData.fileName}
                    onChange={(e) => setFileModalData({ ...fileModalData, fileName: e.target.value })}
                    placeholder="e.g. Session_Intake.note"
                    required
                  />
                </div>
                <div style={{ flex: 1.5, minWidth: '250px' }}>
                  <label className="modal-label">Session Topic / Title</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={fileModalData.title}
                    onChange={(e) => setFileModalData({ ...fileModalData, title: e.target.value })}
                    placeholder="e.g. Exam Anxiety & Time Blocking"
                    required
                  />
                </div>
              </div>

              {/* Date, Time, Category, Status */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
                <div>
                  <label className="modal-label">Session Date</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={fileModalData.sessionDate}
                    onChange={(e) => setFileModalData({ ...fileModalData, sessionDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="modal-label">Session Time</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={fileModalData.sessionTime}
                    onChange={(e) => setFileModalData({ ...fileModalData, sessionTime: e.target.value })}
                    placeholder="e.g. 02:00 PM"
                    required
                  />
                </div>
                <div>
                  <label className="modal-label">Category</label>
                  <select
                    className="modal-input"
                    value={fileModalData.category}
                    onChange={(e) => setFileModalData({ ...fileModalData, category: e.target.value })}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Intake Consultation">Intake Consultation</option>
                    <option value="Academic Stress">Academic Stress</option>
                    <option value="Follow-up Session">Follow-up Session</option>
                    <option value="Emotional Well-being">Emotional Well-being</option>
                    <option value="Career & Burnout">Career & Burnout</option>
                    <option value="Crisis Support">Crisis Support</option>
                    <option value="General Consultation">General Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="modal-label">Severity / Outcome</label>
                  <select
                    className="modal-input"
                    value={fileModalData.severity}
                    onChange={(e) => setFileModalData({ ...fileModalData, severity: e.target.value })}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Requires Follow-up">Requires Follow-up</option>
                    <option value="Priority">Priority Attention</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Observations */}
              <label className="modal-label">Clinical Observations &amp; Session Summary</label>
              <textarea
                rows={4}
                className="modal-input"
                value={fileModalData.clinicalObservations}
                onChange={(e) => setFileModalData({ ...fileModalData, clinicalObservations: e.target.value })}
                placeholder="Document student mental state, presenting issues, cognitive assessment, emotional regulation..."
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                required
              />

              {/* Action Plan */}
              <label className="modal-label">Action Plan, Exercises &amp; Follow-up Recommendations</label>
              <textarea
                rows={3}
                className="modal-input"
                value={fileModalData.actionPlan}
                onChange={(e) => setFileModalData({ ...fileModalData, actionPlan: e.target.value })}
                placeholder="Prescribed exercises (e.g. 4-7-8 breathing), study modifications, follow-up timeline..."
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingFile(false)}
                  style={{
                    padding: '0.65rem 1.1rem',
                    borderRadius: '8px',
                    background: 'var(--bg-card2)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--brand-blue)',
                    color: '#fff',
                    border: '1px solid transparent',
                    fontWeight: 500,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(35, 65, 90, 0.08)'
                  }}
                >
                  {savingNote ? 'Saving File...' : '💾 Save Note File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE NEW STUDENT FOLDER                                        */}
      {/* ========================================================================= */}
      {isNewFolderModalOpen && (
        <div 
          className="modal-overlay open" 
          onClick={(e) => { if (e.target.className.includes('modal-overlay')) setIsNewFolderModalOpen(false); }}
          style={{ zIndex: 1060 }}
        >
          <div className="modal" style={{ maxWidth: '520px', width: '95%', background: 'var(--bg-card)', border: '1px solid var(--border-bright)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>📁➕</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>
                  Create New Student Case Folder
                </h3>
              </div>
              <button 
                onClick={() => setIsNewFolderModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewFolder}>
              <label className="modal-label">Student Anonymous ID or Roll / Identifier</label>
              <input
                type="text"
                className="modal-input"
                placeholder="e.g. anon_student456 or LTCE-DS-24"
                value={newFolderData.studentAnonId}
                onChange={(e) => setNewFolderData({ ...newFolderData, studentAnonId: e.target.value })}
                required
              />

              <label className="modal-label">Student Name or Pseudonym</label>
              <input
                type="text"
                className="modal-input"
                placeholder="e.g. Rohan Verma"
                value={newFolderData.studentName}
                onChange={(e) => setNewFolderData({ ...newFolderData, studentName: e.target.value })}
              />

              <label className="modal-label">Engineering Department</label>
              <select
                className="modal-input"
                value={newFolderData.studentCourse}
                onChange={(e) => setNewFolderData({ ...newFolderData, studentCourse: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                <option value="Computer Science & Engineering (Data Science)">CSE (Data Science)</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Computer Science & Engineering (AIML)">CSE (AI &amp; ML)</option>
                <option value="Computer Science & Engineering (IoT and Cyber Security)">CSE (IoT &amp; Cyber Security)</option>
                <option value="Electronics & Telecommunication Engineering">Electronics &amp; Telecom Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
              </select>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="modal-label">Academic Year</label>
                  <select
                    className="modal-input"
                    value={newFolderData.studentYear}
                    onChange={(e) => setNewFolderData({ ...newFolderData, studentYear: e.target.value })}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="1st Year">1st Year (FE)</option>
                    <option value="2nd Year">2nd Year (SE)</option>
                    <option value="3rd Year">3rd Year (TE)</option>
                    <option value="4th Year">4th Year (BE)</option>
                  </select>
                </div>
                <div style={{ flex: 1.5 }}>
                  <label className="modal-label">Student Email (Optional)</label>
                  <input
                    type="email"
                    className="modal-input"
                    placeholder="student@gmail.com"
                    value={newFolderData.studentEmail}
                    onChange={(e) => setNewFolderData({ ...newFolderData, studentEmail: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    background: 'var(--bg-card2)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--brand-blue)',
                    color: '#fff',
                    border: '1px solid transparent',
                    fontWeight: 500,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(35, 65, 90, 0.08)'
                  }}
                >
                  📁 Create Case Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
