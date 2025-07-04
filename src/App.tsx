
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseATMProvider, useSupabaseATM } from './contexts/SupabaseATMContext';
import { EnhancedThemeProvider } from './contexts/EnhancedThemeContext';
import { NotificationProvider } from './components/enhanced/NotificationSystem';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import EnhancedLoadingSpinner from './components/enhanced/EnhancedLoadingSpinner';
import AppInitializer from './components/AppInitializer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

const AppContent: React.FC = () => {
  try {
    const { currentUser, loading, initialized } = useSupabaseATM();

    console.log('AppContent state:', { currentUser, loading, initialized });

    // Show enhanced loading spinner while initializing
    if (loading || !initialized) {
      return (
        <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
          <EnhancedLoadingSpinner 
            size="xl" 
            variant="banking" 
            message="Initializing secure banking session..."
          />
        </div>
      );
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
            return (
              <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
                <EnhancedLoadingSpinner 
                  size="xl" 
                  variant="secure" 
                  message="Establishing secure connection..."
                />
              </div>
            );
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
      <EnhancedThemeProvider>
        <NotificationProvider>
          <SupabaseATMProvider>
            <div className="min-h-screen bg-[#0E0E0E] text-[#F1F1F1] transition-all duration-300">
              <AppContent />
            </div>
          </SupabaseATMProvider>
        </NotificationProvider>
      </EnhancedThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
