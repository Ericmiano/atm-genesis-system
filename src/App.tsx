
import React, { useState, useEffect } from 'react';
import { SupabaseATMProvider, useSupabaseATM } from './contexts/SupabaseATMContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
import LoadingSpinner from './components/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

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

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen('main');
  };

  const handleAuthSuccess = () => {
    setCurrentScreen('main');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (!currentUser) {
    return <LoadingSpinner message="Setting up your account..." />;
  }

  const renderScreen = () => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {renderScreen()}
      <Toaster />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SupabaseATMProvider>
        <SecurityProvider>
          <ErrorBoundary>
            <ATMApp />
          </ErrorBoundary>
        </SecurityProvider>
      </SupabaseATMProvider>
    </ThemeProvider>
  );
};

export default App;
