
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
  const { isAuthenticated, loading } = useSupabaseATM();
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
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
        return <MainMenu onNavigate={handleNavigate} />;
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
      <ATMApp />
    </SupabaseATMProvider>
  );
};

export default App;
