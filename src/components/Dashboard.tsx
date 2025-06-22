
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { supabaseATMService } from '../services/supabaseATMService';
import { translations } from '../utils/translations';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Receipt,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wallet
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [balance, setBalance] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentUser, language } = useSupabaseATM();
  const t = translations[language];

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load balance
        const balanceResult = await supabaseATMService.getBalance();
        if (balanceResult.success && balanceResult.balance !== undefined) {
          setBalance(balanceResult.balance);
        }

        // Load recent transactions
        const transactions = await supabaseATMService.getTransactionHistory();
        setRecentTransactions(transactions.slice(0, 5));

        // Load upcoming bills
        const bills = await supabaseATMService.getBills();
        setUpcomingBills(bills.slice(0, 3));

        // Load active loans
        const loans = await supabaseATMService.getUserLoans();
        setActiveLoans(loans.filter(loan => loan.status === 'ACTIVE').slice(0, 3));

      } catch (err) {
        console.error('Dashboard data loading error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'LOAN_DISBURSEMENT':
        return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'WITHDRAWAL':
      case 'TRANSFER':
      case 'BILL_PAYMENT':
      case 'LOAN_PAYMENT':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Here's your financial overview</p>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Available Balance</p>
                <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
                <p className="text-green-100 text-sm mt-2">Account: {currentUser?.accountNumber}</p>
              </div>
              <div className="text-right">
                <Wallet className="w-16 h-16 text-green-200 mb-2" />
                <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => onNavigate('withdraw')}
            className="h-24 flex-col space-y-2 bg-blue-600 hover:bg-blue-700"
          >
            <DollarSign className="w-8 h-8" />
            <span>Withdraw</span>
          </Button>
          <Button
            onClick={() => onNavigate('deposit')}
            className="h-24 flex-col space-y-2 bg-green-600 hover:bg-green-700"
          >
            <PiggyBank className="w-8 h-8" />
            <span>Deposit</span>
          </Button>
          <Button
            onClick={() => onNavigate('transfer')}
            className="h-24 flex-col space-y-2 bg-purple-600 hover:bg-purple-700"
          >
            <ArrowUpRight className="w-8 h-8" />
            <span>Transfer</span>
          </Button>
          <Button
            onClick={() => onNavigate('loans')}
            className="h-24 flex-col space-y-2 bg-orange-600 hover:bg-orange-700"
          >
            <CreditCard className="w-8 h-8" />
            <span>Loans</span>
          </Button>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => onNavigate('history')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent transactions</p>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'DEPOSIT' || transaction.type === 'LOAN_DISBURSEMENT'
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'DEPOSIT' || transaction.type === 'LOAN_DISBURSEMENT' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge variant={transaction.status === 'SUCCESS' ? 'default' : 'destructive'} className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Bills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  Upcoming Bills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBills.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming bills</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingBills.map((bill, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{bill.name}</p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(bill.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-red-600">
                          {formatCurrency(bill.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => onNavigate('bills')}
                >
                  Pay Bills
                </Button>
              </CardContent>
            </Card>

            {/* Active Loans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5" />
                  Active Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeLoans.length === 0 ? (
                  <p className="text-gray-500 text-sm">No active loans</p>
                ) : (
                  <div className="space-y-3">
                    {activeLoans.map((loan, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">{loan.type} Loan</p>
                          <Badge variant="secondary">{loan.status}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>Remaining: {formatCurrency(loan.remainingBalance)}</p>
                          <p>Monthly: {formatCurrency(loan.monthlyPayment)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => onNavigate('loans')}
                >
                  Manage Loans
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
