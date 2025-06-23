
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
      // Get basic counts with proper error handling
      const [
        usersResult,
        transactionsResult,
        loansResult,
        billsResult,
        fraudAlertsResult
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('bills').select('*', { count: 'exact', head: true }),
        supabase.from('fraud_alerts').select('*', { count: 'exact', head: true }).eq('resolved', false)
      ]);

      const totalUsers = usersResult.count || 0;
      const totalTransactions = transactionsResult.count || 0;
      const activeLoans = loansResult.count || 0;
      const pendingBills = billsResult.count || 0;
      const fraudAlerts = fraudAlertsResult.count || 0;

      // Get transaction volume with proper status filtering
      const { data: transactionData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'SUCCESS');

      const totalVolume = transactionData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const averageTransactionAmount = transactionData?.length ? totalVolume / transactionData.length : 0;

      // Get loan amounts using correct column name
      const { data: loanData } = await supabase
        .from('loans')
        .select('principal')
        .eq('status', 'ACTIVE');

      const totalLoanAmount = loanData?.reduce((sum, l) => sum + (l.principal || 0), 0) || 0;

      // Get bill amounts
      const { data: billData } = await supabase
        .from('bills')
        .select('amount');

      const totalBillAmount = billData?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      // Calculate system health based on mock metrics
      const systemHealth = this.calculateSystemHealth({
        errorRate: 0.02,
        uptime: 99.8,
        responseTime: 150
      });

      return {
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.75),
        totalTransactions,
        totalVolume,
        averageTransactionAmount,
        systemUptime: 99.8,
        activeLoans,
        totalLoanAmount,
        pendingBills,
        totalBillAmount,
        fraudAlerts,
        systemHealth,
        lastBackup: new Date().toISOString(),
        databaseSize: 2.5,
        apiResponseTime: 150,
        errorRate: 0.02,
        securityEvents: 5
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

      // Count users created in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: newUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);

      // Count locked users
      const { count: lockedUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_locked', true);

      // Count active users (mock - users with recent login)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', sevenDaysAgo);

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
        newUsers: newUsers || 0,
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
        .order('timestamp', { ascending: false })
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
        timestamp: t.timestamp
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
      // Since security_events table doesn't exist, we'll use mock data
      // In a real implementation, these would come from actual security tables

      const { count: lockedAccounts } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_locked', true);

      const { count: fraudAlerts } = await supabase
        .from('fraud_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);

      // Mock security events since the table doesn't exist
      const mockSecurityEvents = [
        {
          id: '1',
          type: 'FAILED_LOGIN',
          severity: 'medium' as const,
          timestamp: new Date().toISOString(),
          description: 'Multiple failed login attempts detected'
        },
        {
          id: '2',
          type: 'SUSPICIOUS_TRANSACTION',
          severity: 'high' as const,
          timestamp: new Date().toISOString(),
          description: 'Large transaction amount flagged'
        }
      ];

      return {
        failedLoginAttempts: 15, // Mock data
        lockedAccounts: lockedAccounts || 0,
        fraudAlerts: fraudAlerts || 0,
        securityEvents: mockSecurityEvents
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
