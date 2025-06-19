
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
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
  Banknote
} from 'lucide-react';

interface MainMenuProps {
  onNavigate: (screen: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  const { currentUser, logout, language } = useSupabaseATM();
  const t = translations[language];

  const menuItems = [
    { id: 'withdrawal', label: t.cashWithdrawal, icon: CreditCard, color: 'bg-red-500' },
    { id: 'deposit', label: t.cashDeposit, icon: PiggyBank, color: 'bg-green-500' },
    { id: 'balance', label: t.balanceInquiry, icon: Eye, color: 'bg-blue-500' },
    { id: 'transfer', label: t.fundsTransfer, icon: ArrowRight, color: 'bg-purple-500' },
    { id: 'loans', label: t.loans, icon: Banknote, color: 'bg-emerald-500' },
    { id: 'history', label: t.transactionHistory, icon: FileText, color: 'bg-orange-500' },
    { id: 'bills', label: t.billPayment, icon: FileText, color: 'bg-teal-500' },
    { id: 'settings', label: t.settings, icon: Settings, color: 'bg-gray-500' },
  ];

  if (currentUser?.role === 'ADMIN') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: User, color: 'bg-indigo-500' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6 bg-white/95 backdrop-blur border-0 shadow-xl animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">
              {t.welcome}, {currentUser?.name}
            </CardTitle>
            <p className="text-gray-600">{t.selectTransaction}</p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* ATM Card Details */}
          <div className="lg:col-span-1">
            <ATMCardDetails />
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="h-24 bg-white hover:bg-gray-50 text-gray-800 border-0 shadow-lg group animate-fade-in transition-all duration-200 hover:scale-105"
                    variant="outline"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {t.accountNumber}: {currentUser?.accountNumber}
              </div>
              <Button
                onClick={logout}
                variant="destructive"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
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
