import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5010/v1',
  withCredentials: true, // send httpOnly cookies automatically
  headers: { 'Content-Type': 'application/json' },
});

// Attach the Bearer token from localStorage on every request (fallback for
// environments where cookies cannot be used across ports in dev).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401/403 clear local auth state so the user is kicked to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || (err.response?.status === 403 && err.response?.data?.message?.includes('revoked'))) {
      localStorage.removeItem('aas_token');
      localStorage.removeItem('aas_user');
      // Only redirect if not already on the login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
