import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import { hasPermission as hasPermissionUtil, isSuperAdmin as isSuperAdminUtil } from '../utils/rbac';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aas_admin_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const persistAdmin = useCallback((user) => {
    localStorage.setItem('aas_admin_user', JSON.stringify(user));
    setAdmin(user);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', { email, password });
      localStorage.setItem('aas_admin_token', data.data.token);
      persistAdmin(data.data.user);
      return { success: true, mustChangePassword: Boolean(data.data.user?.mustChangePassword) };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed.' };
    } finally {
      setLoading(false);
    }
  }, [persistAdmin]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/change-password', { currentPassword, newPassword });
      persistAdmin(data.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Password change failed.' };
    } finally {
      setLoading(false);
    }
  }, [persistAdmin]);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('aas_admin_token');
    localStorage.removeItem('aas_admin_user');
    setAdmin(null);
  }, []);

  const hasPermission = useCallback((permission) => hasPermissionUtil(admin, permission), [admin]);
  const isSuperAdmin = useCallback(() => isSuperAdminUtil(admin), [admin]);

  return (
    <AdminAuthContext.Provider value={{
      admin,
      loading,
      login,
      logout,
      changePassword,
      isLoggedIn: !!admin,
      mustChangePassword: Boolean(admin?.mustChangePassword),
      hasPermission,
      isSuperAdmin,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
