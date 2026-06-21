/**
 * LocalStorage Helpers for Token & User Management
 */

const TOKEN_KEY = 'dermavision_token';
const USER_KEY = 'dermavision_user';

export const storage = {
  // Token Management
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // User Data Management
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  // Clear All
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if logged in
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

