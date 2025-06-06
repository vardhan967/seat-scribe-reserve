
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, confirmPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Mock user database for testing
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'password',
    email: 'admin@library.com',
    is_staff: true,
  },
  {
    id: 2,
    username: 'user',
    password: 'password',
    email: 'user@library.com',
    is_staff: false,
  },
  {
    id: 3,
    username: 'librarian',
    password: 'librarian123',
    email: 'librarian@library.com',
    is_staff: true,
  },
];

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is stored in localStorage for persistence
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { username, password });
      
      // Find user in mock database
      const foundUser = mockUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          is_staff: foundUser.is_staff,
        };
        
        setUser(userData);
        // Store in localStorage for persistence
        localStorage.setItem('mockUser', JSON.stringify(userData));
        console.log('Login successful for user:', userData);
        return true;
      }
      
      console.log('Login failed: Invalid credentials');
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (username: string, password: string, confirmPassword: string): Promise<boolean> => {
    try {
      if (password !== confirmPassword) {
        return false;
      }

      // Check if username already exists
      const existingUser = mockUsers.find((u) => u.username === username);
      if (existingUser) {
        console.log('Registration failed: Username already exists');
        return false;
      }

      // For mock implementation, we'll just return success without actually storing
      // In a real app, this would create a new user in the database
      console.log('Mock registration successful for username:', username);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem('mockUser');
      console.log('User logged out');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const getCsrfToken = (): string => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    return '';
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
