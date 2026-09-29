import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Modals from './components/Modals';
import Home from './pages/Home';
import About from './pages/About';
import Chatbot from './pages/Chatbot';
import Booking from './pages/Booking';
import Resources from './pages/Resources';
import Forum from './pages/Forum';
import Gamification from './pages/Gamification';
import CounselorProfile from './pages/CounselorProfile';
import EmergencyFooter from './components/EmergencyFooter';

function AppContent({ theme, toggleTheme, activeModal, openModal, closeModal }) {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} openModal={openModal} />

      <Routes>
        {/* Landing page for visitors; Home dashboard for logged-in students */}
        <Route
          path="/"
          element={isAuthenticated ? <Home openModal={openModal} /> : <About openModal={openModal} />}
        />

        {/* Protected Student Portal Dashboard */}
        <Route
          path="/home"
          element={
            <ProtectedRoute openModal={openModal}>
              <Home openModal={openModal} />
            </ProtectedRoute>
          }
        />

        {/* Protected Student Portal Routes */}
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute openModal={openModal}>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        {/* Counselor & Booking Routes */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute openModal={openModal}>
              <Booking openModal={openModal} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute openModal={openModal}>
              <Booking openModal={openModal} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor"
          element={
            <ProtectedRoute openModal={openModal}>
              <Booking openModal={openModal} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor-dashboard"
          element={
            <ProtectedRoute openModal={openModal}>
              <Booking openModal={openModal} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor/dashboard"
          element={
            <ProtectedRoute openModal={openModal}>
              <Booking openModal={openModal} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor/appointments"
          element={
            <ProtectedRoute openModal={openModal}>
              <Booking openModal={openModal} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor-notes"
          element={
            <ProtectedRoute openModal={openModal}>
              <Booking openModal={openModal} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor/notes"
          element={
            <ProtectedRoute openModal={openModal}>
              <Booking openModal={openModal} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute openModal={openModal}>
              <Booking openModal={openModal} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor-profile"
          element={
            <ProtectedRoute openModal={openModal}>
              <CounselorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor/profile"
          element={
            <ProtectedRoute openModal={openModal}>
              <CounselorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute openModal={openModal}>
              <CounselorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={<Resources />}
        />
        <Route
          path="/forum"
          element={
            <ProtectedRoute openModal={openModal}>
              <Forum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gamification"
          element={
            <ProtectedRoute openModal={openModal}>
              <Gamification />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Modals activeModal={activeModal} closeModal={closeModal} openModal={openModal} />
      <EmergencyFooter />
    </>
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscare-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      // fallback to light
    }
    return 'light';
  });

  const [activeModal, setActiveModal] = useState(null);

  // Apply theme to documentElement and body, and persist in localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('campuscare-theme', theme);
    } catch (e) {
      // ignore storage errors
    }
  }, [theme]);

  // Global keyboard shortcuts: Esc to close modal, Alt+T or Ctrl+Shift+L to toggle theme
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
      if (
        (e.altKey && (e.key === 't' || e.key === 'T')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l'))
      ) {
        e.preventDefault();
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  return (
    <AuthProvider>
      <AppContent
        theme={theme}
        toggleTheme={toggleTheme}
        activeModal={activeModal}
        openModal={openModal}
        closeModal={closeModal}
      />
    </AuthProvider>
  );
}

export default App;
