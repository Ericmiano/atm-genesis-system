
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Language } from '../types/atm';
import { supabaseATMService } from '../services/supabaseATMService';
import { supabase } from '@/integrations/supabase/client';

interface SupabaseATMContextType {
  currentUser: User | null;
  language: Language;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
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
  const [initialized, setInitialized] = useState(false);

  const refreshUser = async () => {
    console.log('🔄 Refreshing user data...');
    try {
      const user = await supabaseATMService.getCurrentUser();
      console.log('✅ User data retrieved:', user ? `${user.name} (${user.email})` : 'null');
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      
      if (user) {
        console.log('✅ User authenticated successfully:', {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out user...');
    try {
      await supabaseATMService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const createFallbackUser = (session: any) => ({
    id: session.user.id,
    name: session.user.email || 'User',
    email: session.user.email || '',
    accountNumber: '0000000000',
    balance: 0,
    pin: '0000',
    cardNumber: '0000000000000000',
    expiryDate: '00/00',
    cvv: '000',
    cardType: 'VISA' as const,
    role: 'USER' as const,
    username: session.user.email?.split('@')[0] || 'user',
    password: '',
    isLocked: false,
    lockReason: undefined,
    lockDate: undefined,
    failedAttempts: 0,
    failedPasswordAttempts: 0,
    lastPasswordAttempt: undefined,
    createdAt: new Date().toISOString(),
    lastLogin: undefined,
    creditScore: undefined,
    monthlyIncome: undefined,
    passwordLastChanged: undefined,
    mustChangePassword: false
  });

  useEffect(() => {
    console.log('🚀 Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in, refreshing user data...');
          setTimeout(async () => {
            try {
              await refreshUser();
            } catch (error) {
              console.error('❌ Error during sign-in refresh:', error);
              setCurrentUser(createFallbackUser(session));
              setIsAuthenticated(true);
            } finally {
              setLoading(false);
              setInitialized(true);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('🚪 User signed out or no session');
          setCurrentUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          setInitialized(true);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
        setLoading(false);
        setInitialized(true);
        return;
      }

      console.log('📋 Existing session check:', session?.user?.email || 'No session');
      
      if (session?.user) {
        console.log('✅ Found existing session, refreshing user...');
        refreshUser().catch((error) => {
          console.error('❌ Error refreshing user on initial load:', error);
          setCurrentUser(createFallbackUser(session));
          setIsAuthenticated(true);
        }).finally(() => {
          console.log('🏁 Setting loading to false after session check');
          setLoading(false);
          setInitialized(true);
        });
      } else {
        console.log('ℹ️ No existing session found');
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  console.log('🔍 Current auth state:', {
    loading,
    isAuthenticated,
    initialized,
    hasUser: !!currentUser,
    userName: currentUser?.name
  });

  return (
    <SupabaseATMContext.Provider value={{
      currentUser,
      language,
      isAuthenticated,
      loading,
      initialized,
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
