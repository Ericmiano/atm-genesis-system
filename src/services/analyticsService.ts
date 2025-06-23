
import { supabase } from '@/integrations/supabase/client';

export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  USER_ACTION = 'user_action',
  TRANSACTION = 'transaction',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  FEATURE_USAGE = 'feature_usage',
  CONVERSION = 'conversion',
  RETENTION = 'retention',
  ENGAGEMENT = 'engagement'
}

export interface AnalyticsEvent {
  id?: string;
  type: AnalyticsEventType;
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
}

export class AnalyticsService {
  static async trackEvent(type: AnalyticsEventType, name: string, properties: Record<string, any> = {}): Promise<void> {
    try {
      console.log('Tracking analytics event:', { type, name, properties });
      // For now, we'll just log events since analytics_events table doesn't exist
      // In production, this would store to a proper analytics table
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  static async getTransactionAnalytics(startDate: Date, endDate: Date, aggregation: string = 'daily'): Promise<any> {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) throw error;

      const analytics = {
        totalTransactions: transactions?.length || 0,
        totalAmount: transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
        successfulTransactions: transactions?.filter(t => t.status === 'SUCCESS').length || 0,
        failedTransactions: transactions?.filter(t => t.status === 'FAILED').length || 0,
        pendingTransactions: transactions?.filter(t => t.status === 'PENDING').length || 0,
        transactionsByType: this.groupTransactionsByType(transactions || []),
        dailyVolume: this.calculateDailyVolume(transactions || [])
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching transaction analytics:', error);
      return {
        totalTransactions: 0,
        totalAmount: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        transactionsByType: {},
        dailyVolume: []
      };
    }
  }

  static async getPerformanceMetrics(timeRange: string = '24h'): Promise<any> {
    try {
      // Mock performance data since we don't have analytics_events table
      return {
        responseTime: Math.random() * 500 + 100,
        throughput: Math.random() * 1000 + 500,
        errorRate: Math.random() * 5,
        uptime: 99.9,
        cpuUsage: Math.random() * 80 + 10,
        memoryUsage: Math.random() * 70 + 20,
        dbConnections: Math.floor(Math.random() * 50) + 10
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return {};
    }
  }

  static async getBusinessIntelligence(): Promise<any> {
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*');

      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select('*');

      if (usersError || transactionsError || loansError) {
        throw new Error('Error fetching business data');
      }

      return {
        totalUsers: users?.length || 0,
        activeUsers: users?.filter(u => u.last_login && new Date(u.last_login) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0,
        totalRevenue: transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
        averageTransactionValue: transactions?.length ? (transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.length) : 0,
        loanPortfolio: loans?.reduce((sum, l) => sum + (l.principal || 0), 0) || 0,
        activeLoanCount: loans?.filter(l => l.status === 'ACTIVE').length || 0
      };
    } catch (error) {
      console.error('Error fetching business intelligence:', error);
      return {};
    }
  }

  static async getFraudAnalytics(timeRange: string = '24h'): Promise<any> {
    try {
      const { data: fraudAlerts, error } = await supabase
        .from('fraud_alerts')
        .select('*');

      if (error) throw error;

      return {
        totalAlerts: fraudAlerts?.length || 0,
        resolvedAlerts: fraudAlerts?.filter(a => a.resolved).length || 0,
        pendingAlerts: fraudAlerts?.filter(a => !a.resolved).length || 0,
        alertsByType: this.groupFraudAlertsByType(fraudAlerts || []),
        alertsBySeverity: this.groupFraudAlertsBySeverity(fraudAlerts || [])
      };
    } catch (error) {
      console.error('Error fetching fraud analytics:', error);
      return {};
    }
  }

  static async getRealTimeAnalytics(): Promise<any> {
    try {
      // Mock real-time data
      return {
        activeUsers: Math.floor(Math.random() * 100) + 50,
        transactionsPerMinute: Math.floor(Math.random() * 20) + 5,
        systemLoad: Math.random() * 100,
        errorRate: Math.random() * 5,
        responseTime: Math.random() * 500 + 100
      };
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      return {};
    }
  }

  static async generateAnalyticsReport(reportType: 'daily' | 'weekly' | 'monthly', startDate: Date, endDate: Date): Promise<any> {
    try {
      const [transactionAnalytics, performanceMetrics, businessIntelligence, fraudAnalytics] = await Promise.all([
        this.getTransactionAnalytics(startDate, endDate),
        this.getPerformanceMetrics(),
        this.getBusinessIntelligence(),
        this.getFraudAnalytics()
      ]);

      return {
        reportType,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        summary: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} analytics report`,
        metrics: {
          transactions: transactionAnalytics,
          performance: performanceMetrics,
          business: businessIntelligence,
          fraud: fraudAnalytics
        },
        recommendations: [
          'Monitor transaction success rates for optimization opportunities',
          'Review high-value transactions for fraud prevention',
          'Analyze user engagement patterns for product improvements'
        ],
        charts: [
          {
            type: 'line',
            data: transactionAnalytics.dailyVolume
          },
          {
            type: 'pie',
            data: transactionAnalytics.transactionsByType
          }
        ]
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      return {
        summary: 'Error generating report',
        metrics: {},
        recommendations: [],
        charts: []
      };
    }
  }

  // Helper methods
  private static groupTransactionsByType(transactions: any[]): Record<string, number> {
    return transactions.reduce((acc, transaction) => {
      const type = transaction.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  private static calculateDailyVolume(transactions: any[]): any[] {
    const dailyData: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + (transaction.amount || 0);
    });

    return Object.entries(dailyData).map(([date, amount]) => ({ date, amount }));
  }

  private static groupFraudAlertsByType(alerts: any[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      const type = alert.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  private static groupFraudAlertsBySeverity(alerts: any[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      const severity = alert.severity || 'unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});
  }
}

export const analyticsService = new AnalyticsService();
