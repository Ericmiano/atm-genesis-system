import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { supabaseATMService } from '../services/supabaseATMService';
import { User, Transaction, AuditLog, FraudAlert, Loan, AdminAction } from '../types/atm';
import UserManagement from './UserManagement';
import AdminHeader from './admin/AdminHeader';
import AdminTabs from './admin/AdminTabs';
import TransactionsList from './admin/TransactionsList';
import AuditLogsList from './admin/AuditLogsList';
import FraudAlertsList from './admin/FraudAlertsList';
import { 
  Users, 
  Activity, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  DollarSign,
  Clock,
  RefreshCw,
  BarChart3,
  Settings,
  Eye
} from 'lucide-react';

interface AdminScreenProps {
  onBack: () => void;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalVolume: number;
  pendingLoans: number;
  fraudAlerts: number;
  systemHealth: 'GOOD' | 'WARNING' | 'CRITICAL';
}

const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingLoans: 0,
    fraudAlerts: 0,
    systemHealth: 'GOOD'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState('en');

  const fetchAdminData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [usersData, transactionsData, loansData] = await Promise.all([
        supabaseATMService.getAllUsers(),
        supabaseATMService.getTransactionHistory(),
        supabaseATMService.getAllLoans?.() || Promise.resolve([])
      ]);
      
      setUsers(usersData);
      setTransactions(transactionsData);
      setLoans(loansData);
      
      // Calculate stats
      const activeUsers = usersData.filter(user => !user.isLocked).length;
      const totalVolume = transactionsData.reduce((sum, t) => sum + t.amount, 0);
      const pendingLoans = loansData.filter(loan => loan.status === 'PENDING').length;
      const fraudAlerts = await fetchFraudAlerts();
      
      setStats({
        totalUsers: usersData.length,
        activeUsers,
        totalTransactions: transactionsData.length,
        totalVolume,
        pendingLoans,
        fraudAlerts: fraudAlerts.length,
        systemHealth: fraudAlerts.length > 5 ? 'CRITICAL' : fraudAlerts.length > 2 ? 'WARNING' : 'GOOD'
      });

      // Fetch audit logs and admin actions
      await fetchAuditData();
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchAuditData = async () => {
    try {
      // This would be implemented in the service layer
      const auditData = await supabaseATMService.getAuditLogs?.() || [];
      const adminActionsData = await supabaseATMService.getAdminActions?.() || [];
      
      setAuditLogs(auditData);
      setAdminActions(adminActionsData);
    } catch (error) {
      console.error('Error fetching audit data:', error);
    }
  };

  const fetchFraudAlerts = async (): Promise<FraudAlert[]> => {
    try {
      // This would be implemented in the service layer
      return await supabaseATMService.getFraudAlerts?.() || [];
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchAdminData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchFraudAlerts().then(alerts => {
        setFraudAlerts(alerts);
        setStats(prev => ({
          ...prev,
          fraudAlerts: alerts.length,
          systemHealth: alerts.length > 5 ? 'CRITICAL' : alerts.length > 2 ? 'WARNING' : 'GOOD'
        }));
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [fetchAdminData]);

  const handleUserCreated = () => {
    fetchAdminData();
  };

  const handleUserDeleted = () => {
    fetchAdminData();
  };

  const handleResolveFraudAlert = async (alertId: string) => {
    try {
      await supabaseATMService.resolveFraudAlert?.(alertId);
      await fetchAdminData();
    } catch (error) {
      console.error('Error resolving fraud alert:', error);
    }
  };

  const handleApproveLoan = async (loanId: string) => {
    try {
      await supabaseATMService.approveLoan?.(loanId);
      await fetchAdminData();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleRejectLoan = async (loanId: string, reason: string) => {
    try {
      await supabaseATMService.rejectLoan?.(loanId, reason);
      await fetchAdminData();
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'GOOD': return 'bg-green-500';
      case 'WARNING': return 'bg-yellow-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 p-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl animate-scale-in">
          <AdminHeader onBack={onBack} language={language} />
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getSystemHealthColor(stats.systemHealth)}`}></div>
                <span className="text-sm font-medium">
                  System Health: {stats.systemHealth}
                </span>
              </div>
              <Button
                onClick={fetchAdminData}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <AdminTabs language={language} />

              <TabsContent value="dashboard" className="space-y-6">
                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.activeUsers} active
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                      <p className="text-xs text-muted-foreground">
                        KES {stats.totalVolume.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Loans</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pendingLoans}</div>
                      <p className="text-xs text-muted-foreground">
                        Require approval
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.fraudAlerts}</div>
                      <p className="text-xs text-muted-foreground">
                        Need attention
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Recent Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TransactionsList transactions={transactions.slice(0, 5)} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Recent Audit Logs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AuditLogsList auditLogs={auditLogs.slice(0, 5)} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <UserManagement 
                  users={users} 
                  onUserCreated={handleUserCreated}
                  onUserDeleted={handleUserDeleted}
                />
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Transaction History</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      Total: {transactions.length}
                    </Badge>
                    <Badge variant="outline">
                      Volume: KES {stats.totalVolume.toLocaleString()}
                    </Badge>
                  </div>
                </div>
                <TransactionsList transactions={transactions} />
              </TabsContent>

              <TabsContent value="loans" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Loan Management</h3>
                  <Badge variant="outline">
                    Pending: {stats.pendingLoans}
                  </Badge>
                </div>
                <LoanManagement 
                  loans={loans}
                  onApprove={handleApproveLoan}
                  onReject={handleRejectLoan}
                />
              </TabsContent>

              <TabsContent value="audit" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Audit Logs</h3>
                  <Badge variant="outline">
                    Total: {auditLogs.length}
                  </Badge>
                </div>
                <AuditLogsList auditLogs={auditLogs} />
              </TabsContent>

              <TabsContent value="fraud" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Fraud Alerts</h3>
                  <Badge variant={stats.systemHealth === 'CRITICAL' ? 'destructive' : 'outline'}>
                    {fraudAlerts.length} Active
                  </Badge>
                </div>
                <FraudAlertsList 
                  fraudAlerts={fraudAlerts}
                  onResolve={handleResolveFraudAlert}
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <SecuritySettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Placeholder components that will be implemented
const LoanManagement: React.FC<{
  loans: Loan[];
  onApprove: (loanId: string) => void;
  onReject: (loanId: string, reason: string) => void;
}> = ({ loans, onApprove, onReject }) => {
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {loans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No loans found</p>
          </CardContent>
        </Card>
      ) : (
        loans.map((loan) => (
          <Card key={loan.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge>{loan.type}</Badge>
                    <span className="font-medium">KES {loan.principal.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{loan.purpose}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(loan.applicationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {loan.status === 'PENDING' && (
                    <>
                      <Button size="sm" onClick={() => onApprove(loan.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onReject(loan.id, 'Rejected by admin')}>
                        Reject
                      </Button>
                    </>
                  )}
                  <Badge variant={loan.status === 'PENDING' ? 'secondary' : 'default'}>
                    {loan.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    maxFailedAttempts: 3,
    lockoutDuration: 30,
    passwordExpiryDays: 90,
    sessionTimeout: 15,
    requireMFA: false,
    enableFraudDetection: true,
    enableAuditLogging: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      // This would save to the database
      await supabaseATMService.updateSecuritySettings?.(settings);
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="maxFailedAttempts" className="text-sm font-medium">Max Failed Login Attempts</label>
              <input
                id="maxFailedAttempts"
                type="number"
                value={settings.maxFailedAttempts}
                onChange={(e) => setSettings(prev => ({ ...prev, maxFailedAttempts: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-md"
                min="1"
                max="10"
                title="Maximum number of failed login attempts before account lockout"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lockoutDuration" className="text-sm font-medium">Lockout Duration (minutes)</label>
              <input
                id="lockoutDuration"
                type="number"
                value={settings.lockoutDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-md"
                min="5"
                max="1440"
                title="Duration of account lockout after failed attempts"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="passwordExpiryDays" className="text-sm font-medium">Password Expiry (days)</label>
              <input
                id="passwordExpiryDays"
                type="number"
                value={settings.passwordExpiryDays}
                onChange={(e) => setSettings(prev => ({ ...prev, passwordExpiryDays: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-md"
                min="30"
                max="365"
                title="Number of days before password expires"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="sessionTimeout" className="text-sm font-medium">Session Timeout (minutes)</label>
              <input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-md"
                min="5"
                max="120"
                title="Session timeout duration in minutes"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="requireMFA" className="text-sm font-medium">Require Multi-Factor Authentication</label>
                <p className="text-xs text-gray-500">Enable 2FA for all users</p>
              </div>
              <input
                id="requireMFA"
                type="checkbox"
                checked={settings.requireMFA}
                onChange={(e) => setSettings(prev => ({ ...prev, requireMFA: e.target.checked }))}
                className="w-4 h-4"
                title="Enable multi-factor authentication for all users"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="enableFraudDetection" className="text-sm font-medium">Enable Fraud Detection</label>
                <p className="text-xs text-gray-500">Automatically detect suspicious activities</p>
              </div>
              <input
                id="enableFraudDetection"
                type="checkbox"
                checked={settings.enableFraudDetection}
                onChange={(e) => setSettings(prev => ({ ...prev, enableFraudDetection: e.target.checked }))}
                className="w-4 h-4"
                title="Enable automatic fraud detection system"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="enableAuditLogging" className="text-sm font-medium">Enable Audit Logging</label>
                <p className="text-xs text-gray-500">Log all system activities</p>
              </div>
              <input
                id="enableAuditLogging"
                type="checkbox"
                checked={settings.enableAuditLogging}
                onChange={(e) => setSettings(prev => ({ ...prev, enableAuditLogging: e.target.checked }))}
                className="w-4 h-4"
                title="Enable comprehensive audit logging"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Security Settings'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-green-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-600">Active Threats</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">24/7</div>
              <div className="text-sm text-yellow-600">Monitoring</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminScreen;
