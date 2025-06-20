
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Language } from '../types/atm';
import { supabaseATMService } from '../services/supabaseATMService';
import { supabase } from '@/integrations/supabase/client';

interface SupabaseATMContextType {
  currentUser: User | null;
  language: Language;
  isAuthenticated: boolean;
  loading: boolean;
  setLanguage: (lang: Language) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const SupabaseATMContext = createContext<SupabaseATMContextType | undefined>(undefined);

export const SupabaseATMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    console.log('Refreshing user data...');
    try {
      const user = await supabaseATMService.getCurrentUser();
      console.log('User data retrieved:', user);
      setCurrentUser(user);
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    console.log('Logging out user...');
    await supabaseATMService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (session?.user) {
          console.log('User session found, refreshing user data...');
          await refreshUser();
        } else {
          console.log('No user session, clearing user data...');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
        
        // Always set loading to false after handling auth state
        console.log('Setting loading to false');
        setLoading(false);
      }
    );

    // Check for existing session
    console.log('Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session check:', session?.user?.email || 'No session');
      if (session?.user) {
        refreshUser().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseATMContext.Provider value={{
      currentUser,
      language,
      isAuthenticated,
      loading,
      setLanguage,
      refreshUser,
      logout
    }}>
      {children}
    </SupabaseATMContext.Provider>
  );
};

export const useSupabaseATM = () => {
  const context = useContext(SupabaseATMContext);
  if (context === undefined) {
    throw new Error('useSupabaseATM must be used within a SupabaseATMProvider');
  }
  return context;
};
