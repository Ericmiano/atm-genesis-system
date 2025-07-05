
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { useEnhancedTheme } from '../contexts/EnhancedThemeContext';
import { SecurityProvider } from '../contexts/SecurityContext';
import { realTimeService } from '../services/realTimeService';
import EnhancedSidebar from './dashboard/EnhancedSidebar';
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
import NotificationBell from './notifications/NotificationBell';
import PresenceIndicator from './presence/PresenceIndicator';
import BiometricAuth from './advanced/BiometricAuth';
import QRPayment from './advanced/QRPayment';
import MpesaIntegration from './mpesa/MpesaIntegration';

const Dashboard: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showMpesa, setShowMpesa] = useState(false);
  const [qrMode, setQrMode] = useState<'generate' | 'scan'>('scan');
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
    
    // Initialize real-time services
    if (currentUser) {
      // Subscribe to transaction updates
      realTimeService.subscribeToTransactions(currentUser.id);
      
      // Subscribe to security events
      realTimeService.subscribeToSecurityEvents(currentUser.id, (event) => {
        console.log('Security event:', event);
      });
      
      // Subscribe to fraud alerts
      realTimeService.subscribeToFraudAlerts(currentUser.id, (alert) => {
        console.log('Fraud alert:', alert);
      });
    }
    
    return () => {
      console.log('Dashboard unmounted');
      realTimeService.unsubscribeAll();
    };
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleVoiceCommand = (command: string, params?: any) => {
    console.log('Voice command:', command, params);
    
    switch (command) {
      case 'BALANCE_INQUIRY':
        setActiveScreen('overview');
        break;
      case 'SEND_MONEY':
        setActiveScreen('transactions');
        break;
      case 'WITHDRAWAL':
      case 'DEPOSIT':
        setActiveScreen('transactions');
        break;
      case 'VIEW_BILLS':
        setActiveScreen('bills');
        break;
      case 'VIEW_LOANS':
        setActiveScreen('loans');
        break;
      case 'VIEW_TRANSACTIONS':
        setActiveScreen('transactions');
        break;
      case 'VIEW_SETTINGS':
        setActiveScreen('settings');
        break;
      case 'LOGOUT':
        handleLogout();
        break;
      default:
        console.log('Unknown voice command:', command);
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
      case 'mpesa':
        return (
          <motion.div key="mpesa" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <MpesaIntegration />
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
    <SecurityProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#1A237E] to-[#151C66] text-[#F1F1F1] transition-all duration-300">
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
            <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
              <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left Side */}
                <div className="flex items-center gap-4">
                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden p-2 rounded-md hover:bg-white/10 text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {/* Welcome Message */}
                  <div className="hidden md:block">
                    <h1 className="text-2xl font-bold text-[#FFD600]">ATM Genesis</h1>
                    <p className="text-white/80">Welcome back, {currentUser?.name || 'Alex Johnson'}</p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                  {/* Presence Indicator */}
                  <PresenceIndicator roomId="dashboard" />
                  
                  {/* Notifications */}
                  <NotificationBell />

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMpesa(true)}
                      className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                      title="M-Pesa Services"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setShowBiometric(true)}
                      className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                      title="Biometric Auth"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => {
                        setQrMode('scan');
                        setShowQRCode(true);
                      }}
                      className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                      title="QR Payment"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </button>
                  </div>

                  {/* User Avatar */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF4081] to-[#FFD600] flex items-center justify-center text-white font-medium">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden md:block font-medium text-white">
                      {currentUser?.name?.split(' ')[0] || 'User'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

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

        {/* M-Pesa Integration Modal */}
        <AnimatePresence>
          {showMpesa && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <MpesaIntegration onClose={() => setShowMpesa(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Biometric Auth Modal */}
        <AnimatePresence>
          {showBiometric && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <BiometricAuth
                mode="setup"
                onSuccess={() => setShowBiometric(false)}
                onCancel={() => setShowBiometric(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Payment Modal */}
        <AnimatePresence>
          {showQRCode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <QRPayment
                mode={qrMode}
                onSuccess={(data) => {
                  console.log('QR Payment success:', data);
                  setShowQRCode(false);
                }}
                onCancel={() => setShowQRCode(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SecurityProvider>
  );
};

export default Dashboard;
