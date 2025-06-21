import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { translations } from '../utils/translations';
import { handleQuickTransfer } from '../utils/transferUtils';
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Bell,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Shield,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Loader2
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser, logout, language, refreshUser } = useSupabaseATM();
  const t = translations[language];
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const [transactions] = useState([
    {
      id: 1,
      title: 'ATM Withdrawal',
      amount: -5000,
      date: '2024-01-15',
      category: 'Cash',
      icon: CreditCard,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 2,
      title: 'Salary Deposit',
      amount: 45000,
      date: '2024-01-10',
      category: 'Income',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600'
    },
    {
      id: 3,
      title: 'Grocery Shopping',
      amount: -2500,
      date: '2024-01-08',
      category: 'Shopping',
      icon: ShoppingBag,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 4,
      title: 'Restaurant',
      amount: -1800,
      date: '2024-01-05',
      category: 'Food',
      icon: Utensils,
      color: 'bg-orange-50 text-orange-600'
    }
  ]);

  // Mock data for new widgets
  const [upcomingBills] = useState([
    { id: 1, name: 'Electricity Bill', amount: 2500, dueDate: '2024-01-20', status: 'pending' },
    { id: 2, name: 'Water Bill', amount: 800, dueDate: '2024-01-25', status: 'pending' },
    { id: 3, name: 'Internet Bill', amount: 1500, dueDate: '2024-01-30', status: 'pending' }
  ]);

  const [notifications] = useState([
    { id: 1, title: 'Payment Successful', message: 'Your transfer of KES 5,000 was completed', type: 'success', time: '2 min ago' },
    { id: 2, title: 'Bill Due Soon', message: 'Electricity bill due in 5 days', type: 'warning', time: '1 hour ago' },
    { id: 3, title: 'Security Alert', message: 'New login detected from Nairobi', type: 'info', time: '3 hours ago' }
  ]);

  const [spendingCategories] = useState([
    { category: 'Food & Dining', amount: 8500, percentage: 35, color: 'bg-orange-500' },
    { category: 'Transportation', amount: 6000, percentage: 25, color: 'bg-blue-500' },
    { category: 'Shopping', amount: 4500, percentage: 18, color: 'bg-purple-500' },
    { category: 'Bills', amount: 3500, percentage: 14, color: 'bg-green-500' },
    { category: 'Entertainment', amount: 2000, percentage: 8, color: 'bg-pink-500' }
  ]);

  const quickActions = [
    { id: 'withdrawal', label: t.cashWithdrawal, icon: CreditCard, color: 'bg-red-500' },
    { id: 'deposit', label: t.cashDeposit, icon: PiggyBank, color: 'bg-green-500' },
    { id: 'transfer', label: t.fundsTransfer, icon: ArrowRight, color: 'bg-purple-500' },
    { id: 'balance', label: t.balanceInquiry, icon: Eye, color: 'bg-blue-500' },
  ];

  const menuItems = [
    { id: 'loans', label: t.loans, icon: Banknote, color: 'bg-emerald-500' },
    { id: 'history', label: t.transactionHistory, icon: FileText, color: 'bg-orange-500' },
    { id: 'bills', label: t.billPayment, icon: FileText, color: 'bg-teal-500' },
    { id: 'settings', label: t.settings, icon: Settings, color: 'bg-gray-500' },
  ];

  if (currentUser?.role === 'ADMIN') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: User, color: 'bg-indigo-500' });
  }

  // Quick Transfer state
  const [quickRecipient, setQuickRecipient] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const [quickSuccess, setQuickSuccess] = useState(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        // Initialize dark mode
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
        if (savedDarkMode) {
          document.documentElement.classList.add('dark');
        }
        
        // Refresh user data
        if (currentUser) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Dashboard initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [currentUser, refreshUser]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleQuickTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(quickAmount);
    if (!quickRecipient.trim() || isNaN(amountNum) || amountNum <= 0) {
      setQuickMessage('Please enter a valid recipient and amount');
      setQuickSuccess(false);
      return;
    }
    await handleQuickTransfer(
      quickRecipient,
      amountNum,
      setQuickMessage,
      setQuickSuccess,
      setQuickLoading,
      refreshUser
    );
    if (quickSuccess) {
      setQuickAmount('');
      setQuickRecipient('');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Bell className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state - no user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">Unable to load user data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300`}>
      {/* Wave Background */}
      <div className="wave absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-600/20 to-transparent dark:from-indigo-600/20"></div>
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center animate-slide-in">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">ATM Genesis</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back, {currentUser.name || 'User'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="sm"
              className="hidden md:flex"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="outline"
              size="sm"
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>

            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="hidden md:flex"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-slide-in">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-xl animate-scale-in">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm">Available Balance</p>
                <h2 className="text-3xl font-bold mt-1">
                  KES {(currentUser.balance || 0).toLocaleString()}
                </h2>
                <p className="text-blue-100 text-sm mt-2">
                  Account: {currentUser.accountNumber || 'N/A'}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className={`h-20 flex flex-col items-center justify-center gap-2 ${action.color} hover:scale-105 transition-all duration-200 text-white font-semibold`}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Transfer Widget */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                  <ArrowRight className="w-5 h-5" />
                  Quick Transfer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuickTransferSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipient
                      </label>
                      <input
                        type="text"
                        value={quickRecipient}
                        onChange={(e) => setQuickRecipient(e.target.value)}
                        placeholder="Enter recipient name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={quickLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={quickLoading}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={quickLoading || !quickRecipient || !quickAmount}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {quickLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Send Money'
                    )}
                  </Button>
                  {quickMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      quickSuccess 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {quickMessage}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-800 dark:text-white">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Transactions
                  </span>
                  <Button
                    onClick={() => onNavigate('history')}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transaction-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.color}`}>
                          <transaction.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{transaction.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}KES {Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Menu Items */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg animate-scale-in">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color} mr-3`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      {item.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Credit Score Widget */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                  <Target className="w-5 h-5" />
                  Credit Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="75, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">750</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Excellent</p>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Bills */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                  <Calendar className="w-5 h-5" />
                  Upcoming Bills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{bill.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Due: {bill.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 dark:text-white">
                          KES {bill.amount.toLocaleString()}
                        </p>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          {bill.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white">{notification.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 