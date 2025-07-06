
import React, { useState, useEffect } from 'react';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { SecurityProvider } from '../contexts/SecurityContext';
import { realTimeService } from '../services/realTimeService';
import DashboardLayout from './dashboard/DashboardLayout';
import DashboardScreenRenderer from './dashboard/DashboardScreenRenderer';
import DashboardModals from './dashboard/DashboardModals';
import EnhancedLoadingSpinner from './enhanced/EnhancedLoadingSpinner';

const Dashboard: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showMpesa, setShowMpesa] = useState(false);
  const [qrMode, setQrMode] = useState<'generate' | 'scan'>('scan');
  const [dashboardReady, setDashboardReady] = useState(false);
  const { currentUser } = useSupabaseATM();

  // Mock data for components
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
    
    // Initialize dashboard
    const initializeDashboard = async () => {
      try {
        if (currentUser) {
          // Set up real-time subscriptions safely
          try {
            realTimeService.subscribeToTransactions(currentUser.id);
            realTimeService.subscribeToSecurityEvents(currentUser.id, (event) => {
              console.log('Security event:', event);
            });
            realTimeService.subscribeToFraudAlerts(currentUser.id, (alert) => {
              console.log('Fraud alert:', alert);
            });
          } catch (error) {
            console.error('Error setting up real-time subscriptions:', error);
          }
        }
        
        setDashboardReady(true);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setDashboardReady(true);
      }
    };

    initializeDashboard();
    
    return () => {
      console.log('Dashboard unmounted');
      try {
        realTimeService.unsubscribeAll();
      } catch (error) {
        console.error('Error cleaning up subscriptions:', error);
      }
    };
  }, [currentUser]);

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

  const handleShowQRCode = () => {
    setQrMode('scan');
    setShowQRCode(true);
  };

  // Show loading while dashboard initializes
  if (!dashboardReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-all duration-300">
        <EnhancedLoadingSpinner 
          size="xl" 
          variant="banking" 
          message="Loading dashboard..."
        />
      </div>
    );
  }

  return (
    <SecurityProvider>
      <DashboardLayout
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onShowMpesa={() => setShowMpesa(true)}
        onShowBiometric={() => setShowBiometric(true)}
        onShowQRCode={handleShowQRCode}
      >
        <DashboardScreenRenderer
          activeScreen={activeScreen}
          currentUser={currentUser}
          mockStats={mockStats}
          mockTransactions={mockTransactions}
          mockLoans={mockLoans}
          mockBills={mockBills}
          onTransactionSuccess={handleTransactionSuccess}
          onApplyNewLoan={handleApplyNewLoan}
          onAddBill={handleAddBill}
          onSaveSettings={handleSaveSettings}
          setActiveScreen={setActiveScreen}
        />
      </DashboardLayout>

      <DashboardModals
        showMpesa={showMpesa}
        setShowMpesa={setShowMpesa}
        showBiometric={showBiometric}
        setShowBiometric={setShowBiometric}
        showQRCode={showQRCode}
        setShowQRCode={setShowQRCode}
        qrMode={qrMode}
      />
    </SecurityProvider>
  );
};

export default Dashboard;
