import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.api';
import { getToken, removeToken, setToken } from '../services/tokenStorage';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const data = await authApi.getMe();
      setUser(data.data?.user ?? null);
    } catch {
      await removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    const { user: u, token } = data?.data ?? {};
    if (token) {
      await setToken(token);
    }
    setUser(u ?? null);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    console.log('[AuthContext] Register response data:', JSON.stringify(data, null, 2));
    const { user: u, token } = data?.data ?? {};
    if (token) {
      await setToken(token);
    }
    setUser(u ?? null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await authApi.updateProfile(payload);
    setUser(data.data?.user ?? null);
    return data;
  }, []);

  const changePassword = useCallback(async (payload) => {
    return authApi.changePassword(payload);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      refreshUser: bootstrap,
    }),
    [user, loading, login, register, logout, updateProfile, changePassword, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
