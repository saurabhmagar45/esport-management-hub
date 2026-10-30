import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('esport_hub_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Sync session with backend on initial load
  useEffect(() => {
    async function verifySession() {
      const token = localStorage.getItem('esport_hub_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('esport_hub_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification expired or unreachable:', err.message);
          localStorage.removeItem('esport_hub_token');
          localStorage.removeItem('esport_hub_user');
          setUser(null);
        }
      }
      setLoading(false);
    }
    verifySession();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('esport_hub_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('esport_hub_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      if (res.data && res.data.success) {
        if (res.data.token) {
          localStorage.setItem('esport_hub_token', res.data.token);
        }
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(registerData);
      if (res.data && res.data.success) {
        if (res.data.token) {
          localStorage.setItem('esport_hub_token', res.data.token);
        }
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      authAPI.logout().catch(() => {});
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('esport_hub_user');
    localStorage.removeItem('esport_hub_token');
  };

  const updateProfile = (data) => {
    setUser(prev => ({
      ...prev,
      ...data,
      gameProfiles: {
        ...prev?.gameProfiles,
        ...data.gameProfiles
      }
    }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
