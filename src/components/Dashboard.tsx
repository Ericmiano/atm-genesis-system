import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { useEnhancedTheme } from '../contexts/EnhancedThemeContext';
import EnhancedSidebar from './dashboard/EnhancedSidebar';
import EnhancedTopNavBar from './dashboard/EnhancedTopNavBar';
import OverviewScreen from './dashboard/OverviewScreen';
import TransactionsScreen from './dashboard/TransactionsScreen';
import LoansScreen from './dashboard/LoansScreen';
import BillsScreen from './dashboard/BillsScreen';
import SettingsScreen from './dashboard/SettingsScreen';
import AnalyticsDashboard from './dashboard/AnalyticsDashboard';
import SystemMetricsScreen from './dashboard/SystemMetricsScreen';
import AdvancedSecurityDashboard from './dashboard/AdvancedSecurityDashboard';
import AccessibilitySettings from './accessibility/AccessibilitySettings';
import SecuritySettings from './accessibility/SecuritySettings';
import InteractiveCard from './enhanced/InteractiveCard';

const Dashboard: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, logout } = useSupabaseATM();
  const { isDarkMode, toggleDarkMode } = useEnhancedTheme();

  useEffect(() => {
    console.log('Dashboard mounted');
    return () => {
      console.log('Dashboard unmounted');
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderScreen = () => {
    const screenVariants = {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    switch (activeScreen) {
      case 'overview':
        return (
          <motion.div key="overview" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <OverviewScreen />
          </motion.div>
        );
      case 'transactions':
        return (
          <motion.div key="transactions" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <TransactionsScreen />
          </motion.div>
        );
      case 'loans':
        return (
          <motion.div key="loans" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <LoansScreen />
          </motion.div>
        );
      case 'bills':
        return (
          <motion.div key="bills" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <BillsScreen />
          </motion.div>
        );
      case 'analytics':
        return (
          <motion.div key="analytics" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <AnalyticsDashboard />
          </motion.div>
        );
      case 'security':
        return (
          <motion.div key="security" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <SecuritySettings />
          </motion.div>
        );
      case 'advanced-security':
        return (
          <motion.div key="advanced-security" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <AdvancedSecurityDashboard />
          </motion.div>
        );
      case 'system-metrics':
        return (
          <motion.div key="system-metrics" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <SystemMetricsScreen />
          </motion.div>
        );
      case 'accessibility':
        return (
          <motion.div key="accessibility" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <AccessibilitySettings />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div key="settings" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <SettingsScreen />
          </motion.div>
        );
      default:
        return (
          <motion.div key="overview" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <OverviewScreen />
          </motion.div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#0E0E0E] to-[#1A1A1A] text-[#F1F1F1]' 
        : 'bg-gradient-to-br from-gray-50 to-white text-gray-900'
    }`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <EnhancedSidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="md:ml-64 transition-all duration-300">
        {/* Top Navigation */}
        <EnhancedTopNavBar
          currentUser={currentUser}
          onLogout={logout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleTheme={toggleDarkMode}
          isDarkMode={isDarkMode}
        />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {renderScreen()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
