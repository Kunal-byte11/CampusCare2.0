import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home({ openModal }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isCounselor = user?.role === 'counselor';

  const handleStartChat = () => {
    if (!isAuthenticated && openModal) {
      openModal('login');
    } else {
      navigate('/chatbot');
    }
  };

  const handleBookCounselor = () => {
    if (!isAuthenticated && openModal) {
      openModal('login');
    } else {
      navigate('/booking');
    }
  };

  return (
    <div className="page active" id="page-home">
      <div className="hero">
        <div className="hero-left">
          {isCounselor ? (
            <>
              <div className="hero-badge" style={{ background: 'rgba(20, 184, 166, 0.15)', borderColor: 'rgba(20, 184, 166, 0.4)', color: 'var(--teal)' }}>
                <span>👩‍🏫</span> Official LTCE Campus Counselor Portal · <strong>Ms. Shahista Kazi</strong>
              </div>
              <h1 className="hero-title">Student Consultations &amp;<br />Clinical Case Folders</h1>
              <p className="hero-sub">
                Manage student appointment bookings, review psychological intake assessments, organize folder-based clinical notes with explicit date &amp; time tracking, and connect directly with your engineering department scholars.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => navigate('/booking')}>
                  <span>📅</span> Consultation Desk
                </button>
                <button className="btn-secondary" onClick={() => navigate('/counselor-notes')}>
                  <span>📁</span> Clinical Case Notes
                </button>
                <div className="hero-privacy" style={{ color: 'var(--teal)' }}>
                  🔒 Confidential Student Clinical Records
                </div>
              </div>
              <div className="hero-features">
                <div className="feature-card" onClick={() => navigate('/counselor-notes')} style={{ cursor: 'pointer' }}>
                  <h4>📁 Folder System</h4>
                  <p>Organize case files per student with full student dossier, date, and time.</p>
                </div>
                <div className="feature-card" onClick={() => navigate('/booking')} style={{ cursor: 'pointer' }}>
                  <h4>📅 Live Session Desk</h4>
                  <p>Track today's student appointments and departmental connections.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="hero-badge">
                <span style={{ color: 'var(--teal)' }}>●</span> Welcome, <strong>{user?.anonId || 'LTCE Scholar'}</strong>
              </div>
              <h1 className="hero-title">Support when you need it—<br />private, fast, and caring.</h1>
              <p className="hero-sub">Chat with our AI first-aid bot, book a counselor, explore coping tools, or connect with peers. Anonymous by default. Your privacy is protected.</p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={handleStartChat}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  Start Chat
                </button>
                <button className="btn-secondary" onClick={handleBookCounselor}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Book Counselor
                </button>
                <div className="hero-privacy">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Pseudonym only. No names required.
                </div>
              </div>
              <div className="hero-features">
                <div className="feature-card">
                  <h4>⚡ Get help in 2 taps</h4>
                  <p>Open chat, pick a quick reply, and breathe. We guide you step-by-step.</p>
                </div>
                <div className="feature-card">
                  <h4>🗓️ Book in under 30s</h4>
                  <p>Filter by language and specialty. Pick a time. Get reminders.</p>
                </div>
                <div className="feature-card">
                  <h4>🧠 Coping Tools</h4>
                  <p>Breathing exercises, journaling prompts, and grounding techniques.</p>
                </div>
                <div className="feature-card">
                  <h4>👥 Peer Support</h4>
                  <p>Connect with others who understand. Share, listen, grow together.</p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="hero-right">
          <div className="hero-illustration">
            <svg className="person-svg" viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="40" r="3" fill="#1cc8cc" opacity="0.6" />
              <circle cx="240" cy="30" r="4" fill="#1cc8cc" opacity="0.5" />
              <circle cx="270" cy="100" r="2.5" fill="#1cc8cc" opacity="0.4" />
              <circle cx="30" cy="150" r="3" fill="#1cc8cc" opacity="0.5" />
              <circle cx="280" cy="200" r="3.5" fill="#1cc8cc" opacity="0.4" />
              <circle cx="50" cy="230" r="2" fill="#fff" opacity="0.3" />
              <circle cx="190" cy="220" r="2" fill="#fff" opacity="0.25" />
              <circle cx="100" cy="72" r="38" stroke="#1cc8cc" strokeWidth="2.5" fill="none" />
              <path d="M28 230 Q28 155 100 155 Q172 155 172 230" stroke="#1cc8cc" strokeWidth="2.5" fill="none" />
              <circle cx="210" cy="58" r="28" stroke="#1cc8cc" strokeWidth="2" fill="none" />
              <path d="M158 230 Q158 168 210 168 Q262 168 262 230" stroke="#1cc8cc" strokeWidth="2" fill="none" />
              <line x1="20" y1="230" x2="280" y2="230" stroke="#1cc8cc" strokeWidth="1.5" opacity="0.3" />
            </svg>
          </div>
          <div className="hero-consent-panel">
            <div className="lang-row">
              <div className="lang-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                </svg>
                Language
              </div>
              <div className="lang-select-wrapper">
                <select className="lang-select" defaultValue="English">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>
            </div>
            
            <p className="consent-text full-text">
              We respect your privacy. Conversations are anonymous and stored securely for quality purposes. By continuing, you agree to our privacy policy and consent to non-identifiable data usage for improvement.
            </p>
            
            <label className="consent-checkbox-label">
              <input type="checkbox" className="consent-checkbox" />
              <span className="checkbox-custom"></span>
              I understand and consent
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
