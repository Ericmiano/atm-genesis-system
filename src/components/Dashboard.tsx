
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { supabaseATMService } from '../services/supabaseATMService';
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
  TrendingUp,
  Wallet,
  Clock
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser, logout, language } = useSupabaseATM();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<number>(0);
  const t = translations[language];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [balanceResult, transactions, loans] = await Promise.all([
        supabaseATMService.getBalance(),
        supabaseATMService.getTransactionHistory(),
        supabaseATMService.getUserLoans()
      ]);

      if (balanceResult.success && balanceResult.balance !== undefined) {
        setBalance(balanceResult.balance);
      }

      setRecentTransactions(transactions.slice(0, 3));
      setActiveLoans(loans.filter(loan => loan.status === 'ACTIVE').length);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <Card className="mb-6 bg-white/95 backdrop-blur border-0 shadow-xl animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">
              {t.welcome}, {currentUser?.name}
            </CardTitle>
            <p className="text-gray-600">{t.selectTransaction}</p>
          </CardHeader>
        </Card>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-green-600">KES {balance.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Loans</p>
                  <p className="text-2xl font-bold text-blue-600">{activeLoans}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent Transactions</p>
                  <p className="text-2xl font-bold text-orange-600">{recentTransactions.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* ATM Card Details */}
          <div className="lg:col-span-1">
            <ATMCardDetails />
            
            {/* Recent Transactions */}
            <Card className="mt-4 bg-white/95 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`font-bold ${
                          transaction.type === 'DEPOSIT' || transaction.type === 'LOAN_DISBURSEMENT' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'DEPOSIT' || transaction.type === 'LOAN_DISBURSEMENT' ? '+' : '-'}
                          KES {Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent transactions</p>
                )}
              </CardContent>
            </Card>
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

        {/* Footer */}
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

export default Dashboard;
