
import React, { useState } from 'react';
import { ATMProvider, useATM } from './contexts/ATMContext';
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import WithdrawalScreen from './components/WithdrawalScreen';
import { Toaster } from "@/components/ui/toaster";

const ATMApp: React.FC = () => {
  const { isAuthenticated } = useATM();
  const [currentScreen, setCurrentScreen] = useState('main');

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen('main');
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'withdrawal':
        return <WithdrawalScreen onBack={handleBack} />;
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
    <ATMProvider>
      <ATMApp />
    </ATMProvider>
  );
};

export default App;
