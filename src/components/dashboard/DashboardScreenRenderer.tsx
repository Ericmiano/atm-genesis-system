
import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types/atm';
import OverviewScreen from './OverviewScreen';
import TransactionsScreen from './TransactionsScreen';
import LoansScreen from './LoansScreen';
import BillsScreen from './BillsScreen';
import SettingsScreen from './SettingsScreen';
import AnalyticsDashboard from './AnalyticsDashboard';
import SystemMetricsScreen from './SystemMetricsScreen';
import AdvancedSecurityDashboard from './AdvancedSecurityDashboard';
import AccessibilitySettings from '../accessibility/AccessibilitySettings';
import SecuritySettings from '../accessibility/SecuritySettings';

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
  const screenVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const renderScreen = () => {
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
            <TransactionsScreen transactions={mockTransactions} onTransactionSuccess={onTransactionSuccess} />
          </motion.div>
        );
      case 'loans':
        return (
          <motion.div key="loans" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <LoansScreen loans={mockLoans} onApplyNew={onApplyNewLoan} />
          </motion.div>
        );
      case 'bills':
        return (
          <motion.div key="bills" variants={screenVariants} initial="hidden" animate="visible" exit="exit">
            <BillsScreen bills={mockBills} onAddBill={onAddBill} />
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
            <SettingsScreen currentUser={currentUser} onSaveSettings={onSaveSettings} />
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

  return renderScreen();
};

export default DashboardScreenRenderer;
