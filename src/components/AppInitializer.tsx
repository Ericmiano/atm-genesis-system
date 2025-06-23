
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AppState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

const AppInitializer: React.FC<{ children: (state: AppState) => React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    session: null,
    loading: true,
    initialized: false
  });

  useEffect(() => {
    console.log('🔄 AppInitializer: Setting up auth state listener...');

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email);
        
        setState(prevState => ({
          ...prevState,
          session,
          user: session?.user ?? null,
          loading: false,
          initialized: true
        }));
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
      } else {
        console.log('✅ Initial session:', session?.user?.email || 'No session');
      }
      
      setState(prevState => ({
        ...prevState,
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true
      }));
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  return <>{children(state)}</>;
};

export default AppInitializer;
