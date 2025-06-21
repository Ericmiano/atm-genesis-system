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

  const handleNavigate = (screen: string) => {
    console.log('App: Navigating to screen:', screen);
    setCurrentScreen(screen);
    setError(null); // Clear any previous errors
  };

  const handleBack = () => {
    console.log('App: Navigating back to main screen');
    setCurrentScreen('main');
    setError(null); // Clear any previous errors
  };

  const handleAuthSuccess = () => {
    console.log('App: Authentication successful, navigating to main screen');
    setCurrentScreen('main');
    setError(null); // Clear any previous errors
  };

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
      </div>
    );
  }

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
      </div>
    );
  }

  console.log('App: Rendering main application with user:', currentUser.email);

  const renderScreen = () => {
    console.log('App: Rendering screen:', currentScreen);
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
          return <Dashboard onNavigate={handleNavigate} />;
      }
    } catch (screenError) {
      console.error('App: Error rendering screen:', screenError);
      setError('Failed to load screen. Please try again.');
      return null;
    }
  };

  return (
    <div className="min-h-screen">
      {renderScreen()}
      <Toaster />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SupabaseATMProvider>
      <ErrorBoundary>
        <ATMApp />
      </ErrorBoundary>
    </SupabaseATMProvider>
  );
};

export default App;
