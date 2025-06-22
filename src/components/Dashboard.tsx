import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { supabaseATMService } from '../services/supabaseATMService';
import { AutomatedPaymentService } from '../services/automatedPaymentService';
import Sidebar from './dashboard/Sidebar';
import DashboardHeader from './dashboard/DashboardHeader';
import OverviewScreen from './dashboard/OverviewScreen';
import TransactionsScreen from './dashboard/TransactionsScreen';
import LoansScreen from './dashboard/LoansScreen';
import BillsScreen from './dashboard/BillsScreen';
import SettingsScreen from './dashboard/SettingsScreen';
import SystemMetricsScreen from './dashboard/SystemMetricsScreen';
import AnalyticsDashboard from './dashboard/AnalyticsDashboard';
import AnalyticsInsights from './dashboard/AnalyticsInsights';
import AnalyticsReports from './dashboard/AnalyticsReports';
import AdvancedSecurityDashboard from './dashboard/AdvancedSecurityDashboard';
import UserManagement from './UserManagement';
import MobileNavigation from './navigation/MobileNavigation';
import { useTransactions, useLoans, useBills, useAdminUsers } from '../hooks/useQueries';
import { Atom } from 'lucide-react';

const Dashboard: React.FC = () => {
  console.log('Dashboard component is rendering...');
  
  const { currentUser, logout } = useSupabaseATM();
  
  console.log('Current user:', currentUser);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use React Query hooks for data fetching
  const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError } = useTransactions(currentUser?.id);
  const { data: loans = [], isLoading: loansLoading, error: loansError } = useLoans(currentUser?.id);
  const { data: bills = [], isLoading: billsLoading, error: billsError } = useBills(currentUser?.id);
  const { data: users = [], isLoading: usersLoading, error: usersError } = useAdminUsers();

  console.log('Dashboard state initialized');

  // Process automated payments when dashboard loads
  useEffect(() => {
    console.log('Processing automated payments...');
    const processPayments = async () => {
      try {
        console.log('Processing automated payments...');
        // Real automated payment processing
        if (currentUser?.id) {
          await AutomatedPaymentService.processAutomatedPayments(currentUser.id);
        }
        console.log('Automated payments processed');
      } catch (error) {
        console.error('Error processing automated payments:', error);
        // Don't set error state for this as it's not critical
      }
    };

    if (currentUser) {
      processPayments();
    }
  }, [currentUser]);

  const overviewStats = {
    recentTransactions: transactions.slice(0, 4),
    totalTransactions: transactions.length
  };

  console.log('About to render content, activeTab:', activeTab);

  const renderContent = () => {
    try {
      console.log('Rendering content for tab:', activeTab);
      switch(activeTab) {
        case 'overview':
          return <OverviewScreen stats={overviewStats} currentUser={currentUser} />;
        case 'transactions':
          return <TransactionsScreen transactions={transactions} onTransactionSuccess={() => console.log('Transaction success')} />;
        case 'loans':
          return <LoansScreen loans={loans} onApplyNew={() => console.log('Navigate to apply loan form')} />;
        case 'bills':
          return <BillsScreen bills={bills} onAddBill={() => console.log('Navigate to add bill form')} />;
        case 'settings':
          return <SettingsScreen currentUser={currentUser} onSaveSettings={() => console.log('Save settings')} />;
        case 'analytics':
          return currentUser?.role === 'ADMIN' ? (
            <AnalyticsDashboard />
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
              <p className="text-gray-400">You don't have permission to access analytics.</p>
            </div>
          );
        case 'analytics-insights':
          return currentUser?.role === 'ADMIN' ? (
            <AnalyticsInsights />
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
              <p className="text-gray-400">You don't have permission to access analytics insights.</p>
            </div>
          );
        case 'analytics-reports':
          return currentUser?.role === 'ADMIN' ? (
            <AnalyticsReports />
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
              <p className="text-gray-400">You don't have permission to access analytics reports.</p>
            </div>
          );
        case 'security-dashboard':
          return currentUser?.role === 'ADMIN' ? (
            <AdvancedSecurityDashboard />
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
              <p className="text-gray-400">You don't have permission to access security dashboard.</p>
            </div>
          );
        case 'overdrafts':
          return <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Overdraft Management</h2>
            <p className="text-gray-400">Overdraft features coming soon...</p>
          </div>;
        case 'credit-score':
          return <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Credit Score Tracker</h2>
            <p className="text-gray-400">Credit score tracking features coming soon...</p>
          </div>;
        case 'admin':
          return currentUser?.role === 'ADMIN' ? (
            <UserManagement 
              users={users} 
              onUserCreated={() => console.log('User created')} 
              onUserDeleted={() => console.log('User deleted')} 
            />
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
              <p className="text-gray-400">You don't have permission to access the admin panel.</p>
            </div>
          );
        case 'system-metrics':
          return currentUser?.role === 'ADMIN' ? (
            <SystemMetricsScreen />
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
              <p className="text-gray-400">You don't have permission to access system metrics.</p>
            </div>
          );
        default:
          return <OverviewScreen stats={overviewStats} currentUser={currentUser} />;
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="p-8 text-center">
          <p className="text-red-400 mb-4">Error loading content</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary px-4 py-2 rounded-lg"
          >
            Reload Page
          </button>
        </div>
      );
    }
  };

  console.log('Dashboard render conditions - error:', error, 'loading:', loading, 'transactions.length:', transactions.length);

  if (error) {
    console.log('Rendering error state');
    return (
      <div className="bg-background min-h-screen flex items-center justify-center text-foreground">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary px-4 py-2 rounded-lg mr-2"
          >
            Retry
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-secondary px-4 py-2 rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={logout} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:block">
          <DashboardHeader currentUser={currentUser} onLogout={logout} />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-4 md:p-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={logout} 
      />
    </div>
  );
};

export default Dashboard;
