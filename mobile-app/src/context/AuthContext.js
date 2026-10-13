import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const DEMO_USERS = {
  customer: {
    email: 'customer@example.com',
    password: 'password123',
    name: 'Sarah Customer',
    role: 'CUSTOMER',
  },
  delivery: {
    email: 'delivery@example.com',
    password: 'password123',
    name: 'Ravi Delivery',
    role: 'DELIVERY_PARTNER',
  },
  admin: {
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin PantryPal',
    role: 'ADMIN',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify with profile endpoint in background
        try {
          const res = await authAPI.getProfile();
          if (res.data?.user) {
            setUser(res.data.user);
            await AsyncStorage.setItem('userData', JSON.stringify(res.data.user));
          }
        } catch (e) {
          console.log('Token check fallback to stored user profile');
        }
      }
    } catch (err) {
      console.warn('Failed to load stored auth credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      const responseData = res.data?.data || res.data;
      const receivedToken = responseData.token;
      const receivedUser = responseData.user;
      setToken(receivedToken);
      setUser(receivedUser);
      await AsyncStorage.setItem('userToken', receivedToken);
      await AsyncStorage.setItem('userData', JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    } catch (err) {
      console.log('Login falling back to local user store:', err.message);
      try {
        const { mockStorage } = require('../services/mockStorage');
        const mockAuth = await mockStorage.mockLogin(email, password);
        setToken(mockAuth.token);
        setUser(mockAuth.user);
        await AsyncStorage.setItem('userToken', mockAuth.token);
        await AsyncStorage.setItem('userData', JSON.stringify(mockAuth.user));
        return { success: true, user: mockAuth.user };
      } catch (e) {
        return { success: false, error: 'Authentication failed' };
      }
    }
  };

  const quickDemoLogin = async (roleKey = 'customer') => {
    const creds = DEMO_USERS[roleKey] || DEMO_USERS.customer;
    return login(creds.email, creds.password);
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      const responseData = res.data?.data || res.data;
      const receivedToken = responseData.token;
      const receivedUser = responseData.user;
      setToken(receivedToken);
      setUser(receivedUser);
      await AsyncStorage.setItem('userToken', receivedToken);
      await AsyncStorage.setItem('userData', JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    } catch (err) {
      console.log('Registration falling back to local user store:', err.message);
      try {
        const { mockStorage } = require('../services/mockStorage');
        const mockAuth = await mockStorage.mockRegister(userData);
        setToken(mockAuth.token);
        setUser(mockAuth.user);
        await AsyncStorage.setItem('userToken', mockAuth.token);
        await AsyncStorage.setItem('userData', JSON.stringify(mockAuth.user));
        return { success: true, user: mockAuth.user };
      } catch (e) {
        return { success: false, error: 'Registration failed' };
      }
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (err) {
      console.warn('Error clearing storage:', err);
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        quickDemoLogin,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
