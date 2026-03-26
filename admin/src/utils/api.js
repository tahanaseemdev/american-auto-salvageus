import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5010/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aas_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    const message = res?.data?.message;
    const method = String(res?.config?.method || '').toLowerCase();
    const isFetchMessage = /fetched/i.test(message || '');

    // Do not toast fetch/read responses. Only mutation actions should notify success.
    if (message && method !== 'get' && !isFetchMessage) {
      toast.success(message, {
        toastId: `success-${res.config?.method}-${res.config?.url}-${message}`,
      });
    }
    return res;
  },
  (err) => {
    const errorMessage = err.response?.data?.message || 'Request failed. Please try again.';
    toast.error(errorMessage, {
      toastId: `error-${err.config?.method}-${err.config?.url}-${errorMessage}`,
    });

    if (err.response?.status === 401 || (err.response?.status === 403 && err.response?.data?.message?.includes('revoked'))) {
      localStorage.removeItem('aas_admin_token');
      localStorage.removeItem('aas_admin_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
