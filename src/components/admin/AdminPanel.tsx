
import React, { useState, useEffect } from 'react';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Activity, Shield, AlertTriangle, Database, TrendingUp, RefreshCw } from 'lucide-react';
import EnhancedUserManagement from './EnhancedUserManagement';
import SystemMetrics from './SystemMetrics';
import AnalyticsDashboard from './AnalyticsDashboard';
import SecurityDashboard from './SecurityDashboard';
import { adminService } from '../../services/adminService';

const AdminPanel: React.FC = () => {
  const { currentUser } = useSupabaseATM();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingLoans: 0,
    fraudAlerts: 0,
    systemHealth: 'GOOD' as 'GOOD' | 'WARNING' | 'CRITICAL'
  });

  // Check if user is admin
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. Administrator privileges required to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const fetchAdminData = async () => {
    setRefreshing(true);
    try {
      const [usersData, transactionsData, loansData, fraudAlertsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getTransactionHistory(),
        adminService.getAllLoans(),
        adminService.getFraudAlerts()
      ]);

      setUsers(usersData);
      setTransactions(transactionsData);
      setLoans(loansData);
      setFraudAlerts(fraudAlertsData);

      // Calculate stats
      const activeUsers = usersData.filter(user => !user.is_locked).length;
      const lockedUsers = usersData.filter(user => user.is_locked).length;
      const totalVolume = transactionsData.reduce((sum, t) => sum + Number(t.amount), 0);
      const pendingLoans = loansData.filter(loan => loan.status === 'PENDING').length;
      const activeFraudAlerts = fraudAlertsData.filter(alert => !alert.resolved).length;

      setStats({
        totalUsers: usersData.length,
        activeUsers,
        lockedUsers,
        totalTransactions: transactionsData.length,
        totalVolume,
        pendingLoans,
        fraudAlerts: activeFraudAlerts,
        systemHealth: activeFraudAlerts > 5 ? 'CRITICAL' : activeFraudAlerts > 2 ? 'WARNING' : 'GOOD'
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const refreshData = () => {
    fetchAdminData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'GOOD': return 'bg-green-500';
      case 'WARNING': return 'bg-yellow-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
            System Administration
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete system management and monitoring dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getSystemHealthColor(stats.systemHealth)}`}></div>
            <span className="text-sm font-medium">
              System: {stats.systemHealth}
            </span>
          </div>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Badge variant="destructive" className="text-sm px-3 py-1">
            ADMIN ACCESS
          </Badge>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">{stats.activeUsers} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-xl font-bold">{stats.totalTransactions}</p>
                <p className="text-xs text-muted-foreground truncate">
                  KES {(stats.totalVolume / 1000000).toFixed(1)}M volume
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Alerts</p>
                <p className="text-xl font-bold">{stats.fraudAlerts}</p>
                <p className="text-xs text-yellow-600">{stats.lockedUsers} locked users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Pending Loans</p>
                <p className="text-xl font-bold">{stats.pendingLoans}</p>
                <p className="text-xs text-green-600">Need approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs - Mobile Responsive */}
      <Tabs defaultValue="users" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 min-w-[400px]">
            <TabsTrigger value="users" className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2 text-xs sm:text-sm">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users">
          <EnhancedUserManagement 
            users={users} 
            onUserCreated={refreshData} 
            onUserDeleted={refreshData} 
          />
        </TabsContent>

        <TabsContent value="metrics">
          <SystemMetrics />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="security">
          <SecurityDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
