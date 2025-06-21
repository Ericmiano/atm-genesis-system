
import React, { useState } from 'react';
import { SupabaseATMProvider, useSupabaseATM } from './contexts/SupabaseATMContext';
import AuthScreen from './components/AuthScreen';
import MainMenu from './components/MainMenu';
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

const ATMApp: React.FC = () => {
  console.log('🖥️ ATMApp component rendering...');
  const { isAuthenticated, loading, currentUser } = useSupabaseATM();
  const [currentScreen, setCurrentScreen] = useState('main');

  console.log('🔐 Auth state:', { 
    isAuthenticated, 
    loading, 
    hasUser: !!currentUser,
    userEmail: currentUser?.email,
    currentScreen 
  });

  const handleNavigate = (screen: string) => {
    console.log('🧭 Navigating to screen:', screen);
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    console.log('⬅️ Going back to main menu');
    setCurrentScreen('main');
  };

  const handleAuthSuccess = () => {
    console.log('✅ Auth success, navigating to main');
    setCurrentScreen('main');
  };

  // Show loading state
  if (loading) {
    console.log('⏳ App is in loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading ATM System...</div>
      </div>
    );
  }

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
      </div>
    );
  }

  console.log('✅ User authenticated with data, current screen:', currentScreen);

  const renderScreen = () => {
    console.log('🎨 Rendering screen:', currentScreen);
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
          console.log('🏠 Rendering MainMenu for user:', currentUser.name);
          return <MainMenu onNavigate={handleNavigate} />;
      }
    } catch (error) {
      console.error('❌ Error rendering screen:', error);
      // Fallback to main menu on error
      setCurrentScreen('main');
      return <MainMenu onNavigate={handleNavigate} />;
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
};

export default App;
