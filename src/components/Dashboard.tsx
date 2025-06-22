
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSecurity } from '../contexts/SecurityContext';
import MainMenu from './MainMenu';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useSupabaseATM();
  const { isDarkMode } = useTheme();
  const { isSessionValid, fraudAlert } = useSecurity();

  // Mock data for demo - in real app, this would come from API
  const dashboardStats = {
    totalTransactions: 156,
    monthlySpending: 45230,
    accountAge: 3.2,
    securityScore: isSessionValid ? 95 : 60
  };

  return (
    <div className="min-h-screen">
      {/* Stats Overview */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-xl">
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

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Security Score
                </CardTitle>
                <Shield className={`h-4 w-4 ${isSessionValid ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats.securityScore}%
                </div>
                <p className={`text-xs mt-1 ${isSessionValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isSessionValid ? (
                    <>
                      <CheckCircle className="inline w-3 h-3 mr-1" />
                      All systems secure
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="inline w-3 h-3 mr-1" />
                      Security check needed
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Transactions
                </CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats.totalTransactions}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  This month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Account Age
                </CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats.accountAge} yrs
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  <CheckCircle className="inline w-3 h-3 mr-1" />
                  Verified member
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <MainMenu onNavigate={onNavigate} />
    </div>
  );
};

export default Dashboard;
