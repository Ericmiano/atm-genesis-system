import { supabase } from '@/integrations/supabase/client';

export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalVolume: number;
  averageTransactionAmount: number;
  systemUptime: number;
  activeLoans: number;
  totalLoanAmount: number;
  pendingBills: number;
  totalBillAmount: number;
  fraudAlerts: number;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  lastBackup: string;
  databaseSize: number;
  apiResponseTime: number;
  errorRate: number;
  securityEvents: number;
}

export interface UserMetrics {
  newUsers: number;
  activeUsers: number;
  lockedUsers: number;
  usersByRole: { [key: string]: number };
  topUsers: Array<{
    id: string;
    name: string;
    balance: number;
    transactionCount: number;
  }>;
}

export interface TransactionMetrics {
  totalTransactions: number;
  totalVolume: number;
  averageAmount: number;
  transactionsByType: { [key: string]: number };
  transactionsByStatus: { [key: string]: number };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    timestamp: string;
  }>;
}

export interface SecurityMetrics {
  failedLoginAttempts: number;
  lockedAccounts: number;
  fraudAlerts: number;
  securityEvents: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    description: string;
  }>;
}

export class SystemMetricsService {
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      // Get basic counts
      const [
        { count: totalUsers },
        { count: totalTransactions },
        { count: activeLoans },
        { count: pendingBills },
        { count: fraudAlerts }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('fraud_alerts').select('*', { count: 'exact', head: true }).eq('status', 'open')
      ]);

      // Get transaction volume
      const { data: transactionData } = await supabase
        .from('transactions')
        .select('amount, status')
        .eq('status', 'completed');

      const totalVolume = transactionData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const averageTransactionAmount = transactionData?.length ? totalVolume / transactionData.length : 0;

      // Get loan amounts
      const { data: loanData } = await supabase
        .from('loans')
        .select('amount')
        .eq('status', 'active');

      const totalLoanAmount = loanData?.reduce((sum, l) => sum + (l.amount || 0), 0) || 0;

      // Get bill amounts
      const { data: billData } = await supabase
        .from('bills')
        .select('amount')
        .eq('status', 'pending');

      const totalBillAmount = billData?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      // Calculate system health
      const systemHealth = this.calculateSystemHealth({
        errorRate: 0.02, // Mock error rate
        uptime: 99.8, // Mock uptime
        responseTime: 150 // Mock response time in ms
      });

      return {
        totalUsers: totalUsers || 0,
        activeUsers: Math.floor((totalUsers || 0) * 0.75), // Mock active users
        totalTransactions: totalTransactions || 0,
        totalVolume,
        averageTransactionAmount,
        systemUptime: 99.8, // Mock uptime
        activeLoans: activeLoans || 0,
        totalLoanAmount,
        pendingBills: pendingBills || 0,
        totalBillAmount,
        fraudAlerts: fraudAlerts || 0,
        systemHealth,
        lastBackup: new Date().toISOString(),
        databaseSize: 2.5, // Mock size in GB
        apiResponseTime: 150, // Mock response time in ms
        errorRate: 0.02, // Mock error rate
        securityEvents: 5 // Mock security events
      };
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  async getUserMetrics(): Promise<UserMetrics> {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, name, balance, role, created_at, is_locked')
        .order('balance', { ascending: false })
        .limit(10);

      const { data: recentUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: lockedUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_locked', true);

      const { data: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Group users by role
      const usersByRole = users?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }) || {};

      // Get transaction counts for top users
      const topUsers = await Promise.all(
        (users || []).slice(0, 5).map(async (user) => {
          const { count: transactionCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return {
            id: user.id,
            name: user.name,
            balance: user.balance || 0,
            transactionCount: transactionCount || 0
          };
        })
      );

      return {
        newUsers: recentUsers || 0,
        activeUsers: activeUsers || 0,
        lockedUsers: lockedUsers || 0,
        usersByRole,
        topUsers
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      return {
        newUsers: 0,
        activeUsers: 0,
        lockedUsers: 0,
        usersByRole: {},
        topUsers: []
      };
    }
  }

  async getTransactionMetrics(): Promise<TransactionMetrics> {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const totalTransactions = transactions?.length || 0;
      const totalVolume = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const averageAmount = totalTransactions ? totalVolume / totalTransactions : 0;

      // Group by type
      const transactionsByType = transactions?.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }) || {};

      // Group by status
      const transactionsByStatus = transactions?.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }) || {};

      const recentTransactions = (transactions || []).slice(0, 10).map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        timestamp: t.created_at
      }));

      return {
        totalTransactions,
        totalVolume,
        averageAmount,
        transactionsByType,
        transactionsByStatus,
        recentTransactions
      };
    } catch (error) {
      console.error('Error fetching transaction metrics:', error);
      return {
        totalTransactions: 0,
        totalVolume: 0,
        averageAmount: 0,
        transactionsByType: {},
        transactionsByStatus: {},
        recentTransactions: []
      };
    }
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const { data: failedLogins } = await supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'FAILED_LOGIN')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: lockedAccounts } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_locked', true);

      const { data: fraudAlerts } = await supabase
        .from('fraud_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      const { data: securityEvents } = await supabase
        .from('security_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      return {
        failedLoginAttempts: failedLogins || 0,
        lockedAccounts: lockedAccounts || 0,
        fraudAlerts: fraudAlerts || 0,
        securityEvents: (securityEvents || []).map(event => ({
          id: event.id,
          type: event.event_type,
          severity: event.severity || 'medium',
          timestamp: event.timestamp,
          description: event.description
        }))
      };
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      return {
        failedLoginAttempts: 0,
        lockedAccounts: 0,
        fraudAlerts: 0,
        securityEvents: []
      };
    }
  }

  private calculateSystemHealth(metrics: { errorRate: number; uptime: number; responseTime: number }): 'excellent' | 'good' | 'fair' | 'poor' {
    const { errorRate, uptime, responseTime } = metrics;
    
    if (errorRate < 0.01 && uptime > 99.9 && responseTime < 100) return 'excellent';
    if (errorRate < 0.05 && uptime > 99.5 && responseTime < 200) return 'good';
    if (errorRate < 0.1 && uptime > 99.0 && responseTime < 500) return 'fair';
    return 'poor';
  }

  private getDefaultMetrics(): SystemMetrics {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalTransactions: 0,
      totalVolume: 0,
      averageTransactionAmount: 0,
      systemUptime: 0,
      activeLoans: 0,
      totalLoanAmount: 0,
      pendingBills: 0,
      totalBillAmount: 0,
      fraudAlerts: 0,
      systemHealth: 'poor',
      lastBackup: new Date().toISOString(),
      databaseSize: 0,
      apiResponseTime: 0,
      errorRate: 1,
      securityEvents: 0
    };
  }
}

export const systemMetricsService = new SystemMetricsService(); 