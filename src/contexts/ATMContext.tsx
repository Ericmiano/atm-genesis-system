
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Language } from '../types/atm';
import { atmService } from '../services/atmService';

interface ATMContextType {
  currentUser: User | null;
  language: Language;
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  setLanguage: (lang: Language) => void;
  login: (accountNumber: string, pin: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const ATMContext = createContext<ATMContextType | undefined>(undefined);

export const ATMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (accountNumber: string, pin: string) => {
    const result = await atmService.authenticate(accountNumber, pin);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    atmService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <ATMContext.Provider value={{
      currentUser,
      language,
      isAuthenticated,
      setCurrentUser,
      setLanguage,
      login,
      logout
    }}>
      {children}
    </ATMContext.Provider>
  );
};

export const useATM = () => {
  const context = useContext(ATMContext);
  if (context === undefined) {
    throw new Error('useATM must be used within an ATMProvider');
  }
  return context;
};
