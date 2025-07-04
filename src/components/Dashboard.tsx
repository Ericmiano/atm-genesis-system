
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

const Dashboard: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, logout } = useSupabaseATM();
  const { isDarkMode, toggleDarkMode } = useEnhancedTheme();

  // Mock data for components that require props
  const mockStats = {
    recentTransactions: [
      {
        id: '1',
        type: 'credit',
        amount: 5000,
        description: 'Salary deposit',
        status: 'completed',
        date: new Date().toISOString(),
        recipient: 'Employer'
      },
      {
        id: '2',
        type: 'debit',
        amount: 1200,
        description: 'Grocery shopping',
        status: 'completed',
        date: new Date(Date.now() - 86400000).toISOString(),
        recipient: 'Supermarket'
      }
    ],
    totalTransactions: 45
  };

  const mockTransactions = [
    {
      id: '1',
      type: 'SEND_MONEY',
      amount: 2500,
      description: 'Money transfer to John',
      status: 'SUCCESS' as const,
      timestamp: new Date().toISOString(),
      recipient: 'John Doe'
    },
    {
      id: '2',
      type: 'PAYBILL',
      amount: 3200,
      description: 'Electricity bill payment',
      status: 'SUCCESS' as const,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      recipient: 'KPLC'
    }
  ];

  const mockLoans = [
    {
      id: '1',
      amount: 50000,
      term: 12,
      interestRate: 8.5,
      status: 'ACTIVE' as const,
      monthlyPayment: 4500,
      remainingBalance: 35000,
      nextPaymentDate: new Date(Date.now() + 2592000000).toISOString(),
      createdAt: new Date(Date.now() - 7776000000).toISOString()
    }
  ];

  const mockBills = [
    {
      id: '1',
      name: 'Electricity',
      amount: 3200,
      dueDate: new Date(Date.now() + 604800000).toISOString(),
      status: 'PENDING' as const,
      category: 'Utilities'
    },
    {
      id: '2',
      name: 'Water',
      amount: 1800,
      dueDate: new Date(Date.now() + 1209600000).toISOString(),
      status: 'PAID' as const,
      category: 'Utilities'
    }
  ];

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

  const handleTransactionSuccess = () => {
    console.log('Transaction successful');
  };

  const handleApplyNewLoan = () => {
    console.log('Apply for new loan');
  };

  const handleAddBill = () => {
    console.log('Add new bill');
  };

  const handleSaveSettings = (settings: any) => {
    console.log('Save settings:', settings);
  };

  const renderScreen = () => {
    const screenVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
    };

    switch (activeScreen) {
      case 'overview':
        return (
          <motion.div key="overview" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <OverviewScreen stats={mockStats} currentUser={currentUser} />
          </motion.div>
        );
      case 'transactions':
        return (
          <motion.div key="transactions" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <TransactionsScreen transactions={mockTransactions} onTransactionSuccess={handleTransactionSuccess} />
          </motion.div>
        );
      case 'loans':
        return (
          <motion.div key="loans" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <LoansScreen loans={mockLoans} onApplyNew={handleApplyNewLoan} />
          </motion.div>
        );
      case 'bills':
        return (
          <motion.div key="bills" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <BillsScreen bills={mockBills} onAddBill={handleAddBill} />
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
            <AccessibilitySettings isOpen={true} onClose={() => setActiveScreen('overview')} />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div key="settings" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <SettingsScreen currentUser={currentUser} onSaveSettings={handleSaveSettings} />
          </motion.div>
        );
      default:
        return (
          <motion.div key="overview" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <OverviewScreen stats={mockStats} currentUser={currentUser} />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <motion.div
          className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300`}
        >
          <EnhancedSidebar
            activeTab={activeScreen}
            setActiveTab={setActiveScreen}
            onLogout={logout}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation */}
          <EnhancedTopNavBar
            currentUser={currentUser}
            onLogout={logout}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onToggleTheme={toggleDarkMode}
            isDarkMode={isDarkMode}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-hidden">
            <div className="animate-fade-in">
              <AnimatePresence mode="wait">
                {renderScreen()}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
