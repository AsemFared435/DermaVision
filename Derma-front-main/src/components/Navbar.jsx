import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBrain, FaBars, FaTimes, FaUser, FaSignOutAlt, FaHistory, FaCog, FaWifi } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const { currentUser, userData, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const dropdownRef = useRef(null);

  // ✅ Scroll effect - navbar gets shadow when scrolled
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Close mobile menu on route change
  useEffect(() => { setIsOpen(false); setShowUserMenu(false); }, [location.pathname]);

  const handleLogout = async () => {
    try {
      setShowUserMenu(false);
      await logout();
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  // ✅ Active link helper
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path) =>
    `font-medium transition-all duration-200 relative pb-1 ${
      isActive(path)
        ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600 after:rounded-full'
        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
    }`;

  const mobileLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 transition-all ${
      isActive(path)
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-r-4 rtl:border-r-0 rtl:border-l-4 border-blue-600'
        : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800'
    }`;

  return (
    <>
      {/* ✅ Offline Banner */}
      {showOfflineBanner && (
        <div className="bg-red-500 text-white text-center py-2 px-4 text-sm font-semibold flex items-center justify-center gap-2 z-[60] relative">
          <FaWifi className="text-base" />
          <span>{t.navbar?.offline || 'No internet connection. Some features may not work.'}</span>
          <button onClick={() => setShowOfflineBanner(false)} className="ml-4 rtl:ml-0 rtl:mr-4 text-white/80 hover:text-white">✕</button>
        </div>
      )}

      <nav className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg border-b border-gray-200/50 dark:border-gray-700/50' : 'shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 gap-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0 justify-self-start">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                <FaBrain className="text-white text-lg" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
                DERMAVISION
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center justify-center gap-4 lg:gap-7 justify-self-center">
              <Link to="/" className={navLinkClass('/')}>
                {t.navbar?.home || 'Home'}
              </Link>
              <a href="/#pricing" className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                {t.navbar?.pricing || 'Pricing'}
              </a>
              {currentUser && (
                <>
                  <Link to="/upload" className={navLinkClass('/upload')}>
                    {t.navbar?.diagnose || 'Diagnose'}
                  </Link>
                  <Link to="/chat" className={navLinkClass('/chat')}>
                    {t.navbar?.aiChat || 'AI Chat'}
                  </Link>
                </>
              )}
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3 justify-self-end">
              <LanguageSwitcher />
              <ThemeToggle />

              {/* ✅ Loading skeleton */}
              {loading ? (
                <div className="flex items-center gap-2 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border-2 ${
                      showUserMenu ? 'border-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent'
                    }`}
                  >
                    {/* ✅ Avatar with Fallback */}
                    <div className="relative">
                      {userData?.photoURL ? (
                        <img
                          src={userData.photoURL}
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover border-2 border-blue-400"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full items-center justify-center shadow-sm"
                        style={{ display: userData?.photoURL ? 'none' : 'flex' }}
                      >
                        <span className="text-white font-bold text-sm">
                          {(userData?.username || userData?.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Online dot */}
                      <div className="absolute -bottom-0.5 -right-0.5 rtl:right-auto rtl:left-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm max-w-[80px] truncate">
                      {userData?.username || userData?.name || t.navbar?.user || 'User'}
                    </span>
                    <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl py-2 border border-gray-100 dark:border-gray-700 z-50"
                      style={{ animation: 'slideDown 0.2s ease forwards' }}>
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 text-start">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t.navbar?.signedInAs || 'Signed in as'}</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {userData?.email || userData?.username || t.navbar?.user || 'User'}
                        </p>
                      </div>

                      {[
                        { to: '/dashboard', icon: <FaUser className="text-blue-500" />, label: t.navbar?.dashboard || 'Dashboard' },
                        { to: '/history', icon: <FaHistory className="text-purple-500" />, label: t.navbar?.history || 'History' },
                        { to: '/profile', icon: <FaCog className="text-gray-500" />, label: t.navbar?.settings || 'Settings' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors text-sm ${
                            isActive(item.to)
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                          {item.icon}
                          <span>{item.label}</span>
                          {isActive(item.to) && <div className="ml-auto rtl:ml-0 rtl:mr-auto w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                        </Link>
                      ))}

                      <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-red-600 text-sm font-medium rounded-xl mx-1" style={{ width: 'calc(100% - 8px)' }}>
                          <FaSignOutAlt />
                          <span>{t.navbar?.logout || 'Logout'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/signin" className="px-4 py-2 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all text-sm">
                    {t.navbar?.signIn || 'Sign In'}
                  </Link>
                  <Link to="/signup" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all text-sm">
                    {t.navbar?.getStarted || 'Get Started'}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile button */}
            <div className="md:hidden flex items-center gap-2 justify-self-end">
              <LanguageSwitcher />
              <ThemeToggle />
              <button onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-2">
            <Link to="/" className={mobileLinkClass('/')}><span>{t.navbar?.home || 'Home'}</span></Link>
            <a href="/#pricing" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800">
              {t.navbar?.pricing || 'Pricing'}
            </a>
            {currentUser ? (
              <>
                <Link to="/upload" className={mobileLinkClass('/upload')}><span>{t.navbar?.diagnose || 'Diagnose'}</span></Link>
                <Link to="/chat" className={mobileLinkClass('/chat')}><span>{t.navbar?.aiChat || 'AI Chat'}</span></Link>
                <Link to="/dashboard" className={mobileLinkClass('/dashboard')}><span>{t.navbar?.dashboard || 'Dashboard'}</span></Link>
                <Link to="/history" className={mobileLinkClass('/history')}><span>{t.navbar?.history || 'History'}</span></Link>
                <Link to="/profile" className={mobileLinkClass('/profile')}><span>{t.navbar?.settings || 'Settings'}</span></Link>
                <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all">
                    <FaSignOutAlt /><span>{t.navbar?.logout || 'Logout'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-3 space-y-2">
                <Link to="/signin" className="block text-center py-2.5 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all">
                  {t.navbar?.signIn || 'Sign In'}
                </Link>
                <Link to="/signup" className="block text-center py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                  {t.navbar?.getStarted || 'Get Started'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
