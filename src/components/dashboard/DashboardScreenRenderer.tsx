
import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types/atm';
import OverviewScreen from '../screens/OverviewScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import LoansScreen from '../screens/LoansScreen';
import BillsScreen from '../screens/BillsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminPanel from '../admin/AdminPanel';

interface DashboardScreenRendererProps {
  activeScreen: string;
  currentUser: User | null;
  mockStats: any;
  mockTransactions: any[];
  mockLoans: any[];
  mockBills: any[];
  onTransactionSuccess: () => void;
  onApplyNewLoan: () => void;
  onAddBill: () => void;
  onSaveSettings: (settings: any) => void;
  setActiveScreen: (screen: string) => void;
}

const DashboardScreenRenderer: React.FC<DashboardScreenRendererProps> = ({
  activeScreen,
  currentUser,
  mockStats,
  mockTransactions,
  mockLoans,
  mockBills,
  onTransactionSuccess,
  onApplyNewLoan,
  onAddBill,
  onSaveSettings,
  setActiveScreen,
}) => {
  const renderScreen = () => {
    switch (activeScreen) {
      case 'overview':
        return (
          <OverviewScreen
            user={currentUser}
            stats={mockStats}
            onQuickAction={(action) => console.log('Quick action:', action)}
          />
        );
      case 'transactions':
        return (
          <TransactionsScreen
            transactions={mockTransactions}
            onTransactionSuccess={onTransactionSuccess}
          />
        );
      case 'loans':
        return (
          <LoansScreen
            loans={mockLoans}
            onApplyNewLoan={onApplyNewLoan}
          />
        );
      case 'bills':
        return (
          <BillsScreen
            bills={mockBills}
            onAddBill={onAddBill}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            user={currentUser}
            onSaveSettings={onSaveSettings}
          />
        );
      case 'admin':
        return <AdminPanel />;
      default:
        return (
          <OverviewScreen
            user={currentUser}
            stats={mockStats}
            onQuickAction={(action) => console.log('Quick action:', action)}
          />
        );
    }
  };

  return (
    <motion.div
      key={activeScreen}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {renderScreen()}
    </motion.div>
  );
};

export default DashboardScreenRenderer;
