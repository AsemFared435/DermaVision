import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Upload from './pages/Upload';
import Result from './pages/Result';
import FollowUp from './pages/FollowUp';
import NotFound from './pages/NotFound';

// ===================== Token Expiry Handler =====================
const TokenExpiryHandler = () => {
  useEffect(() => {
    const handleExpired = () => {
      toast.error('Your session has expired. Please login again.', { duration: 5000, id: 'session-expired' });
      setTimeout(() => { window.location.href = '/signin'; }, 2000);
    };
    const handleExpiringSoon = () => {
      toast('⏰ Your session will expire in 5 minutes.', {
        duration: 8000, id: 'session-expiring', icon: '⚠️',
        style: { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
      });
    };
    window.addEventListener('auth:expired', handleExpired);
    window.addEventListener('auth:expiring-soon', handleExpiringSoon);
    return () => {
      window.removeEventListener('auth:expired', handleExpired);
      window.removeEventListener('auth:expiring-soon', handleExpiringSoon);
    };
  }, []);
  return null;
};

// ===================== Top Progress Bar - Fixed CSS Warning =====================
const TopProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(0);
    const t1 = setTimeout(() => setProgress(30), 50);
    const t2 = setTimeout(() => setProgress(65), 150);
    const t3 = setTimeout(() => setProgress(85), 280);
    const t4 = setTimeout(() => setProgress(100), 420);
    const t5 = setTimeout(() => setVisible(false), 650);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [location.pathname]);

  if (!visible) return null;

  // ✅ Fix: استخدام transition واحدة بدل shorthand + longhand مع بعض
  const getTransition = () => {
    if (progress === 0) return 'none';
    if (progress === 100) return 'width 0.15s ease 0s, opacity 0.3s ease 0.3s';
    return 'width 0.25s ease 0s, opacity 0s ease 0s';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          boxShadow: '0 0 10px rgba(139,92,246,0.7), 0 0 4px rgba(59,130,246,0.5)',
          transition: getTransition(),
        }}
      />
    </div>
  );
};

// ===================== Page Transition =====================
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionState, setTransitionState] = useState('visible');

  useEffect(() => {
    if (location.key === displayLocation.key) return;
    setTransitionState('hiding');
    const hideTimer = setTimeout(() => {
      setDisplayLocation(location);
      if (location.pathname !== '/chat') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionState('showing');
          setTimeout(() => setTransitionState('visible'), 350);
        });
      });
    }, 180);
    return () => clearTimeout(hideTimer);
  }, [location]);

  const styles = {
    hiding:  { opacity: 0, transform: 'translateY(6px)',  transition: 'opacity 0.18s ease, transform 0.18s ease' },
    showing: { opacity: 1, transform: 'translateY(0)',    transition: 'opacity 0.35s ease, transform 0.35s ease' },
    visible: { opacity: 1, transform: 'translateY(0)' },
  };

  return (
    <div style={styles[transitionState]}>
      <Routes location={displayLocation}>{children}</Routes>
    </div>
  );
};

// ===================== Layout =====================
const Layout = ({ children }) => {
  const location = useLocation();
  const isChatRoute = location.pathname === '/chat';

  return (
    <>
      <Navbar />
      <main className={isChatRoute ? 'overflow-hidden' : undefined}>{children}</main>
      {!isChatRoute && <Footer />}
      {!isChatRoute && <ScrollToTop />}
    </>
  );
};

// ===================== App =====================
function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <TokenExpiryHandler />
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#fff', color: '#363636',
                      padding: '14px 16px', borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      fontSize: '14px', fontWeight: '500',
                    },
                    success: {
                      iconTheme: { primary: '#10b981', secondary: '#fff' },
                      style: { borderLeft: '4px solid #10b981' },
                    },
                    error: {
                      iconTheme: { primary: '#ef4444', secondary: '#fff' },
                      style: { borderLeft: '4px solid #ef4444' },
                    },
                  }}
                />
                <TopProgressBar />
                <PageTransition>
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/" element={<Layout><Home /></Layout>} />
                  <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
                  <Route path="/upload" element={<ProtectedRoute><Layout><Upload /></Layout></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
                  <Route path="/result" element={<ProtectedRoute><Layout><Result /></Layout></ProtectedRoute>} />
                  <Route path="/followup" element={<ProtectedRoute><Layout><FollowUp /></Layout></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </PageTransition>
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
