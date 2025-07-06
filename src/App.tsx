
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseATMProvider, useSupabaseATM } from './contexts/SupabaseATMContext';
import { EnhancedThemeProvider } from './contexts/EnhancedThemeContext';
import { NotificationProvider } from './components/enhanced/NotificationSystem';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import EnhancedLoadingSpinner from './components/enhanced/EnhancedLoadingSpinner';
import LandingPage from './components/landing/LandingPage';
import SignupForm from './components/landing/SignupForm';
import ProductsPage from './components/landing/ProductsPage';
import { 
  registerServiceWorker, 
  requestNotificationPermission, 
  checkInstallPrompt,
  onConnectionChange,
  showOfflineToast,
  showOnlineToast
} from './utils/pwaUtils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const AppContent: React.FC = () => {
  const { currentUser, loading, initialized } = useSupabaseATM();

  console.log('AppContent state:', { 
    hasUser: !!currentUser, 
    loading, 
    initialized,
    userName: currentUser?.name 
  });

  // Show enhanced loading spinner while initializing
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-all duration-300">
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
    console.log('Rendering Dashboard for user:', currentUser.name);
    return <Dashboard />;
  }

  // Show routing for non-authenticated users
  console.log('Rendering auth routes - no user');
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login" element={<AuthScreen onAuthSuccess={() => {
          console.log('Auth success callback triggered');
        }} />} />
        <Route path="/auth" element={<AuthScreen onAuthSuccess={() => {
          console.log('Auth success callback triggered');
        }} />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  console.log('App component rendering...');
  
  useEffect(() => {
    // Initialize PWA features safely
    const initializePWA = async () => {
      try {
        await registerServiceWorker();
        await requestNotificationPermission();
        checkInstallPrompt();
        
        // Monitor connection status
        const cleanup = onConnectionChange((isOnline) => {
          console.log('Connection status changed:', isOnline ? 'Online' : 'Offline');
          
          if (!isOnline) {
            showOfflineToast();
          } else {
            showOnlineToast();
          }
        });

        return cleanup;
      } catch (error) {
        console.error('Error initializing PWA features:', error);
        return () => {};
      }
    };

    let cleanup: (() => void) | undefined;
    
    initializePWA().then((cleanupFn) => {
      cleanup = cleanupFn;
    }).catch((error) => {
      console.error('PWA initialization error:', error);
    });
    
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedThemeProvider>
        <NotificationProvider>
          <SupabaseATMProvider>
            <div className="min-h-screen transition-all duration-300">
              <AppContent />
            </div>
          </SupabaseATMProvider>
        </NotificationProvider>
      </EnhancedThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
