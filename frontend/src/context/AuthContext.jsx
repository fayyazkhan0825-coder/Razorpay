import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the current profile on mount to restore session if cookie exists
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getProfile();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log('No active session found.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        toast.success(response.message || 'Login successful!');
        
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        return response.data.user;
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await authService.register(name, email, password);
      if (response.success) {
        toast.success('Registration successful! You can now log in.');
        return response;
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed.';
      toast.error(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      // fallback: clear state anyway
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(data);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        toast.success(response.message || 'Profile updated successfully.');
        return response.data.user;
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update profile.';
      toast.error(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
