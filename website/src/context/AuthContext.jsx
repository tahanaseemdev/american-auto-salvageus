import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aas_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const clearUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem('aas_token');
    localStorage.removeItem('aas_user');
  }, []);

  const persistUser = (userData, token) => {
    setUser(userData);
    if (token) localStorage.setItem('aas_token', token);
    localStorage.setItem('aas_user', JSON.stringify(userData));
  };

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/user/profile');
      const profile = data.data;
      persistUser({
        _id: profile._id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        role: profile.role || null,
      });
      return { success: true, user: profile };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to load profile.' };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persistUser(data.data.user, data.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (form) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      persistUser(data.data.user, data.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clearUser();
  }, []);

  const updateProfile = useCallback(async (payload) => {
    try {
      const { data } = await api.put('/user/profile', payload);
      const updated = data.data;
      persistUser({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        role: updated.role || null,
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update profile.' };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await api.put('/user/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update password.' };
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('aas_token');
    if (!token) return;

    refreshProfile().then((result) => {
      if (!result.success) clearUser();
    });
  }, [refreshProfile, clearUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
        changePassword,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
