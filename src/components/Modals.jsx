import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function Modals({ activeModal, closeModal, openModal }) {
  const navigate = useNavigate();
  const { login, register, registerCounselor, loginWithGoogleAuth, handleGoogleCredentialResponse } = useAuth();

  // Common & Login states
  const [loginRole, setLoginRole] = useState('student'); // 'student' | 'counselor'
  const [showPwd, setShowPwd] = useState(false);
  const [loginAnonId, setLoginAnonId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Counselor Login states (Username & Password only)
  const [counselorLoginUser, setCounselorLoginUser] = useState('');
  const [counselorLoginPwd, setCounselorLoginPwd] = useState('');
  const [showCounselorLoginPwd, setShowCounselorLoginPwd] = useState(false);
  const [counselorLoginLoading, setCounselorLoginLoading] = useState(false);

  // Register states
  const [signupRole, setSignupRole] = useState('student'); // 'student' | 'counselor'
  const [email, setEmail] = useState('');
  const [registerPwd, setRegisterPwd] = useState('');
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('Computer Engineering');
  const [year, setYear] = useState('1st Year');
  const [signupError, setSignupError] = useState('');
  const [anonId, setAnonId] = useState('');
  const [copied, setCopied] = useState(false);

  // Counselor Registration states ("Join as Counselor")
  const [counselorUsername, setCounselorUsername] = useState('shahista kazi');
  const [counselorPassword, setCounselorPassword] = useState('');
  const [counselorName, setCounselorName] = useState('Ms. Shahista Kazi');
  const [counselorDept, setCounselorDept] = useState('Computer Science & Engineering (Data Science)');
  const [counselorLoading, setCounselorLoading] = useState(false);
  const [counselorSuccessMsg, setCounselorSuccessMsg] = useState('');
  const [showCounselorPwd, setShowCounselorPwd] = useState(false);

  // Autofill helpers for effortless testing
  const fillDemoLogin = () => {
    setLoginAnonId('anon_demo123456789');
    setLoginPassword('password123');
    setLoginError('');
  };

  const onGoogleLoginSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setLoginError('');
    setSignupError('');
    const res = await handleGoogleCredentialResponse(credentialResponse);
    setGoogleLoading(false);
    if (res.success) {
      closeModal();
      navigate('/home');
    } else {
      const errMsg = res.error || 'Google authentication failed.';
      if (activeModal === 'login') {
        setLoginError(errMsg);
      } else {
        setSignupError(errMsg);
      }
    }
  };

  const onGoogleLoginError = () => {
    const errMsg = 'Google Sign In was cancelled or not completed.';
    if (activeModal === 'login') {
      setLoginError(errMsg);
    } else {
      setSignupError(errMsg);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setLoginError('');
    setSignupError('');
    const res = await loginWithGoogleAuth();
    setGoogleLoading(false);
    if (!res.success) {
      const errMsg = res.error || 'Unable to connect to Google Auth.';
      if (activeModal === 'login') {
        setLoginError(errMsg);
      } else {
        setSignupError(errMsg);
      }
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoginError('');

    if (!loginAnonId.trim()) {
      setLoginError('Please enter your Anonymous ID or Gmail address.');
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    const res = await login(loginAnonId, loginPassword);
    if (res.success) {
      closeModal();
      if (res.user?.role === 'counselor') {
        navigate('/booking');
      } else {
        navigate('/home');
      }
    } else {
      setLoginError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleCounselorLogin = async (e) => {
    e?.preventDefault();
    setLoginError('');

    if (!counselorLoginUser.trim()) {
      setLoginError('Please enter Counselor Username.');
      return;
    }

    if (!counselorLoginPwd) {
      setLoginError('Please enter Counselor Password.');
      return;
    }

    setCounselorLoginLoading(true);
    const res = await login(counselorLoginUser.trim(), counselorLoginPwd);
    setCounselorLoginLoading(false);

    if (res.success) {
      closeModal();
      navigate('/booking');
    } else {
      setLoginError(res.error || 'Counselor login failed. Please verify credentials.');
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setSignupError('');

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setSignupError('Please enter your Gmail address.');
      return;
    }

    if (!cleanEmail.endsWith('@gmail.com')) {
      setSignupError('Registration is exclusively for Google Mail (@gmail.com) addresses.');
      return;
    }

    if (!registerPwd || registerPwd.length < 6) {
      setSignupError('Password must be at least 6 characters long.');
      return;
    }

    const res = await register(cleanEmail, registerPwd, {
      name: fullName,
      course,
      year
    });

    if (res.success) {
      setAnonId(res.anonId);
      openModal('success');
    } else {
      setSignupError(res.error || 'Registration failed.');
    }
  };

  const handleCounselorRegister = async (e) => {
    e?.preventDefault();
    setSignupError('');
    setCounselorSuccessMsg('');
    setCounselorLoading(true);

    if (!counselorUsername.trim()) {
      setSignupError('Please enter Counselor Username.');
      setCounselorLoading(false);
      return;
    }

    const effectivePassword = counselorPassword.trim() || 'beb40c8aa0ffa05a2157bc3fbbc49b54b9ff5a3fee00539b0b9ebeef845f5d49';

    const res = await registerCounselor({
      username: counselorUsername,
      password: effectivePassword,
      name: counselorName,
      department: counselorDept
    });

    setCounselorLoading(false);
    if (res.success) {
      setCounselorSuccessMsg('Counselor account for Ms. Shahista Kazi saved to database successfully!');
      setTimeout(() => {
        closeModal();
        navigate('/booking');
      }, 1000);
    } else {
      setSignupError(res.error || 'Counselor registration failed.');
    }
  };

  const handleContinueAfterRegister = () => {
    closeModal();
    navigate('/home');
  };

  const copyAnonId = () => {
    if (anonId) {
      navigator.clipboard?.writeText(anonId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activeModal) return null;

  return (
    <>
      {activeModal === 'login' && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target.className.includes('modal-overlay')) closeModal(); }}>
          <div className="modal modal-wide">
            <button type="button" className="modal-close-btn" onClick={closeModal} title="Close modal" aria-label="Close">✕</button>
            <div className="modal-two-col">
              <div className="modal-form-side">
                <div className="modal-logo-icon">🌿</div>
                <h3>{loginRole === 'counselor' ? 'Counselor Sign In' : 'Welcome back'}</h3>
                <p>
                  {loginRole === 'counselor'
                    ? 'Enter your official counselor username and password to access the counseling desk'
                    : 'Sign in with Google or enter your credentials to access CampusCare'}
                </p>

                {/* Role Switcher: Student Login vs Counselor Login */}
                <div style={{
                  display: 'flex',
                  background: 'var(--sidebar-bg)',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)',
                  margin: '1rem 0 1.25rem',
                  border: '1px solid var(--border)'
                }}>
                  <button
                    type="button"
                    onClick={() => { setLoginRole('student'); setLoginError(''); }}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: loginRole === 'student' ? 'var(--brand-blue)' : 'transparent',
                      color: loginRole === 'student' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: loginRole === 'student' ? '0 1px 3px rgba(38, 118, 166, 0.25)' : 'none'
                    }}
                  >
                    <span>🎓</span> Student Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginRole('counselor'); setLoginError(''); }}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: loginRole === 'counselor' ? 'var(--brand-blue)' : 'transparent',
                      color: loginRole === 'counselor' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: loginRole === 'counselor' ? '0 1px 3px rgba(38, 118, 166, 0.25)' : 'none'
                    }}
                  >
                    <span>👩‍🏫</span> Counselor Login
                  </button>
                </div>

                {loginError && (
                  <div style={{ padding: '0.6rem 0.8rem', background: 'var(--coral-pale)', border: '1px solid #f2c2bc', borderRadius: 'var(--radius-sm)', color: 'var(--coral-hover)', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 500 }}>
                    ⚠️ {loginError}
                  </div>
                )}

                {loginRole === 'counselor' ? (
                  /* Counselor Login Form: ONLY Username and Password to enter */
                  <div>
                    <label className="modal-label">Counselor Username</label>
                    <input
                      className="modal-input"
                      type="text"
                      placeholder="e.g. shahista kazi"
                      value={counselorLoginUser}
                      onChange={(e) => setCounselorLoginUser(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCounselorLogin(); }}
                    />

                    <label className="modal-label">Counselor Password</label>
                    <div className="modal-input-wrap">
                      <input
                        className="modal-input no-mb"
                        type={showCounselorLoginPwd ? "text" : "password"}
                        placeholder="Enter your password"
                        value={counselorLoginPwd}
                        onChange={(e) => setCounselorLoginPwd(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCounselorLogin(); }}
                      />
                      <button type="button" className="modal-eye" onClick={() => setShowCounselorLoginPwd(!showCounselorLoginPwd)}>
                        {showCounselorLoginPwd ? '🙈' : '👁'}
                      </button>
                    </div>

                    <button
                      className="btn-modal-submit full-btn"
                      style={{
                        marginTop: '1.25rem',
                        background: 'var(--brand-blue)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-subtle)'
                      }}
                      onClick={handleCounselorLogin}
                      disabled={counselorLoginLoading}
                    >
                      {counselorLoginLoading ? 'Verifying...' : 'Login as Counselor →'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                      Need to register as counselor?{' '}
                      <span
                        style={{ color: 'var(--brand-blue)', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => { setSignupRole('counselor'); openModal('signup'); }}
                      >
                        Join as Counselor
                      </span>
                    </p>
                  </div>
                ) : (
                  /* Student Login Form */
                  <div>
                    {/* Official Google Identity Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', width: '100%' }}>
                      {activeModal === 'login' && (
                        <GoogleLogin
                          onSuccess={onGoogleLoginSuccess}
                          onError={onGoogleLoginError}
                          theme="outline"
                          size="large"
                          text="signin_with"
                          shape="rectangular"
                          width="320"
                        />
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '0.8rem 0 1rem', gap: '0.75rem' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>or with credentials</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>

                    <label className="modal-label">Anonymous ID or Gmail</label>
                    <input
                      className="modal-input"
                      type="text"
                      placeholder="e.g. anon_demo123456789 or student@gmail.com"
                      value={loginAnonId}
                      onChange={(e) => setLoginAnonId(e.target.value)}
                    />

                    <label className="modal-label">Password</label>
                    <div className="modal-input-wrap">
                      <input
                        className="modal-input no-mb"
                        type={showPwd ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                      />
                      <button type="button" className="modal-eye" onClick={() => setShowPwd(!showPwd)}>
                        {showPwd ? '🙈' : '👁'}
                      </button>
                    </div>

                    <button className="btn-modal-submit full-btn" style={{ marginTop: '1.25rem' }} onClick={handleLogin}>
                      Login to CampusCare &rarr;
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                      Don't have an account?{' '}
                      <span style={{ color: 'var(--brand-blue)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setSignupRole('student'); openModal('signup'); }}>Register here</span>
                    </p>

                    <div className="modal-demo-box" style={{ cursor: 'pointer' }} onClick={fillDemoLogin} title="Click to auto-fill demo account">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Demo Student Account:</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--brand-blue)', background: 'var(--brand-blue-pale)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>Click to auto-fill</span>
                      </div>
                      Anonymous ID: <span style={{ color: 'var(--brand-blue)', fontSize: '.8rem', fontFamily: 'monospace' }}>anon_demo123456789</span><br />
                      Password: <span style={{ color: 'var(--brand-blue)', fontSize: '.8rem', fontFamily: 'monospace' }}>password123</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-info-side">
                {loginRole === 'counselor' ? (
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--brand-blue-pale)', color: 'var(--brand-blue)', padding: '0.25rem 0.65rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', border: '1px solid var(--border)' }}>
                      <span>✦</span> Counselor Desk
                    </div>
                    <h4>Counselor Consultation Desk</h4>
                    <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Lokmanya Tilak College of Engineering
                    </p>
                    <div className="inst-list" style={{ marginBottom: '1rem' }}>
                      <div className="inst-item" style={{ fontSize: '0.82rem' }}>
                        <span className="inst-bar" style={{ background: 'var(--brand-blue)' }}></span>
                        Official Campus Mental Health &amp; Guidance Desk
                      </div>
                      <div className="inst-item" style={{ fontSize: '0.82rem' }}>
                        <span className="inst-bar" style={{ background: 'var(--brand-blue)' }}></span>
                        Review &amp; Manage Student Appointments
                      </div>
                    </div>
                    <div className="modal-privacy-box" style={{ borderColor: 'var(--border)' }}>
                      <p><strong style={{ color: 'var(--brand-blue)' }}>👩‍🏫 Counselor Verification</strong></p>
                      <p>• Access daily and monthly student counseling sessions</p>
                      <p>• Connect directly with students from your department</p>
                      <p>• Record clinical consultation notes securely</p>
                      <p>• Complete student confidentiality maintained</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4>Supported Institution</h4>
                    <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Mumbai Educational Institution</p>
                    <div className="inst-list">
                      <div className="inst-item">
                        <span className="inst-bar"></span>
                        ltce.in — Lokmanya Tilak College of Engineering
                      </div>
                    </div>
                    <div className="modal-privacy-box">
                      <p><strong>🔒 Privacy Protection</strong></p>
                      <p>• Your email &amp; password are never linked to therapy logs</p>
                      <p>• Only anonymous ID is used for platform access</p>
                      <p>• No personal information is stored permanently</p>
                      <p>• Complete privacy and confidentiality guaranteed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'signup' && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target.className.includes('modal-overlay')) closeModal(); }}>
          <div className="modal modal-wide">
            <button type="button" className="modal-close-btn" onClick={closeModal} title="Close modal" aria-label="Close">✕</button>
            <div className="modal-two-col">
              <div className="modal-form-side">
                <div className="modal-logo-icon">🌿</div>
                <h3>{signupRole === 'counselor' ? 'Join as Counselor' : 'Join CampusCare'}</h3>
                <p>
                  {signupRole === 'counselor'
                    ? 'Register counselor credentials to manage student sessions & view appointments'
                    : 'Sign in with Google or register with your Gmail to generate your anonymous ID'}
                </p>

                {/* Role Switcher: Join as Student vs Join as Counselor */}
                <div style={{
                  display: 'flex',
                  background: 'var(--sidebar-bg)',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)',
                  margin: '1rem 0 1.25rem',
                  border: '1px solid var(--border)'
                }}>
                  <button
                    type="button"
                    onClick={() => { setSignupRole('student'); setSignupError(''); setCounselorSuccessMsg(''); }}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: signupRole === 'student' ? 'var(--brand-blue)' : 'transparent',
                      color: signupRole === 'student' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: signupRole === 'student' ? '0 1px 3px rgba(38, 118, 166, 0.25)' : 'none'
                    }}
                  >
                    <span>🎓</span> Join as Student
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSignupRole('counselor'); setSignupError(''); setCounselorSuccessMsg(''); }}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: signupRole === 'counselor' ? 'var(--brand-blue)' : 'transparent',
                      color: signupRole === 'counselor' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: signupRole === 'counselor' ? '0 1px 3px rgba(38, 118, 166, 0.25)' : 'none'
                    }}
                  >
                    <span>👩‍🏫</span> Join as Counselor
                  </button>
                </div>

                {signupError && (
                  <div style={{ padding: '0.6rem 0.8rem', background: 'var(--coral-pale)', border: '1px solid #f2c2bc', borderRadius: 'var(--radius-sm)', color: 'var(--coral-hover)', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 500 }}>
                    ⚠️ {signupError}
                  </div>
                )}

                {counselorSuccessMsg && (
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--green-pale)', border: '1px solid #c2e2b3', borderRadius: 'var(--radius-sm)', color: '#3d7827', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                    ✅ {counselorSuccessMsg}
                  </div>
                )}

                {signupRole === 'counselor' ? (
                  /* Counselor Registration Form */
                  <div>
                    <label className="modal-label">Counselor Username</label>
                    <input
                      className="modal-input"
                      type="text"
                      placeholder="e.g. shahista kazi"
                      value={counselorUsername}
                      onChange={(e) => setCounselorUsername(e.target.value)}
                    />

                    <label className="modal-label">Counselor Password</label>
                    <div className="modal-input-wrap" style={{ marginBottom: '1rem' }}>
                      <input
                        className="modal-input no-mb"
                        type={showCounselorPwd ? "text" : "password"}
                        placeholder="Enter Counselor Password"
                        value={counselorPassword}
                        onChange={(e) => setCounselorPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCounselorRegister(); }}
                      />
                      <button type="button" className="modal-eye" onClick={() => setShowCounselorPwd(!showCounselorPwd)}>
                        {showCounselorPwd ? '🙈' : '👁'}
                      </button>
                    </div>

                    <label className="modal-label">Counselor Full Name</label>
                    <input
                      className="modal-input"
                      type="text"
                      placeholder="Ms. Shahista Kazi"
                      value={counselorName}
                      onChange={(e) => setCounselorName(e.target.value)}
                    />

                    <label className="modal-label">Engineering Department (LTCE)</label>
                    <select
                      className="modal-input"
                      value={counselorDept}
                      onChange={(e) => setCounselorDept(e.target.value)}
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

                    <button
                      className="btn-modal-submit full-btn"
                      style={{
                        marginTop: '1.25rem',
                        background: 'var(--brand-blue)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onClick={handleCounselorRegister}
                      disabled={counselorLoading}
                    >
                      {counselorLoading ? 'Saving to Database...' : '💾 Register Counselor'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '.75rem', fontSize: '.82rem' }}>
                      <span style={{ color: 'var(--brand-blue)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setLoginRole('counselor'); openModal('login'); }}>
                        Already registered? Login as Counselor
                      </span>
                    </p>
                  </div>
                ) : (
                  /* Student Registration Form */
                  <div>
                    {/* Official Google Identity Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', width: '100%' }}>
                      {activeModal === 'signup' && (
                        <GoogleLogin
                          onSuccess={onGoogleLoginSuccess}
                          onError={onGoogleLoginError}
                          theme="outline"
                          size="large"
                          text="signup_with"
                          shape="rectangular"
                          width="320"
                        />
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '0.8rem 0 1rem', gap: '0.75rem' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>or create account</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>

                    <label className="modal-label">Gmail Address (@gmail.com)</label>
                    <input
                      className="modal-input"
                      type="email"
                      placeholder="student@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />

                    <label className="modal-label">Password</label>
                    <div className="modal-input-wrap">
                      <input
                        className="modal-input no-mb"
                        type={showPwd ? "text" : "password"}
                        placeholder="Enter your password (min 6 characters)"
                        value={registerPwd}
                        onChange={e => setRegisterPwd(e.target.value)}
                      />
                      <button type="button" className="modal-eye" onClick={() => setShowPwd(!showPwd)}>{showPwd ? '🙈' : '👁'}</button>
                    </div>

                    <label className="modal-label" style={{ marginTop: '0.8rem' }}>Full Name or Pseudonym (Optional)</label>
                    <input
                      className="modal-input"
                      type="text"
                      placeholder="e.g. Scholar"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                    />

                    <div className="modal-split-fields">
                      <div style={{ flex: 1.5 }}>
                        <label className="modal-label">Engineering Course (LTCE)</label>
                        <select
                          className="modal-input"
                          value={course}
                          onChange={e => setCourse(e.target.value)}
                          style={{ cursor: 'pointer' }}
                        >
                          <option value="Computer Engineering">Computer Engineering</option>
                          <option value="Computer Science & Engineering (AIML)">CSE (AI &amp; ML)</option>
                          <option value="Computer Science & Engineering (Data Science)">CSE (Data Science)</option>
                          <option value="Computer Science & Engineering (IoT and Cyber Security)">CSE (IoT &amp; Cyber Security)</option>
                          <option value="Electronics & Telecommunication Engineering">Electronics &amp; Telecom Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="modal-label">Year (1 to 4)</label>
                        <select
                          className="modal-input"
                          value={year}
                          onChange={e => setYear(e.target.value)}
                          style={{ cursor: 'pointer' }}
                        >
                          <option value="1st Year">1st Year (FE)</option>
                          <option value="2nd Year">2nd Year (SE)</option>
                          <option value="3rd Year">3rd Year (TE)</option>
                          <option value="4th Year">4th Year (BE)</option>
                        </select>
                      </div>
                    </div>

                    <button className="btn-modal-submit full-btn" style={{ marginTop: '1rem', background: 'var(--brand-blue)' }} onClick={handleRegister}>
                      👤 Create Account &amp; Get Anonymous ID
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '.75rem', fontSize: '.82rem' }}>
                      <span style={{ color: 'var(--brand-blue)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setLoginRole('student'); openModal('login'); }}>
                        Already have an Anonymous ID? Login here
                      </span>
                    </p>

                    <div className="modal-identity-note">
                      <span style={{ color: 'var(--brand-blue)', fontSize: '.85rem' }}>◉</span>
                      Your identity is protected. Your Gmail is verified to prevent duplicate registrations and unlinked from therapy logs.
                    </div>
                  </div>
                )}
              </div>

              {/* Info Side Panel */}
              <div className="modal-info-side">
                {signupRole === 'counselor' ? (
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--brand-blue-pale)', color: 'var(--brand-blue)', padding: '0.25rem 0.65rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', border: '1px solid var(--border)' }}>
                      <span>✦</span> Counselor Desk
                    </div>
                    <h4>Institutional Counselor Portal</h4>
                    <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Lokmanya Tilak College of Engineering
                    </p>

                    <div className="inst-list" style={{ marginBottom: '1rem' }}>
                      <div className="inst-item" style={{ fontSize: '0.82rem' }}>
                        <span className="inst-bar" style={{ background: 'var(--brand-blue)' }}></span>
                        <strong>Designated Counselor:</strong> Ms. Shahista Kazi
                      </div>
                      <div className="inst-item" style={{ fontSize: '0.82rem' }}>
                        <span className="inst-bar" style={{ background: 'var(--brand-blue)' }}></span>
                        <strong>Department:</strong> {counselorDept}
                      </div>
                    </div>

                    <div className="modal-privacy-box" style={{ borderColor: 'var(--border)' }}>
                      <p><strong style={{ color: 'var(--brand-blue)' }}>📋 Counselor Features:</strong></p>
                      <p>• View full student names, emails &amp; departments</p>
                      <p>• Live count of today's booked sessions</p>
                      <p>• Monthly session completion tracker</p>
                      <p>• Private intake &amp; session notes system</p>
                      <p>• Secure direct contact with students</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4>LTCE Engineering Programs</h4>
                    <p style={{ fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>4-Year B.Tech Departments (ltce.in)</p>
                    <div className="inst-list" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                      <div className="inst-item"><span className="inst-bar"></span>Computer Engineering</div>
                      <div className="inst-item"><span className="inst-bar"></span>CSE (AI &amp; ML)</div>
                      <div className="inst-item"><span className="inst-bar"></span>CSE (Data Science)</div>
                      <div className="inst-item"><span className="inst-bar"></span>CSE (IoT &amp; Cyber Security)</div>
                      <div className="inst-item"><span className="inst-bar"></span>Electronics &amp; Telecom. Engg.</div>
                      <div className="inst-item"><span className="inst-bar"></span>Mechanical Engineering</div>
                      <div className="inst-item"><span className="inst-bar"></span>Electrical Engineering</div>
                    </div>
                    <div className="modal-privacy-box" style={{ marginTop: '0.8rem' }}>
                      <p><strong>🔒 Privacy Protection</strong></p>
                      <p>• Only your Anonymous ID is used across CampusCare</p>
                      <p>• Department &amp; Year help match relevant campus counselors</p>
                      <p>• Complete confidentiality guaranteed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'success' && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target.className.includes('modal-overlay')) closeModal(); }}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <button type="button" className="modal-close-btn" onClick={closeModal} title="Close modal" aria-label="Close">✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.6rem' }}>
              <span style={{ fontSize: '1.4rem' }}>✅</span>
              <h3 style={{ margin: 0 }}>Registration Successful!</h3>
            </div>
            <p>Your anonymous ID has been generated and activated. Please copy and save this ID for future logins.</p>
            <div style={{ background: 'var(--sidebar-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem', margin: '1rem 0' }}>
              <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '.5rem' }}>Your Anonymous ID:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <code style={{ flex: 1, fontSize: '.85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '.5rem .75rem', color: 'var(--brand-blue)', fontFamily: 'monospace', wordBreak: 'break-all', fontWeight: 600 }}>
                  {anonId}
                </code>
                <button
                  type="button"
                  onClick={copyAnonId}
                  style={{ minWidth: '40px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-blue-pale)', border: '1px solid var(--border)', color: 'var(--brand-blue)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: '0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Copy ID"
                >
                  {copied ? 'Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
            <div style={{ background: 'var(--sidebar-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '.9rem 1rem', display: 'flex', gap: '.6rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>🛡</span>
              <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Zero-Knowledge Privacy:</strong> Your account is active now. You have full access to CampusCare mental wellness features, AI assistance, and counselor booking.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-submit full-btn" onClick={handleContinueAfterRegister}>
                Enter CampusCare Student Dashboard &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
