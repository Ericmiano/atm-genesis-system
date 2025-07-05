
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseATMProvider, useSupabaseATM } from './contexts/SupabaseATMContext';
import { EnhancedThemeProvider } from './contexts/EnhancedThemeContext';
import { NotificationProvider } from './components/enhanced/NotificationSystem';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import EnhancedLoadingSpinner from './components/enhanced/EnhancedLoadingSpinner';
import AppInitializer from './components/AppInitializer';
import LandingPage from './components/landing/LandingPage';
import SignupForm from './components/landing/SignupForm';
import ProductsPage from './components/landing/ProductsPage';
import { 
  registerServiceWorker, 
  requestNotificationPermission, 
  checkInstallPrompt,
  onConnectionChange 
} from './utils/pwaUtils';

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

    // Show auth screen for non-authenticated users (this will be routed properly)
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/login" element={<AuthScreen onAuthSuccess={() => {
            console.log('Auth success, user should be redirected automatically');
          }} />} />
        </Routes>
      </Router>
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
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignupForm />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/login" element={<AuthScreen onAuthSuccess={() => {
                  console.log('Auth success via fallback');
                }} />} />
              </Routes>
            </Router>
          );
        }}
      </AppInitializer>
    );
  }
};

const App: React.FC = () => {
  console.log('App component rendering...');
  
  useEffect(() => {
    // Initialize PWA features
    registerServiceWorker();
    requestNotificationPermission();
    checkInstallPrompt();
    
    // Monitor connection status
    onConnectionChange((isOnline) => {
      console.log('Connection status changed:', isOnline ? 'Online' : 'Offline');
      
      if (!isOnline) {
        // Show offline notification
        const offlineToast = document.createElement('div');
        offlineToast.className = 'fixed top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        offlineToast.textContent = 'You are now offline. Some features may be limited.';
        document.body.appendChild(offlineToast);
        
        setTimeout(() => {
          if (offlineToast.parentNode) {
            offlineToast.remove();
          }
        }, 5000);
      } else {
        // Show online notification
        const onlineToast = document.createElement('div');
        onlineToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        onlineToast.textContent = 'Connection restored. All features are available.';
        document.body.appendChild(onlineToast);
        
        setTimeout(() => {
          if (onlineToast.parentNode) {
            onlineToast.remove();
          }
        }, 3000);
      }
    });
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
