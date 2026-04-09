import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password, confirmPassword, role = 'patient') => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        fullName,
        email,
        password,
        confirmPassword,
        role,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, message: 'Registration successful', user: userData };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, message: 'Login successful', user: userData };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
