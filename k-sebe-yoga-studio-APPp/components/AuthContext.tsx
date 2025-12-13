
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { dataService } from '../services/dataService';

interface AuthContextType {
  user: UserProfile | null;
  login: (name: string, phone: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: UserProfile) => void; // Exposed to allow manual updates without API calls
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedUser = dataService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (name: string, phone: string) => {
    try {
      const newUser = await dataService.registerUser(name, phone);
      setUser(newUser);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    dataService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
