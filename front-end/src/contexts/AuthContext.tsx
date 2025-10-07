import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { authAPI } from '../services/authService';
import { User, LoginRequest } from '../types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  signin: (credentials: LoginRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuthentication: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // ตรวจสอบว่ามี token หรือไม่
      const hasToken = await authAPI.isLoggedIn();
      if (hasToken) {
        setIsLoggedIn(true);
        // ลองดึงข้อมูล profile ด้วย token + x-api-key
        await refreshUser();
      } else {
        console.log('🔐 No token found, need to sign in first');
        setIsLoggedIn(false);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setIsLoggedIn(false);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signin = async (credentials: LoginRequest): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await authAPI.signin(credentials);
      
      console.log('🔐 AuthContext signin response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.user) {
        // Force save token และ user data ใน AuthContext
        if (response.token) {
          console.log('🔐 AuthContext: Saving token manually...');
          await AsyncStorage.setItem('userToken', response.token);
          await AsyncStorage.setItem('userData', JSON.stringify(response.user));
          
          // ตรวจสอบทันที
          const savedToken = await AsyncStorage.getItem('userToken');
          console.log('🔐 AuthContext: Token verification after save:', savedToken ? 'Found' : 'Not found');
        }
        
        setUser(response.user);
        setIsLoggedIn(true);
        setIsAuthenticated(true);
        
        // สร้างข้อความต้อนรับด้วยชื่อจริง
        const userName = response.user.firstname && response.user.lastname 
          ? `${response.user.firstname} ${response.user.lastname}` 
          : response.user.name || 'User';
        
        return { 
          success: true, 
          message: `สวัสดี ${userName}! เข้าสู่ระบบสำเร็จแล้ว` 
        };
      } else {
        return { 
          success: false, 
          message: response.message || 'Invalid credentials' 
        };
      }
    } catch (error: any) {
      console.error('🔐 AuthContext signin error:', error);
      return { 
        success: false, 
        message: error.message || 'Sign in failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsLoggedIn(false);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        // หาก profile ไม่ได้แต่ยังมี token อาจจะต้อง logout
        if (await authAPI.isLoggedIn()) {
          await logout();
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
      setIsAuthenticated(false);
      // หาก error 401 แปลว่า token หมดอายุ
      await logout();
    }
  };

  const checkAuthentication = async (): Promise<boolean> => {
    try {
      const authResult = await authAPI.isAuthenticated();
      setIsAuthenticated(authResult);
      if (authResult) {
        await refreshUser();
      }
      return authResult;
    } catch (error) {
      console.error('Check authentication error:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isLoggedIn,
    signin,
    logout,
    refreshUser,
    checkAuthentication,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};