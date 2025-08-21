'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { config, buildApiUrl, API_ENDPOINTS } from '@/lib/config';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'CLINIC_ADMIN' | 'SUPER_ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
  isClinicAdmin: boolean;
  isSuperAdmin: boolean;
  isPatient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Configure axios defaults
  axios.defaults.baseURL = config.backendUri;
  axios.defaults.withCredentials = true;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Redirect super admin to dashboard when authenticated
  useEffect(() => {
    if (!loading && user?.role === 'SUPER_ADMIN') {
      if (pathname === '/' || pathname === '/login' || pathname === '/register') {
        router.push('/admin/dashboard');
      }
    }
  }, [loading, user, pathname, router]);

  const checkAuthStatus = async () => {
    try {
      // Check if user is authenticated by making a request
      const response = await axios.get(API_ENDPOINTS.userProfile);
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      // User is not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.login, { email, password });
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(API_ENDPOINTS.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.register, { name, email, password });
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isDoctor: user?.role === 'DOCTOR',
    isAdmin: user?.role === 'ADMIN',
    isClinicAdmin: user?.role === 'CLINIC_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
    isPatient: user?.role === 'PATIENT',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
