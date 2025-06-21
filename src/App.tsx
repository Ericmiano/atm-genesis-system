import React, { useState, useEffect } from 'react';
import { SupabaseATMProvider, useSupabaseATM } from './contexts/SupabaseATMContext';
import AuthScreen from './components/AuthScreen';
import WithdrawalScreen from './components/WithdrawalScreen';
import DepositScreen from './components/DepositScreen';
import BalanceScreen from './components/BalanceScreen';
import TransferScreen from './components/TransferScreen';
import HistoryScreen from './components/HistoryScreen';
import BillPaymentScreen from './components/BillPaymentScreen';
import LoansScreen from './components/LoansScreen';
import SettingsScreen from './components/SettingsScreen';
import AdminScreen from './components/AdminScreen';
import { Toaster } from "@/components/ui/toaster";
import Dashboard from './components/Dashboard';
import { Loader2, AlertTriangle } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              An unexpected error occurred. Please reload the application.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ATMApp: React.FC = () => {
<<<<<<< HEAD
=======
  console.log('🖥️ ATMApp component rendering...');
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
  const { isAuthenticated, loading, currentUser } = useSupabaseATM();
  const [currentScreen, setCurrentScreen] = useState('main');
  const [appLoading, setAppLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('App: Loading timeout reached, forcing app to continue');
        setAppLoading(false);
      }
    }, 5000); // 5 second timeout

    if (!loading) {
      setAppLoading(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [loading]);

  console.log('🔐 Auth state:', { 
    isAuthenticated, 
    loading, 
    hasUser: !!currentUser,
    userEmail: currentUser?.email,
    currentScreen 
  });

  const handleNavigate = (screen: string) => {
<<<<<<< HEAD
    console.log('App: Navigating to screen:', screen);
=======
    console.log('🧭 Navigating to screen:', screen);
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
    setCurrentScreen(screen);
    setError(null); // Clear any previous errors
  };

  const handleBack = () => {
<<<<<<< HEAD
    console.log('App: Navigating back to main screen');
=======
    console.log('⬅️ Going back to main menu');
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
    setCurrentScreen('main');
    setError(null); // Clear any previous errors
  };

  const handleAuthSuccess = () => {
<<<<<<< HEAD
    console.log('App: Authentication successful, navigating to main screen');
=======
    console.log('✅ Auth success, navigating to main');
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
    setCurrentScreen('main');
    setError(null); // Clear any previous errors
  };

<<<<<<< HEAD
  // Debug logging
  console.log('App: Current state:', {
    loading,
    appLoading,
    isAuthenticated,
    currentScreen,
    hasUser: !!currentUser,
    userEmail: currentUser?.email,
    error
  });

  // Show error screen if there's a critical error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">System Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
=======
  // Show loading state
  if (loading) {
    console.log('⏳ App is in loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading ATM System...</div>
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
      </div>
    );
  }

<<<<<<< HEAD
  // Show loading screen
  if (loading && appLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading ATM System</h2>
          <p className="text-blue-100">Please wait while we initialize...</p>
        </div>
      </div>
    );
  }

  // If still loading after timeout, show auth screen
  if (loading && !appLoading) {
    console.log('App: Loading timeout reached, showing auth screen');
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (!isAuthenticated) {
    console.log('App: User not authenticated, showing AuthScreen');
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (!currentUser) {
    console.log('App: User authenticated but no user data, showing error');
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Authentication Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Unable to load user data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
=======
  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    console.log('🔒 User not authenticated, showing auth screen');
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Show loading if authenticated but no user data yet
  if (!currentUser) {
    console.log('⚠️ User authenticated but no user data, showing setup screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Setting up your account...</div>
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
      </div>
    );
  }

<<<<<<< HEAD
  console.log('App: Rendering main application with user:', currentUser.email);

  const renderScreen = () => {
    console.log('App: Rendering screen:', currentScreen);
=======
  console.log('✅ User authenticated with data, current screen:', currentScreen);

  const renderScreen = () => {
    console.log('🎨 Rendering screen:', currentScreen);
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
    try {
      switch (currentScreen) {
        case 'withdrawal':
          return <WithdrawalScreen onBack={handleBack} />;
        case 'deposit':
          return <DepositScreen onBack={handleBack} />;
        case 'balance':
          return <BalanceScreen onBack={handleBack} />;
        case 'transfer':
          return <TransferScreen onBack={handleBack} />;
        case 'loans':
          return <LoansScreen onBack={handleBack} />;
        case 'history':
          return <HistoryScreen onBack={handleBack} />;
        case 'bills':
          return <BillPaymentScreen onBack={handleBack} />;
        case 'settings':
          return <SettingsScreen onBack={handleBack} />;
        case 'admin':
          return <AdminScreen onBack={handleBack} />;
        case 'main':
        default:
<<<<<<< HEAD
          return <Dashboard onNavigate={handleNavigate} />;
      }
    } catch (screenError) {
      console.error('App: Error rendering screen:', screenError);
      setError('Failed to load screen. Please try again.');
      return null;
=======
          console.log('🏠 Rendering MainMenu for user:', currentUser.name);
          return <MainMenu onNavigate={handleNavigate} />;
      }
    } catch (error) {
      console.error('❌ Error rendering screen:', error);
      // Fallback to main menu on error
      setCurrentScreen('main');
      return <MainMenu onNavigate={handleNavigate} />;
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
    }
  };

  try {
    const screenComponent = renderScreen();
    console.log('✅ Screen component created successfully');
    return (
      <div className="min-h-screen">
        {screenComponent}
        <Toaster />
      </div>
    );
  } catch (error) {
    console.error('❌ Critical error rendering screen:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Application Error</div>
          <div className="text-red-500 mb-4">Something went wrong. Please try refreshing the page.</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

const App: React.FC = () => {
<<<<<<< HEAD
  return (
    <SupabaseATMProvider>
      <ErrorBoundary>
        <ATMApp />
      </ErrorBoundary>
    </SupabaseATMProvider>
  );
=======
  console.log('🚀 Main App component rendering...');
  
  try {
    return (
      <SupabaseATMProvider>
        <ATMApp />
      </SupabaseATMProvider>
    );
  } catch (error) {
    console.error('❌ Critical error in main App component:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Critical Application Error</div>
          <div className="text-red-500 mb-4">The application failed to initialize. Please try refreshing the page.</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
};

export default App;
