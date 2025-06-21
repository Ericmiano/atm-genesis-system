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
    console.log('🔄 Refreshing user data...');
    try {
      console.log('Context: Refreshing user data...');
      const user = await supabaseATMService.getCurrentUser();
<<<<<<< HEAD
      console.log('Context: User data retrieved:', user ? 'Success' : 'No user found');
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      console.log('Context: State updated - isAuthenticated:', !!user);
    } catch (error) {
      console.error('Context: Error refreshing user:', error);
=======
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
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
<<<<<<< HEAD
=======
    console.log('🚪 Logging out user...');
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
    try {
      await supabaseATMService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
<<<<<<< HEAD
    } catch (error) {
      console.error('Context: Logout error:', error);
=======
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still clear local state even if logout fails
      setCurrentUser(null);
      setIsAuthenticated(false);
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
    }
  };

  useEffect(() => {
<<<<<<< HEAD
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
=======
    console.log('🚀 Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in, refreshing user data...');
          // Use setTimeout to prevent potential deadlocks
          setTimeout(async () => {
            try {
              await refreshUser();
            } catch (error) {
              console.error('❌ Error during sign-in refresh:', error);
              // Create a basic user profile if refresh fails
              setCurrentUser({
                id: session.user.id,
                name: session.user.email || 'User',
                email: session.user.email || '',
                accountNumber: '0000000000',
                balance: 0,
                pin: '0000',
                cardNumber: '0000000000000000',
                expiryDate: '00/00',
                cvv: '000',
                cardType: 'VISA',
                role: 'USER',
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
              setIsAuthenticated(true);
            } finally {
              setLoading(false);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('🚪 User signed out or no session');
          setCurrentUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
          // Don't change loading state on token refresh
        }
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
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

<<<<<<< HEAD
    return () => {
=======
    // Check for existing session
    console.log('🔍 Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
        setLoading(false);
        return;
      }

      console.log('📋 Existing session check:', session?.user?.email || 'No session');
      
      if (session?.user) {
        console.log('✅ Found existing session, refreshing user...');
        refreshUser().catch((error) => {
          console.error('❌ Error refreshing user on initial load:', error);
          // Fallback to basic user info if refresh fails
          setCurrentUser({
            id: session.user.id,
            name: session.user.email || 'User',
            email: session.user.email || '',
            accountNumber: '0000000000',
            balance: 0,
            pin: '0000',
            cardNumber: '0000000000000000',
            expiryDate: '00/00',
            cvv: '000',
            cardType: 'VISA',
            role: 'USER',
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
          setIsAuthenticated(true);
        }).finally(() => {
          console.log('🏁 Setting loading to false after session check');
          setLoading(false);
        });
      } else {
        console.log('ℹ️ No existing session found');
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
      subscription.unsubscribe();
    };
  }, []);

  // Debug current state
  console.log('🔍 Current auth state:', {
    loading,
    isAuthenticated,
    hasUser: !!currentUser,
    userName: currentUser?.name
  });

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
