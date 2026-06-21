import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import authService from '../services/authService';
import { storage } from '../utils/storage';
import toast from 'react-hot-toast';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [authType, setAuthType]       = useState(null);

  // ==================== Backend Auth ====================

  const signup = async (email, password, username) => {
    const result = await authService.signup(email, username, password);
    if (result.success) {
      toast.success('Account created! Please login.');
      return result.data;
    }
    toast.error(result.error);
    throw new Error(result.error);
  };

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setCurrentUser(result.data.user);
      setUserData(result.data.user);
      setAuthType('backend');
      toast.success('Welcome back! 👋');
      return result.data.user;
    }
    toast.error(result.error);
    throw new Error(result.error);
  };

  const refreshUser = async () => {
    try {
      const user = await authService.fetchCurrentUser();
      if (user) { setCurrentUser(user); setUserData(user); }
      return user;
    } catch { return null; }
  };

  // ==================== Google Auth ====================

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // ✅ سجل الـ Google user في الـ FastAPI backend واجيب JWT token حقيقي
      const response = await api.post('/auth/google', {
        email: firebaseUser.email,
        google_uid: firebaseUser.uid,
        display_name: firebaseUser.displayName,
        photo_url: firebaseUser.photoURL,
      });

      const { access_token } = response.data;

      // ✅ احفظ الـ token زي ما بيحصل مع الـ normal login
      storage.setToken(access_token);

      // ✅ جيب بيانات الـ user من الـ backend
      const userResponse = await api.get('/auth/me');
      const user = {
        ...userResponse.data,
        photoURL: firebaseUser.photoURL,
        authProvider: 'google',
      };
      storage.setUser(user);

      setCurrentUser(user);
      setUserData(user);
      setAuthType('google');

      authService.startExpiryWatcher();

      toast.success('Signed in with Google! 🎉');
      return user;

    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Google sign-in');
      } else {
        toast.error('Failed to sign in with Google');
      }
      throw error;
    }
  };

  // ==================== Logout ====================

  const logout = async () => {
    try {
      authService.logout();
      if (authType === 'google') await firebaseSignOut(auth);
    } catch {
      toast.error('Could not fully sign out from Google. Local session was cleared.');
    } finally {
      setCurrentUser(null);
      setUserData(null);
      setAuthType(null);
      toast.success('Logged out successfully');
    }
  };

  // ==================== Password Reset ====================

  const resetPassword = async (email) => {
    const result = await authService.forgotPassword(email);
    if (result.success) {
      toast.success('If an account exists, password reset instructions have been sent.');
      return result.data;
    }
    toast.error(result.error);
    throw new Error(result.error);
  };

  // ==================== Init on Load ====================

  useEffect(() => {
    let backendResolved = false;

    const backendUser = authService.getCurrentUser();
    const tokenExpired = authService.isTokenExpired();

    if (backendUser && !tokenExpired) {
      setCurrentUser(backendUser);
      setUserData(backendUser);
      setAuthType(backendUser.authProvider === 'google' ? 'google' : 'backend');
      backendResolved = true;

      authService.fetchCurrentUser().then(freshUser => {
        if (freshUser) { setCurrentUser(freshUser); setUserData(freshUser); }
      });
      authService.startExpiryWatcher();
    } else if (tokenExpired && backendUser) {
      authService.logout();
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // لو مفيش backend token، مش بنعمل حاجة - الـ Google login هيتعمل manually
      if (!backendResolved) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ==================== Context Value ====================

  const value = {
    currentUser,
    userData,
    authType,
    isBackendUser: authType === 'backend',
    isGoogleUser: authType === 'google',
    isAuthenticated: !!currentUser,
    signup,
    login,
    logout,
    refreshUser,
    signInWithGoogle,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
