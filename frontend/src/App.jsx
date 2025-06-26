import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Admin from './components/Admin/Admin';
import ThemeToggle from './components/ThemeToggle';

function Landing({ onLogin }) {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3B82F6 0%, #9333EA 100%)' }}>
      <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 24, padding: '2.5rem 2.5rem 2rem 2.5rem', boxShadow: '0 8px 32px 0 rgba(31,41,55,0.15)', maxWidth: 480, textAlign: 'center' }}>
        <h1 style={{ color: '#3B82F6', fontWeight: 700, marginBottom: 16 }}>AI-Powered Document Classification</h1>
        <p style={{ color: '#1F2937', fontSize: 18, marginBottom: 24 }}>
          Instantly ingest, extract, classify, and route your enterprise documents with a futuristic, automated workflow.<br /><br />
          Experience glassmorphism, smooth animations, and a modern dashboard for all your document needs.
        </p>
        <button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(90deg, #3B82F6 0%, #9333EA 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.9rem 2.5rem', fontSize: 18, fontWeight: 600, cursor: 'pointer', marginRight: 12 }}>Login</button>
        <button onClick={() => alert('Registration coming soon!')} style={{ background: '#fff', color: '#3B82F6', border: '1.5px solid #3B82F6', borderRadius: 12, padding: '0.9rem 2.5rem', fontSize: 18, fontWeight: 600, cursor: 'pointer' }}>Register</button>
      </div>
    </motion.div>
  );
}

export default function App({ theme, setTheme }) {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem('isAuth') === 'true');
  const location = useLocation();

  function handleLogin({ username, password }) {
    if (username === 'Admin' && password === 'b') {
      setIsAuth(true);
      localStorage.setItem('isAuth', 'true');
      return true;
    }
    return false;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'none', position: 'relative' }}>
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PageFade><Login onLogin={handleLogin} /></PageFade>} />
          <Route path="/dashboard" element={isAuth ? <PageFade><Dashboard /></PageFade> : <Navigate to="/login" />} />
          <Route path="/admin" element={isAuth ? <PageFade><Admin /></PageFade> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function PageFade({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}
