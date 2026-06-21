import api from '../config/api';
import { storage } from '../utils/storage';

const authService = {

  signup: async (email, username, password) => {
    try {
      const response = await api.post('/auth/signup', { email, username, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Signup failed' };
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;

      storage.setToken(access_token);

      // ✅ جيب بيانات الـ user من /auth/me بدل decode
      const userResponse = await api.get('/auth/me');
      const user = userResponse.data;
      storage.setUser(user);

      authService.startExpiryWatcher();

      return { success: true, data: { token: access_token, user } };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email }, { _skipToast: true });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to request password reset' };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      }, { _skipToast: true });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to reset password' };
    }
  },

  logout: () => {
    authService.stopExpiryWatcher();
    storage.clearAll();
  },

  getCurrentUser: () => storage.getUser(),

  isAuthenticated: () => storage.isAuthenticated(),

  // ✅ جيب أحدث بيانات الـ user من الـ backend
  fetchCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      storage.setUser(response.data);
      return response.data;
    } catch {
      return null;
    }
  },

  decodeToken: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return {
        id: decoded.sub,
        email: decoded.email,
        exp: decoded.exp,
      };
    } catch {
      return null;
    }
  },

  isTokenExpired: () => {
    const token = storage.getToken();
    if (!token) return true;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  getTokenExpiryMs: () => {
    const token = storage.getToken();
    if (!token) return 0;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      return decoded.exp * 1000 - Date.now();
    } catch {
      return 0;
    }
  },

  _expiryTimer: null,
  _warningTimer: null,

  startExpiryWatcher: () => {
    authService.stopExpiryWatcher();
    const expiryMs = authService.getTokenExpiryMs();
    if (expiryMs <= 0) {
      authService.logout();
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return;
    }
    const warningMs = expiryMs - 5 * 60 * 1000;
    if (warningMs > 0) {
      authService._warningTimer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth:expiring-soon'));
      }, warningMs);
    }
    authService._expiryTimer = setTimeout(() => {
      authService.logout();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }, expiryMs);
  },

  stopExpiryWatcher: () => {
    if (authService._expiryTimer) { clearTimeout(authService._expiryTimer); authService._expiryTimer = null; }
    if (authService._warningTimer) { clearTimeout(authService._warningTimer); authService._warningTimer = null; }
  },
};

export default authService;
