
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseATMProvider, useSupabaseATM } from './contexts/SupabaseATMContext';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import AppInitializer from './components/AppInitializer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  try {
    const { currentUser, loading, initialized } = useSupabaseATM();

    console.log('AppContent state:', { currentUser, loading, initialized });

    // Show loading spinner while initializing
    if (loading || !initialized) {
      return <LoadingSpinner />;
    }

    // Show dashboard if user is authenticated
    if (currentUser) {
      return <Dashboard />;
    }

    // Show auth screen for non-authenticated users
    return (
      <AuthScreen 
        onAuthSuccess={() => {
          console.log('Auth success, user should be redirected automatically');
        }} 
      />
    );
  } catch (error) {
    console.error('Error in AppContent, falling back to AppInitializer:', error);
    
    // Fallback to simple initializer if context fails
    return (
      <AppInitializer>
        {({ user, loading, initialized }) => {
          if (loading || !initialized) {
            return <LoadingSpinner />;
          }

          if (user) {
            return <Dashboard />;
          }

          return (
            <AuthScreen 
              onAuthSuccess={() => {
                console.log('Auth success via fallback');
              }} 
            />
          );
        }}
      </AppInitializer>
    );
  }
};

const App: React.FC = () => {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseATMProvider>
        <div className="min-h-screen bg-[#0E0E0E] text-[#F1F1F1]">
          <AppContent />
        </div>
      </SupabaseATMProvider>
    </QueryClientProvider>
  );
};

export default App;
