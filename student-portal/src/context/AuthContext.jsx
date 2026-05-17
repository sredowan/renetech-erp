import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const parseSavedUser = (savedUser) => {
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.warn('Invalid saved user payload. Clearing session cache.', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  };

  useEffect(() => {
    try {
      // Generate or retrieve device ID
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('deviceId', deviceId);
      }

      const token = localStorage.getItem('token');
      const savedUser = parseSavedUser(localStorage.getItem('user'));

      if (token && savedUser) {
        setUser(savedUser);
        // Refresh user details to get latest premium status
        refreshUser();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me'); // Assuming there is an /auth/me or similar
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user details:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    if (user.role !== 'student') {
      throw new Error('Access denied. This portal is for students only.');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
