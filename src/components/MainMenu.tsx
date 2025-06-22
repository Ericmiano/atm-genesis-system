
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSecurity } from '../contexts/SecurityContext';
import { translations } from '../utils/translations';
import ATMCardDetails from './ATMCardDetails';
import { 
  CreditCard, 
  PiggyBank, 
  Eye, 
  ArrowRight, 
  Settings, 
  FileText, 
  LogOut,
  User,
  Banknote,
  Moon,
  Sun,
  Shield,
  Activity
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MainMenuProps {
  onNavigate: (screen: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  const { currentUser, logout, language } = useSupabaseATM();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isSessionValid, fraudAlert } = useSecurity();
  const t = translations[language];

  const menuItems = [
    { id: 'withdrawal', label: t.cashWithdrawal, icon: CreditCard, color: 'bg-gradient-to-r from-red-500 to-red-600' },
    { id: 'deposit', label: t.cashDeposit, icon: PiggyBank, color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { id: 'balance', label: t.balanceInquiry, icon: Eye, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { id: 'transfer', label: t.fundsTransfer, icon: ArrowRight, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { id: 'loans', label: t.loans, icon: Banknote, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { id: 'history', label: t.transactionHistory, icon: FileText, color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { id: 'bills', label: t.billPayment, icon: FileText, color: 'bg-gradient-to-r from-teal-500 to-teal-600' },
    { id: 'settings', label: t.settings, icon: Settings, color: 'bg-gradient-to-r from-gray-500 to-gray-600' },
  ];

  if (currentUser?.role === 'ADMIN') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: User, color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-2xl animate-scale-in">
          <CardHeader className="text-center relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${isSessionValid ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {isSessionValid ? 'Secure' : 'Unsecured'}
                </span>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              {t.welcome}, {currentUser?.name}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-lg">{t.selectTransaction}</p>
          </CardHeader>
        </Card>

        {/* Security Alerts */}
        {fraudAlert?.isSuspicious && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 animate-fade-in">
            <Activity className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Security Alert: {fraudAlert.reason}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
          {/* ATM Card Details */}
          <div className="xl:col-span-1">
            <ATMCardDetails />
          </div>

          {/* Menu Items */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.id}
                    className="group cursor-pointer bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => onNavigate(item.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mx-auto mb-4 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.label}
                      </h3>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-2xl animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span>{t.accountNumber}: {currentUser?.accountNumber}</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Multi-Factor Authentication Enabled
                </span>
              </div>
              <Button
                onClick={logout}
                variant="destructive"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <LogOut className="w-4 h-4" />
                {t.logout}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainMenu;
