
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for token in localStorage
    const storedToken = localStorage.getItem('taskAppToken');
    const storedUser = localStorage.getItem('taskAppUser');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call to your backend
      // For demo purposes, we'll simulate a successful login with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login - would be replaced with actual API response
      const mockUser = {
        id: '123456',
        email,
        name: email.split('@')[0],
      };
      
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(7);
      
      setUser(mockUser);
      setToken(mockToken);
      
      // Store in localStorage
      localStorage.setItem('taskAppToken', mockToken);
      localStorage.setItem('taskAppUser', JSON.stringify(mockUser));
      
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
      return false;
    }
  };
  
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call to your backend
      // For demo purposes, we'll simulate a successful signup with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful signup
      const mockUser = {
        id: '123456',
        email,
        name,
      };
      
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(7);
      
      setUser(mockUser);
      setToken(mockToken);
      
      // Store in localStorage
      localStorage.setItem('taskAppToken', mockToken);
      localStorage.setItem('taskAppUser', JSON.stringify(mockUser));
      
      toast.success('Account created successfully');
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      toast.error('Signup failed. Please try again.');
      return false;
    }
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('taskAppToken');
    localStorage.removeItem('taskAppUser');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
