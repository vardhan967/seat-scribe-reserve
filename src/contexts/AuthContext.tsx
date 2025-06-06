
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  is_staff: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, set a mock user since database is not set up
    const mockUser: AuthUser = {
      id: '1',
      username: 'demo_user',
      email: 'demo@example.com',
      is_staff: false
    };
    
    setUser(mockUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', email);
      
      // Mock login for now
      const mockUser: AuthUser = {
        id: '1',
        username: email.split('@')[0],
        email,
        is_staff: email.includes('admin')
      };
      
      setUser(mockUser);
      console.log('Mock login successful for user:', email);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      console.log('Attempting registration with:', email);
      
      // Mock registration for now
      const mockUser: AuthUser = {
        id: '1',
        username,
        email,
        is_staff: false
      };
      
      setUser(mockUser);
      console.log('Mock registration successful for user:', email);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('User logged out');
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
