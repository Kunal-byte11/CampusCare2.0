import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, openModal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const path = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [counselorPhoto, setCounselorPhoto] = useState(() => {
    try {
      const p = localStorage.getItem('campuscare-counselor-profile');
      if (p) return JSON.parse(p)?.photo || null;
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    const syncPhoto = () => {
      try {
        const p = localStorage.getItem('campuscare-counselor-profile');
        if (p) setCounselorPhoto(JSON.parse(p)?.photo || null);
      } catch (e) {}
    };
    syncPhoto();
    window.addEventListener('storage', syncPhoto);
    window.addEventListener('counselor-profile-updated', syncPhoto);
    return () => {
      window.removeEventListener('storage', syncPhoto);
      window.removeEventListener('counselor-profile-updated', syncPhoto);
    };
  }, [path]);

  // Close mobile menu whenever the route changes
  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) {
    setPrevPath(path);
    setIsMobileMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const promptLogin = (e) => {
    e?.preventDefault();
    closeMobileMenu();
    openModal('login');
  };

  const isCounselor = user?.role === 'counselor';
  const isAppointmentsRoute = 
    path === '/booking' || 
    path === '/counselor' || 
    path === '/counselor-dashboard' || 
    path === '/counselor/dashboard' || 
    path === '/appointments' || 
    path === '/counselor/appointments';
    
  const isNotesRoute = 
    path === '/counselor-notes' || 
    path === '/notes' || 
    path === '/counselor/notes';

  const homeTarget = isAuthenticated ? (isCounselor ? '/booking' : '/home') : '/';

  return (
    <>
      <nav className="campuscare-main-nav">
        <Link to={homeTarget} className="nav-logo" onClick={closeMobileMenu}>
          <div className="nav-logo-icon">🌿</div>
          <span>CampusCare</span>
        </Link>

        {/* Desktop navigation links */}
        <div className="nav-links desktop-only">
          {!isAuthenticated ? (
            <>
              <Link to="/" className={`nav-link ${path === '/' || path === '/home' ? 'active' : ''}`}>
                Home
              </Link>
              <button className="nav-link nav-link-btn-trigger" onClick={promptLogin} title="Login to access AI Chatbot">
                <span>AI Chatbot</span>
                <span className="nav-lock-badge">🔒</span>
              </button>
              <button className="nav-link nav-link-btn-trigger" onClick={promptLogin} title="Login to access Counselor Booking">
                <span>Booking</span>
                <span className="nav-lock-badge">🔒</span>
              </button>
              <Link to="/resources" className={`nav-link ${path === '/resources' ? 'active' : ''}`}>
                Resources
              </Link>
              <button className="nav-link nav-link-btn-trigger" onClick={promptLogin} title="Login to access Forum">
                <span>Forum</span>
                <span className="nav-lock-badge">🔒</span>
              </button>
              <button className="nav-link nav-link-btn-trigger" onClick={promptLogin} title="Login to access Progress Tracker">
                <span>Gamification</span>
                <span className="nav-lock-badge">🔒</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/home" className={`nav-link ${path === '/home' || path === '/' ? 'active' : ''}`}>
                Home
              </Link>
              {isCounselor ? (
                <>
                  <Link 
                    to="/booking" 
                    className={`nav-link ${isAppointmentsRoute ? 'active' : ''}`} 
                    style={{ color: 'var(--teal)', fontWeight: 600 }}
                  >
                    📅 Appointments
                  </Link>
                  <Link 
                    to="/counselor-notes" 
                    className={`nav-link ${isNotesRoute ? 'active' : ''}`} 
                    style={{ color: 'var(--teal)', fontWeight: 600 }}
                  >
                    📁 Clinical Notes
                  </Link>
                  <Link 
                    to="/counselor-profile" 
                    className={`nav-link ${path === '/counselor-profile' || path === '/counselor/profile' || path === '/profile' ? 'active' : ''}`} 
                    style={{ color: 'var(--brand-blue)', fontWeight: 600 }}
                  >
                    👩‍🏫 Profile
                  </Link>
                </>
              ) : (
                <Link to="/booking" className={`nav-link ${path === '/booking' ? 'active' : ''}`}>
                  Booking
                </Link>
              )}
              <Link to="/chatbot" className={`nav-link ${path === '/chatbot' ? 'active' : ''}`}>
                Chatbot
              </Link>
              <Link to="/resources" className={`nav-link ${path === '/resources' ? 'active' : ''}`}>
                Resources
              </Link>
              <Link to="/forum" className={`nav-link ${path === '/forum' ? 'active' : ''}`}>
                Forum
              </Link>
              <Link to="/gamification" className={`nav-link ${path === '/gamification' ? 'active' : ''}`}>
                Gamification
              </Link>
            </>
          )}
        </div>

        <div className="nav-right">
          <button
            className="nav-theme-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme (Alt+T)' : 'Switch to Dark Theme (Alt+T)'}
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {!isAuthenticated ? (
            <>
              <div 
                className="nav-auth desktop-only" 
                onClick={() => openModal('signup')} 
                style={{ cursor: 'pointer' }}
                title="Click to register with institutional email"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Not authenticated
              </div>

              <button className="btn-login desktop-only" onClick={() => openModal('login')}>
                Login
              </button>

              <button 
                className="btn-talk desktop-only" 
                onClick={() => openModal('signup')}
                style={{ cursor: 'pointer' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Join Now
              </button>
            </>
          ) : (
            <>
              {user?.role === 'counselor' ? (
                <Link 
                  to="/counselor-profile" 
                  className="nav-user-badge nav-counselor-profile-btn desktop-only" 
                  title="View & Edit Counselor Official Profile (Ms. Shahista Kazi)"
                >
                  {counselorPhoto ? (
                    <img
                      src={counselorPhoto}
                      alt="Counselor Profile"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                        border: '1px solid var(--border-bright)'
                      }}
                    />
                  ) : (
                    <span className="counselor-badge-avatar">👩‍🏫</span>
                  )}
                  <div className="counselor-badge-info">
                    <span className="counselor-badge-name">Ms. Shahista Kazi</span>
                    <span className="counselor-badge-role">Counselor Profile &rarr;</span>
                  </div>
                </Link>
              ) : (
                <div className="nav-user-badge desktop-only" title={`Logged in anonymously as ${user?.anonId}`}>
                  <span className="nav-status-dot"></span>
                  <span className="nav-user-id">
                    {user?.anonId?.length > 16 ? user.anonId.slice(0, 14) + '...' : user?.anonId}
                  </span>
                </div>
              )}

              <Link 
                to="/chatbot" 
                className="btn-talk desktop-only" 
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Talk now
              </Link>

              <button className="btn-logout desktop-only" onClick={handleLogout} title="Log out of session">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </>
          )}

          {/* Mobile hamburger button */}
          <button 
            className={`nav-hamburger ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>
      </nav>

      {/* Mobile navigation drawer & backdrop */}
      <div 
        className={`mobile-nav-backdrop ${isMobileMenuOpen ? 'visible' : ''}`} 
        onClick={closeMobileMenu}
      />
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div className="mobile-nav-title">
            {isAuthenticated ? 'Student Portal' : 'Navigation'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="nav-theme-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button className="mobile-nav-close" onClick={closeMobileMenu} aria-label="Close menu">✕</button>
          </div>
        </div>

        <div className="mobile-nav-links">
          {!isAuthenticated ? (
            <>
              <Link to="/" className={`mobile-nav-link ${path === '/' || path === '/home' ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span className="mn-icon">🏠</span>
                <span>Home</span>
              </Link>
              <div className="mobile-nav-section-label">Restricted Member Features</div>
              <button className="mobile-nav-link mobile-nav-btn-locked" onClick={promptLogin}>
                <span className="mn-icon">💬</span>
                <span>AI Chatbot</span>
                <span className="mn-lock">🔒</span>
              </button>
              <button className="mobile-nav-link mobile-nav-btn-locked" onClick={promptLogin}>
                <span className="mn-icon">📅</span>
                <span>Book Counselor</span>
                <span className="mn-lock">🔒</span>
              </button>
              <Link to="/resources" className={`mobile-nav-link ${path === '/resources' ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span className="mn-icon">📚</span>
                <span>Self-Care Library</span>
              </Link>
              <button className="mobile-nav-link mobile-nav-btn-locked" onClick={promptLogin}>
                <span className="mn-icon">👥</span>
                <span>Peer Forum</span>
                <span className="mn-lock">🔒</span>
              </button>
              <button className="mobile-nav-link mobile-nav-btn-locked" onClick={promptLogin}>
                <span className="mn-icon">🏆</span>
                <span>Your Progress</span>
                <span className="mn-lock">🔒</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/home" className={`mobile-nav-link ${path === '/home' || path === '/' ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span className="mn-icon">🏠</span>
                <span>Home</span>
              </Link>
              {isCounselor ? (
                <>
                  <Link 
                    to="/counselor-profile" 
                    className={`mobile-nav-link ${path === '/counselor-profile' || path === '/counselor/profile' || path === '/profile' ? 'active' : ''}`} 
                    onClick={closeMobileMenu}
                  >
                    <span className="mn-icon">👩‍🏫</span>
                    <span>Counselor Profile</span>
                  </Link>
                  <Link 
                    to="/booking" 
                    className={`mobile-nav-link ${isAppointmentsRoute ? 'active' : ''}`} 
                    onClick={closeMobileMenu}
                  >
                    <span className="mn-icon">📅</span>
                    <span>Appointments Desk</span>
                  </Link>
                  <Link 
                    to="/counselor-notes" 
                    className={`mobile-nav-link ${isNotesRoute ? 'active' : ''}`} 
                    onClick={closeMobileMenu}
                  >
                    <span className="mn-icon">📁</span>
                    <span>Student Clinical Notes</span>
                  </Link>
                </>
              ) : (
                <Link to="/booking" className={`mobile-nav-link ${path === '/booking' ? 'active' : ''}`} onClick={closeMobileMenu}>
                  <span className="mn-icon">📅</span>
                  <span>Book Counselor</span>
                </Link>
              )}
              <Link to="/chatbot" className={`mobile-nav-link ${path === '/chatbot' ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span className="mn-icon">💬</span>
                <span>AI Chatbot</span>
              </Link>
              <Link to="/resources" className={`mobile-nav-link ${path === '/resources' ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span className="mn-icon">📚</span>
                <span>Self-Care Library</span>
              </Link>
              <Link to="/forum" className={`mobile-nav-link ${path === '/forum' ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span className="mn-icon">👥</span>
                <span>Peer Forum</span>
              </Link>
              <Link to="/gamification" className={`mobile-nav-link ${path === '/gamification' ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span className="mn-icon">🏆</span>
                <span>Your Progress</span>
              </Link>
            </>
          )}
        </div>

        <div className="mobile-nav-footer">
          {!isAuthenticated ? (
            <>
              <button 
                className="btn-talk full-btn" 
                onClick={() => { closeMobileMenu(); openModal('signup'); }}
                style={{ marginBottom: '0.75rem', padding: '0.75rem', justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Register with @ltce.in
              </button>

              <button 
                className="btn-login full-btn" 
                onClick={() => { closeMobileMenu(); openModal('login'); }}
                style={{ marginBottom: '0.75rem', padding: '0.7rem' }}
              >
                Login to Platform
              </button>

              <div 
                className="mobile-auth-card" 
                onClick={() => { closeMobileMenu(); openModal('signup'); }}
              >
                <div className="mac-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span>Not authenticated</span>
                </div>
                <span className="mac-action">Join &rarr;</span>
              </div>
            </>
          ) : (
            <>
              {user?.role === 'counselor' ? (
                <Link
                  to="/counselor-profile"
                  className="mobile-user-card"
                  onClick={closeMobileMenu}
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                  title="Open Counselor Profile"
                >
                  {counselorPhoto ? (
                    <img
                      src={counselorPhoto}
                      alt="Counselor Profile"
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                        border: '1px solid var(--border-bright)'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '1.4rem' }}>👩‍🏫</span>
                  )}
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Counselor</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-blue)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      Ms. Shahista Kazi
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', fontWeight: 600 }}>Profile &rarr;</span>
                </Link>
              ) : (
                <div className="mobile-user-card">
                  <div className="nav-status-dot"></div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged in anonymously</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--teal)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {user?.anonId}
                    </div>
                  </div>
                </div>
              )}

              <Link 
                to="/chatbot" 
                className="btn-talk full-btn" 
                onClick={closeMobileMenu}
                style={{ textDecoration: 'none', justifyContent: 'center', marginBottom: '0.75rem', padding: '0.75rem' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Talk Now
              </Link>

              <button 
                className="btn-logout full-btn" 
                onClick={() => { closeMobileMenu(); handleLogout(); }}
                style={{ padding: '0.7rem', justifyContent: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
