import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSecurity } from '../contexts/SecurityContext';
import { supabaseATMService } from '../services/supabaseATMService';
import { Transaction, Loan, Bill } from '../types/atm';
import ATMCardDetails from './ATMCardDetails';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
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
  RefreshCw,
  BarChart3,
  Calendar,
  Target,
  Zap,
  Star,
  Users,
  Lock,
  Unlock
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

interface DashboardStats {
  totalTransactions: number;
  monthlySpending: number;
  accountAge: number;
  securityScore: number;
  recentTransactions: Transaction[];
  activeLoans: Loan[];
  upcomingBills: Bill[];
  lastLogin: string;
  failedAttempts: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser, logout, language } = useSupabaseATM();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isSessionValid, fraudAlert } = useSecurity();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    monthlySpending: 0,
    accountAge: 0,
    securityScore: 95,
    recentTransactions: [],
    activeLoans: [],
    upcomingBills: [],
    lastLogin: '',
    failedAttempts: 0
  });

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      const [transactions, loans, bills] = await Promise.all([
        supabaseATMService.getTransactionHistory(),
        supabaseATMService.getUserLoans(),
        supabaseATMService.getBills()
      ]);

      const monthlySpending = transactions
        .filter(t => new Date(t.timestamp).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0);

      const accountAge = currentUser?.createdAt 
        ? (new Date().getTime() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
        : 0;

      setStats({
        totalTransactions: transactions.length,
        monthlySpending,
        accountAge: Math.round(accountAge * 10) / 10,
        securityScore: isSessionValid ? 95 : 60,
        recentTransactions: transactions.slice(0, 5),
        activeLoans: loans.filter(l => l.status === 'ACTIVE'),
        upcomingBills: bills.filter(b => new Date(b.dueDate) > new Date()).slice(0, 3),
        lastLogin: currentUser?.lastLogin || '',
        failedAttempts: currentUser?.failedAttempts || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'WITHDRAWAL': return <CreditCard className="w-4 h-4" />;
      case 'DEPOSIT': return <PiggyBank className="w-4 h-4" />;
      case 'TRANSFER': return <ArrowRight className="w-4 h-4" />;
      case 'BALANCE_INQUIRY': return <Eye className="w-4 h-4" />;
      case 'BILL_PAYMENT': return <FileText className="w-4 h-4" />;
      case 'LOAN_DISBURSEMENT': return <Banknote className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'WITHDRAWAL': return 'text-red-600';
      case 'DEPOSIT': return 'text-green-600';
      case 'TRANSFER': return 'text-blue-600';
      case 'BILL_PAYMENT': return 'text-orange-600';
      case 'LOAN_DISBURSEMENT': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <Card className="mb-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-2xl animate-scale-in">
          <CardHeader className="text-center relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
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
              Welcome back, {currentUser?.name}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Your financial dashboard</p>
          </CardHeader>
        </Card>

        {/* Security Alerts */}
        {fraudAlert?.isSuspicious && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 animate-fade-in">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Security Alert: {fraudAlert.reason}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
          {/* Left Sidebar - ATM Card & Quick Actions */}
          <div className="xl:col-span-1 space-y-6">
            <ATMCardDetails />
            
            {/* Quick Actions */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => onNavigate('withdrawal')}
                  className="w-full justify-start bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Withdraw Cash
                </Button>
                <Button 
                  onClick={() => onNavigate('deposit')}
                  className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <PiggyBank className="w-4 h-4 mr-2" />
                  Deposit Money
                </Button>
                <Button 
                  onClick={() => onNavigate('transfer')}
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Transfer Funds
                </Button>
                <Button 
                  onClick={() => onNavigate('balance')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Check Balance
                </Button>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Status</span>
                  <Badge variant={isSessionValid ? 'default' : 'destructive'}>
                    {isSessionValid ? 'Secure' : 'Unsecured'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failed Attempts</span>
                  <Badge variant={stats.failedAttempts > 0 ? 'destructive' : 'default'}>
                    {stats.failedAttempts}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Locked</span>
                  <Badge variant={currentUser?.isLocked ? 'destructive' : 'default'}>
                    {currentUser?.isLocked ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="loans" className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  Loans
                </TabsTrigger>
                <TabsTrigger value="bills" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Bills
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Account Balance
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        KES {currentUser?.balance.toLocaleString()}
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        <TrendingUp className="inline w-3 h-3 mr-1" />
                        Secure & Protected
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Monthly Spending
                      </CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        KES {stats.monthlySpending.toLocaleString()}
                      </div>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        This month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Total Transactions
                      </CardTitle>
                      <Activity className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalTransactions}
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        <TrendingUp className="inline w-3 h-3 mr-1" />
                        All time
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Account Age
                      </CardTitle>
                      <Clock className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.accountAge} yrs
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        <CheckCircle className="inline w-3 h-3 mr-1" />
                        Verified member
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-600 ${getTransactionColor(transaction.type)}`}>
                                {getTransactionIcon(transaction.type)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{transaction.description}</p>
                                <p className="text-xs text-gray-500">{formatDate(transaction.timestamp)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">KES {transaction.amount.toLocaleString()}</p>
                              <Badge variant={transaction.status === 'SUCCESS' ? 'default' : 'destructive'} className="text-xs">
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {stats.recentTransactions.length === 0 && (
                          <p className="text-center text-gray-500 py-4">No recent transactions</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Quick Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">Account Status</p>
                            <p className="text-xs text-gray-500">Active and secure</p>
                          </div>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-sm">Last Login</p>
                            <p className="text-xs text-gray-500">
                              {stats.lastLogin ? formatDate(stats.lastLogin) : 'Recently'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default">Secure</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="font-medium text-sm">Active Loans</p>
                            <p className="text-xs text-gray-500">{stats.activeLoans.length} active loans</p>
                          </div>
                        </div>
                        <Badge variant="default">{stats.activeLoans.length}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-6">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Transaction History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-600 ${getTransactionColor(transaction.type)}`}>
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                              <p className="text-xs text-gray-400">Type: {transaction.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">KES {transaction.amount.toLocaleString()}</p>
                            <Badge variant={transaction.status === 'SUCCESS' ? 'default' : 'destructive'}>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Button 
                        onClick={() => onNavigate('history')}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        View All Transactions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Loans Tab */}
              <TabsContent value="loans" className="space-y-6">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Banknote className="w-5 h-5" />
                      Active Loans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.activeLoans.map((loan) => (
                        <div key={loan.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Banknote className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium">{loan.type} Loan</p>
                                <p className="text-sm text-gray-500">{loan.purpose}</p>
                              </div>
                            </div>
                            <Badge variant="default">{loan.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Principal</p>
                              <p className="font-medium">KES {loan.principal.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Remaining</p>
                              <p className="font-medium">KES {loan.remainingBalance.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Monthly Payment</p>
                              <p className="font-medium">KES {loan.monthlyPayment.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Next Payment</p>
                              <p className="font-medium">
                                {loan.nextPaymentDate ? formatDate(loan.nextPaymentDate) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {stats.activeLoans.length === 0 && (
                        <div className="text-center py-8">
                          <Banknote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No active loans</p>
                          <Button 
                            onClick={() => onNavigate('loans')}
                            className="mt-4"
                            variant="outline"
                          >
                            Apply for a Loan
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bills Tab */}
              <TabsContent value="bills" className="space-y-6">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Upcoming Bills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.upcomingBills.map((bill) => (
                        <div key={bill.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-orange-600" />
                              <div>
                                <p className="font-medium">{bill.name}</p>
                                <p className="text-sm text-gray-500">{bill.type}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">Due Soon</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Amount</p>
                              <p className="font-medium">KES {bill.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Due Date</p>
                              <p className="font-medium">{formatDate(bill.dueDate)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {stats.upcomingBills.length === 0 && (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No upcoming bills</p>
                        </div>
                      )}
                      <Button 
                        onClick={() => onNavigate('bills')}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        View All Bills
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={() => onNavigate('settings')}
                        className="justify-start h-auto p-4"
                        variant="outline"
                      >
                        <div className="text-left">
                          <p className="font-medium">Account Settings</p>
                          <p className="text-sm text-gray-500">Manage your account preferences</p>
                        </div>
                      </Button>
                      
                      {currentUser?.role === 'ADMIN' && (
                        <Button 
                          onClick={() => onNavigate('admin')}
                          className="justify-start h-auto p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                        >
                          <div className="text-left">
                            <p className="font-medium text-white">Admin Panel</p>
                            <p className="text-sm text-indigo-100">System administration</p>
                          </div>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-2xl animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span>Account: {currentUser?.accountNumber}</span>
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
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
