import axios from 'axios';
import toast from 'react-hot-toast';
import { storage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

if (import.meta.env.DEV) {
  console.info('API Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ==================== Request Interceptor ====================
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== Response Interceptor ====================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ لو الـ caller عايز يتعامل مع الـ error بنفسه، مش بنعمل toast
    const skipToast = error.config?._skipToast;

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          storage.clearAll();
          if (!window.location.pathname.includes('/signin') &&
              !window.location.pathname.includes('/signup')) {
            toast.error('Session expired. Please login again.');
            window.location.href = '/signin';
          }
          break;

        case 403:
          if (!skipToast) toast.error('Access forbidden');
          break;

        case 404:
          // ✅ مش بنعمل toast تلقائي لـ 404 - الـ service بتتعامل معاه
          break;

        case 422:
          if (!skipToast) {
            const validationMsg = Array.isArray(data?.detail)
              ? data.detail.map(e => e.msg).join(', ')
              : data?.detail || 'Validation error';
            toast.error(validationMsg);
          }
          break;

        case 429:
          toast.error('Too many requests. Please wait a moment.');
          break;

        case 500:
          toast.error('Server error. Please try again later.');
          break;

        default:
          if (!skipToast) toast.error(data?.detail || data?.error || 'An error occurred');
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. The analysis is taking too long.');
    } else if (error.request) {
      toast.error('Cannot connect to server. Please check if backend is running.');
    } else {
      toast.error('Network error');
    }

    return Promise.reject(error);
  }
);

export default api;
