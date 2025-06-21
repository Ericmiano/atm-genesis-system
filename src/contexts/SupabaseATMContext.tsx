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

export function SupabaseATMProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      console.log('Context: Refreshing user data...');
      const user = await supabaseATMService.getCurrentUser();
      console.log('Context: User data retrieved:', user ? 'Success' : 'No user found');
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      console.log('Context: State updated - isAuthenticated:', !!user);
    } catch (error) {
      console.error('Context: Error refreshing user:', error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      await supabaseATMService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Context: Logout error:', error);
    }
  };

  useEffect(() => {
    // Check for existing session first
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Context: Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Context: Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Context: Auth state change:', event, session?.user?.email);
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            await refreshUser();
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Context: Error handling auth state change:', error);
        }
      }
    );

    return () => {
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
}

export function useSupabaseATM() {
  const context = useContext(SupabaseATMContext);
  if (context === undefined) {
    throw new Error('useSupabaseATM must be used within a SupabaseATMProvider');
  }
  return context;
}
