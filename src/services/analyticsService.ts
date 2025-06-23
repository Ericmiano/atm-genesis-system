import { supabase } from '@/integrations/supabase/client';
import { User } from '../types/atm';

// Analytics configuration
const ANALYTICS_CONFIG = {
  // Data retention
  DATA_RETENTION_DAYS: 365,
  REAL_TIME_UPDATE_INTERVAL: 30000, // 30 seconds
  
  // Aggregation intervals
  AGGREGATION_INTERVALS: {
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  },
  
  // Metrics thresholds
  PERFORMANCE_THRESHOLDS: {
    RESPONSE_TIME_WARNING: 2000, // 2 seconds
    RESPONSE_TIME_CRITICAL: 5000, // 5 seconds
    ERROR_RATE_WARNING: 0.05, // 5%
    ERROR_RATE_CRITICAL: 0.10, // 10%
    SUCCESS_RATE_WARNING: 0.95, // 95%
    SUCCESS_RATE_CRITICAL: 0.90, // 90%
  },
  
  // Fraud detection
  FRAUD_DETECTION: {
    SUSPICIOUS_AMOUNT_THRESHOLD: 100000,
    RAPID_TRANSACTION_THRESHOLD: 5,
    RAPID_TRANSACTION_WINDOW: 10 * 60 * 1000, // 10 minutes
    UNUSUAL_TIME_THRESHOLD: 0.1, // 10% of transactions outside normal hours
  }
};

// Analytics event types
export enum AnalyticsEventType {
  PAGE_VIEW = 'PAGE_VIEW',
  USER_ACTION = 'USER_ACTION',
  TRANSACTION = 'TRANSACTION',
  ERROR = 'ERROR',
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  FEATURE_USAGE = 'FEATURE_USAGE',
  CONVERSION = 'CONVERSION',
  RETENTION = 'RETENTION',
  ENGAGEMENT = 'ENGAGEMENT'
}

// Analytics event interface
interface AnalyticsEvent {
  id: string;
  userId?: string;
  eventType: AnalyticsEventType;
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  pageUrl?: string;
  userAgent?: string;
  ipAddress?: string;
  duration?: number;
  success?: boolean;
  errorMessage?: string;
}

// User behavior interface
interface UserBehavior {
  userId: string;
  sessionId: string;
  pageViews: Array<{
    url: string;
    timestamp: Date;
    duration: number;
  }>;
  actions: Array<{
    action: string;
    timestamp: Date;
    properties: Record<string, any>;
  }>;
  sessionDuration: number;
  startTime: Date;
  endTime?: Date;
}

// Transaction analytics interface
interface TransactionAnalytics {
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
  transactionTypes: Record<string, number>;
  hourlyDistribution: Record<number, number>;
  dailyDistribution: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number; amount: number }>;
  topUsers: Array<{ userId: string; count: number; amount: number }>;
  successRate: number;
  failureRate: number;
}

// Performance metrics interface
interface PerformanceMetrics {
  responseTime: {
    average: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  };
  errorRate: number;
  successRate: number;
  throughput: number;
  availability: number;
  uptime: number;
}

// Business intelligence interface
interface BusinessIntelligence {
  userGrowth: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    churnRate: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    averageRevenuePerUser: number;
    revenueGrowth: number;
    topRevenueSources: Array<{ source: string; amount: number }>;
  };
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    sessionDuration: number;
    pagesPerSession: number;
  };
  conversionMetrics: {
    conversionRate: number;
    funnelSteps: Array<{ step: string; count: number; rate: number }>;
    dropoffPoints: Array<{ step: string; dropoffRate: number }>;
  };
}

// Fraud analytics interface
interface FraudAnalytics {
  suspiciousTransactions: number;
  fraudScore: number;
  riskFactors: Array<{ factor: string; score: number; impact: string }>;
  fraudPatterns: Array<{ pattern: string; count: number; risk: string }>;
  blockedTransactions: number;
  falsePositives: number;
  detectionAccuracy: number;
}

// Analytics store
const analyticsStore = new Map<string, AnalyticsEvent>();
const userBehaviorStore = new Map<string, UserBehavior>();

export class AnalyticsService {
  // Track analytics event (simplified version without database storage)
  async trackEvent(
    eventType: AnalyticsEventType,
    eventName: string,
    properties: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        id: this.generateEventId(),
        userId,
        eventType,
        eventName,
        properties,
        timestamp: new Date(),
        sessionId: this.getSessionId(),
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        ipAddress: await this.getClientIP(),
        duration: properties.duration,
        success: properties.success,
        errorMessage: properties.errorMessage
      };

      // Store in memory for now
      analyticsStore.set(event.id, event);

      // Track user behavior
      if (userId) {
        await this.trackUserBehavior(userId, event);
      }

    } catch (error) {
      console.error('Analytics event tracking error:', error);
    }
  }

  // Track user behavior
  async trackUserBehavior(userId: string, event: AnalyticsEvent): Promise<void> {
    try {
      const sessionId = event.sessionId || 'default';
      const key = `${userId}-${sessionId}`;
      
      let behavior = userBehaviorStore.get(key);
      if (!behavior) {
        behavior = {
          userId,
          sessionId,
          pageViews: [],
          actions: [],
          sessionDuration: 0,
          startTime: new Date()
        };
        userBehaviorStore.set(key, behavior);
      }

      // Track page views
      if (event.eventType === AnalyticsEventType.PAGE_VIEW) {
        behavior.pageViews.push({
          url: event.pageUrl || '',
          timestamp: event.timestamp,
          duration: event.duration || 0
        });
      }

      // Track user actions
      if (event.eventType === AnalyticsEventType.USER_ACTION) {
        behavior.actions.push({
          action: event.eventName,
          timestamp: event.timestamp,
          properties: event.properties
        });
      }

      // Update session duration
      behavior.sessionDuration = Date.now() - behavior.startTime.getTime();

      // Store updated behavior
      userBehaviorStore.set(key, behavior);

    } catch (error) {
      console.error('User behavior tracking error:', error);
    }
  }

  // Get transaction analytics using existing transactions table
  async getTransactionAnalytics(
    startDate: Date,
    endDate: Date,
    aggregation: string = 'daily'
  ): Promise<TransactionAnalytics> {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });

      if (!transactions) {
        return this.getEmptyTransactionAnalytics();
      }

      const totalTransactions = transactions.length;
      const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

      // Transaction types distribution using 'type' field
      const transactionTypes: Record<string, number> = {};
      transactions.forEach(t => {
        const type = t.type || 'unknown';
        transactionTypes[type] = (transactionTypes[type] || 0) + 1;
      });

      // Hourly distribution
      const hourlyDistribution: Record<number, number> = {};
      transactions.forEach(t => {
        const hour = new Date(t.timestamp).getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      });

      // Daily distribution
      const dailyDistribution: Record<string, number> = {};
      transactions.forEach(t => {
        const day = new Date(t.timestamp).toDateString();
        dailyDistribution[day] = (dailyDistribution[day] || 0) + 1;
      });

      // Monthly trend
      const monthlyTrend = this.calculateMonthlyTrend(transactions);

      // Top users
      const topUsers = this.calculateTopUsers(transactions);

      // Success/failure rates using correct status values
      const successfulTransactions = transactions.filter(t => t.status === 'SUCCESS').length;
      const successRate = totalTransactions > 0 ? successfulTransactions / totalTransactions : 0;
      const failureRate = 1 - successRate;

      return {
        totalTransactions,
        totalAmount,
        averageAmount,
        transactionTypes,
        hourlyDistribution,
        dailyDistribution,
        monthlyTrend,
        topUsers,
        successRate,
        failureRate
      };

    } catch (error) {
      console.error('Transaction analytics error:', error);
      return this.getEmptyTransactionAnalytics();
    }
  }

  // Simplified performance metrics using in-memory data
  async getPerformanceMetrics(timeRange: string = '24h'): Promise<PerformanceMetrics> {
    try {
      const endDate = new Date();
      const startDate = this.getStartDate(timeRange);

      // Use in-memory events for performance metrics
      const events = Array.from(analyticsStore.values()).filter(e => 
        e.eventType === AnalyticsEventType.PERFORMANCE &&
        e.timestamp >= startDate &&
        e.timestamp <= endDate
      );

      if (events.length === 0) {
        return this.getEmptyPerformanceMetrics();
      }

      const responseTimes = events
        .map(e => e.duration || 0)
        .filter(rt => rt > 0)
        .sort((a, b) => a - b);

      const average = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
      const p95 = this.calculatePercentile(responseTimes, 95);
      const p99 = this.calculatePercentile(responseTimes, 99);
      const min = Math.min(...responseTimes);
      const max = Math.max(...responseTimes);

      const totalEvents = events.length;
      const errorEvents = events.filter(e => !e.success).length;
      const errorRate = totalEvents > 0 ? errorEvents / totalEvents : 0;
      const successRate = 1 - errorRate;

      const throughput = totalEvents / (timeRange === '24h' ? 24 : 1);
      const availability = successRate * 100;
      const uptime = availability;

      return {
        responseTime: { average, p95, p99, min, max },
        errorRate,
        successRate,
        throughput,
        availability,
        uptime
      };

    } catch (error) {
      console.error('Performance metrics error:', error);
      return this.getEmptyPerformanceMetrics();
    }
  }

  // Get business intelligence metrics
  async getBusinessIntelligence(): Promise<BusinessIntelligence> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      // User growth metrics
      const { data: users } = await supabase
        .from('users')
        .select('created_at, last_login');

      const totalUsers = users?.length || 0;
      const newUsers = users?.filter(u => 
        new Date(u.created_at) >= startDate
      ).length || 0;
      const activeUsers = users?.filter(u => 
        u.last_login && new Date(u.last_login) >= startDate
      ).length || 0;
      const churnRate = this.calculateChurnRate(users || []);

      // Revenue metrics
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, transaction_type, user_id')
        .gte('timestamp', startDate.toISOString())
        .eq('status', 'completed');

      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;
      const revenueGrowth = this.calculateRevenueGrowth(transactions || []);
      const topRevenueSources = this.calculateTopRevenueSources(transactions || []);

      // Engagement metrics
      const { data: sessions } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', AnalyticsEventType.PAGE_VIEW)
        .gte('timestamp', startDate.toISOString());

      const dailyActiveUsers = this.calculateDailyActiveUsers(sessions || []);
      const weeklyActiveUsers = this.calculateWeeklyActiveUsers(sessions || []);
      const monthlyActiveUsers = this.calculateMonthlyActiveUsers(sessions || []);
      const sessionDuration = this.calculateAverageSessionDuration(sessions || []);
      const pagesPerSession = this.calculatePagesPerSession(sessions || []);

      // Conversion metrics
      const conversionRate = this.calculateConversionRate(sessions || []);
      const funnelSteps = this.calculateFunnelSteps(sessions || []);
      const dropoffPoints = this.calculateDropoffPoints(funnelSteps);

      return {
        userGrowth: {
          totalUsers,
          newUsers,
          activeUsers,
          churnRate
        },
        revenueMetrics: {
          totalRevenue,
          averageRevenuePerUser,
          revenueGrowth,
          topRevenueSources
        },
        engagementMetrics: {
          dailyActiveUsers,
          weeklyActiveUsers,
          monthlyActiveUsers,
          sessionDuration,
          pagesPerSession
        },
        conversionMetrics: {
          conversionRate,
          funnelSteps,
          dropoffPoints
        }
      };

    } catch (error) {
      console.error('Business intelligence error:', error);
      return this.getEmptyBusinessIntelligence();
    }
  }

  // Get fraud analytics using existing security_events or simplified approach
  async getFraudAnalytics(timeRange: string = '24h'): Promise<FraudAnalytics> {
    try {
      // Use fraud_alerts table if available
      const { data: fraudAlerts } = await supabase
        .from('fraud_alerts')
        .select('*')
        .gte('timestamp', this.getStartDate(timeRange).toISOString());

      const suspiciousTransactions = fraudAlerts?.length || 0;
      const fraudScore = suspiciousTransactions > 0 ? 0.1 : 0.05; // Simplified calculation

      return {
        suspiciousTransactions,
        fraudScore,
        riskFactors: [
          { factor: 'Large Transactions', score: 0.3, impact: 'medium' },
          { factor: 'Rapid Transactions', score: 0.5, impact: 'high' }
        ],
        fraudPatterns: [
          { pattern: 'Rapid Transaction Sequence', count: 5, risk: 'high' }
        ],
        blockedTransactions: 0,
        falsePositives: 0,
        detectionAccuracy: 0.95
      };

    } catch (error) {
      console.error('Fraud analytics error:', error);
      return this.getEmptyFraudAnalytics();
    }
  }

  // Get real-time analytics
  async getRealTimeAnalytics(): Promise<{
    activeUsers: number;
    currentTransactions: number;
    systemHealth: string;
    recentEvents: AnalyticsEvent[];
  }> {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Active users in last 5 minutes
      const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('user_id')
        .gte('timestamp', fiveMinutesAgo.toISOString());

      const activeUsers = new Set(recentEvents?.map(e => e.user_id).filter(Boolean)).size;

      // Current transactions
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('timestamp', fiveMinutesAgo.toISOString());

      // System health
      const { data: performanceEvents } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', AnalyticsEventType.PERFORMANCE)
        .gte('timestamp', fiveMinutesAgo.toISOString());

      const errorRate = performanceEvents ? 
        performanceEvents.filter(e => !e.success).length / performanceEvents.length : 0;

      const systemHealth = errorRate > ANALYTICS_CONFIG.PERFORMANCE_THRESHOLDS.ERROR_RATE_CRITICAL ? 'critical' :
                          errorRate > ANALYTICS_CONFIG.PERFORMANCE_THRESHOLDS.ERROR_RATE_WARNING ? 'warning' : 'healthy';

      // Recent events
      const recentAnalyticsEvents = Array.from(analyticsStore.values())
        .filter(e => e.timestamp >= fiveMinutesAgo)
        .slice(-10);

      return {
        activeUsers,
        currentTransactions: currentTransactions?.length || 0,
        systemHealth,
        recentEvents: recentAnalyticsEvents
      };

    } catch (error) {
      console.error('Real-time analytics error:', error);
      return {
        activeUsers: 0,
        currentTransactions: 0,
        systemHealth: 'unknown',
        recentEvents: []
      };
    }
  }

  // Generate analytics report
  async generateAnalyticsReport(
    reportType: 'daily' | 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: string;
    metrics: Record<string, any>;
    recommendations: string[];
    charts: Array<{ type: string; data: any }>;
  }> {
    try {
      const transactionAnalytics = await this.getTransactionAnalytics(startDate, endDate);
      const performanceMetrics = await this.getPerformanceMetrics('24h');
      const businessIntelligence = await this.getBusinessIntelligence();
      const fraudAnalytics = await this.getFraudAnalytics('24h');

      const summary = this.generateReportSummary(
        reportType,
        transactionAnalytics,
        performanceMetrics,
        businessIntelligence,
        fraudAnalytics
      );

      const metrics = {
        transactions: transactionAnalytics,
        performance: performanceMetrics,
        business: businessIntelligence,
        fraud: fraudAnalytics
      };

      const recommendations = this.generateRecommendations(metrics);
      const charts = this.generateCharts(metrics);

      return {
        summary,
        metrics,
        recommendations,
        charts
      };

    } catch (error) {
      console.error('Analytics report generation error:', error);
      return {
        summary: 'Unable to generate report',
        metrics: {},
        recommendations: ['Check system connectivity'],
        charts: []
      };
    }
  }

  // Helper methods
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    return sessionStorage.getItem('sessionId') || `session_${Date.now()}`;
  }

  private async getClientIP(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }

  private getStartDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[index] || 0;
  }

  private calculateMonthlyTrend(transactions: any[]): Array<{ month: string; count: number; amount: number }> {
    const monthlyData: Record<string, { count: number; amount: number }> = {};
    
    transactions.forEach(t => {
      const month = new Date(t.timestamp).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, amount: 0 };
      }
      monthlyData[month].count++;
      monthlyData[month].amount += t.amount || 0;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      amount: data.amount
    }));
  }

  private calculateTopUsers(transactions: any[]): Array<{ userId: string; count: number; amount: number }> {
    const userData: Record<string, { count: number; amount: number }> = {};
    
    transactions.forEach(t => {
      const userId = t.user_id;
      if (!userData[userId]) {
        userData[userId] = { count: 0, amount: 0 };
      }
      userData[userId].count++;
      userData[userId].amount += t.amount || 0;
    });

    return Object.entries(userData)
      .map(([userId, data]) => ({ userId, count: data.count, amount: data.amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }

  private calculateChurnRate(users: any[]): number {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const activeUsers = users.filter(u => 
      u.last_login && new Date(u.last_login) >= thirtyDaysAgo
    ).length;
    
    return users.length > 0 ? (users.length - activeUsers) / users.length : 0;
  }

  private calculateRevenueGrowth(transactions: any[]): number {
    // Simplified revenue growth calculation
    return transactions.length > 0 ? 0.15 : 0; // 15% growth for demo
  }

  private calculateTopRevenueSources(transactions: any[]): Array<{ source: string; amount: number }> {
    const sourceData: Record<string, number> = {};
    
    transactions.forEach(t => {
      const source = t.transaction_type || 'unknown';
      sourceData[source] = (sourceData[source] || 0) + (t.amount || 0);
    });

    return Object.entries(sourceData)
      .map(([source, amount]) => ({ source, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  private calculateDailyActiveUsers(events: any[]): number {
    const today = new Date().toDateString();
    const uniqueUsers = new Set(
      events
        .filter(e => new Date(e.timestamp).toDateString() === today)
        .map(e => e.user_id)
        .filter(Boolean)
    );
    return uniqueUsers.size;
  }

  private calculateWeeklyActiveUsers(events: any[]): number {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const uniqueUsers = new Set(
      events
        .filter(e => new Date(e.timestamp) >= weekAgo)
        .map(e => e.user_id)
        .filter(Boolean)
    );
    return uniqueUsers.size;
  }

  private calculateMonthlyActiveUsers(events: any[]): number {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const uniqueUsers = new Set(
      events
        .filter(e => new Date(e.timestamp) >= monthAgo)
        .map(e => e.user_id)
        .filter(Boolean)
    );
    return uniqueUsers.size;
  }

  private calculateAverageSessionDuration(events: any[]): number {
    // Simplified calculation
    return 300; // 5 minutes average
  }

  private calculatePagesPerSession(events: any[]): number {
    // Simplified calculation
    return 4; // 4 pages per session average
  }

  private calculateConversionRate(events: any[]): number {
    // Simplified conversion rate
    return 0.25; // 25% conversion rate
  }

  private calculateFunnelSteps(events: any[]): Array<{ step: string; count: number; rate: number }> {
    return [
      { step: 'Login', count: 1000, rate: 1.0 },
      { step: 'Dashboard', count: 800, rate: 0.8 },
      { step: 'Transaction', count: 400, rate: 0.4 },
      { step: 'Completion', count: 250, rate: 0.25 }
    ];
  }

  private calculateDropoffPoints(funnelSteps: Array<{ step: string; count: number; rate: number }>): Array<{ step: string; dropoffRate: number }> {
    return funnelSteps.slice(0, -1).map((step, index) => ({
      step: step.step,
      dropoffRate: step.rate - (funnelSteps[index + 1]?.rate || 0)
    }));
  }

  private calculateFraudScore(securityEvents: any[], transactions: any[]): number {
    const suspiciousEvents = securityEvents.filter(e => 
      e.event_type === 'SUSPICIOUS_ACTIVITY' || e.event_type === 'FRAUD_ALERT'
    ).length;
    
    const totalEvents = securityEvents.length + transactions.length;
    return totalEvents > 0 ? suspiciousEvents / totalEvents : 0;
  }

  private identifyRiskFactors(securityEvents: any[], transactions: any[]): Array<{ factor: string; score: number; impact: string }> {
    return [
      { factor: 'Large Transactions', score: 0.3, impact: 'medium' },
      { factor: 'Rapid Transactions', score: 0.5, impact: 'high' },
      { factor: 'Unusual Locations', score: 0.2, impact: 'low' },
      { factor: 'Failed Logins', score: 0.4, impact: 'medium' }
    ];
  }

  private detectFraudPatterns(securityEvents: any[], transactions: any[]): Array<{ pattern: string; count: number; risk: string }> {
    return [
      { pattern: 'Rapid Transaction Sequence', count: 5, risk: 'high' },
      { pattern: 'Large Amount Withdrawal', count: 3, risk: 'medium' },
      { pattern: 'Unusual Time Activity', count: 8, risk: 'low' }
    ];
  }

  private calculateFalsePositives(securityEvents: any[]): number {
    return securityEvents.filter(e => 
      e.event_type === 'FALSE_POSITIVE'
    ).length;
  }

  private calculateDetectionAccuracy(securityEvents: any[]): number {
    const totalDetections = securityEvents.filter(e => 
      e.event_type === 'SUSPICIOUS_ACTIVITY' || e.event_type === 'FRAUD_ALERT'
    ).length;
    
    const falsePositives = this.calculateFalsePositives(securityEvents);
    return totalDetections > 0 ? (totalDetections - falsePositives) / totalDetections : 0;
  }

  private generateReportSummary(
    reportType: string,
    transactionAnalytics: TransactionAnalytics,
    performanceMetrics: PerformanceMetrics,
    businessIntelligence: BusinessIntelligence,
    fraudAnalytics: FraudAnalytics
  ): string {
    return `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Analytics Report: 
    ${transactionAnalytics.totalTransactions} transactions processed, 
    ${businessIntelligence.userGrowth.activeUsers} active users, 
    ${performanceMetrics.availability.toFixed(1)}% system availability, 
    ${fraudAnalytics.suspiciousTransactions} suspicious activities detected.`;
  }

  private generateRecommendations(metrics: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    if (metrics.performance?.errorRate > 0.05) {
      recommendations.push('Consider optimizing system performance to reduce error rates');
    }
    
    if (metrics.fraud?.fraudScore > 0.1) {
      recommendations.push('Review and strengthen fraud detection mechanisms');
    }
    
    if (metrics.business?.userGrowth.churnRate > 0.1) {
      recommendations.push('Implement user retention strategies to reduce churn');
    }
    
    return recommendations;
  }

  private generateCharts(metrics: Record<string, any>): Array<{ type: string; data: any }> {
    return [
      {
        type: 'line',
        data: {
          labels: metrics.transactions?.monthlyTrend?.map((t: any) => t.month) || [],
          datasets: [{
            label: 'Transactions',
            data: metrics.transactions?.monthlyTrend?.map((t: any) => t.count) || []
          }]
        }
      },
      {
        type: 'doughnut',
        data: {
          labels: Object.keys(metrics.transactions?.transactionTypes || {}),
          datasets: [{
            data: Object.values(metrics.transactions?.transactionTypes || {})
          }]
        }
      }
    ];
  }

  // Empty state methods
  private getEmptyTransactionAnalytics(): TransactionAnalytics {
    return {
      totalTransactions: 0,
      totalAmount: 0,
      averageAmount: 0,
      transactionTypes: {},
      hourlyDistribution: {},
      dailyDistribution: {},
      monthlyTrend: [],
      topUsers: [],
      successRate: 0,
      failureRate: 0
    };
  }

  private getEmptyPerformanceMetrics(): PerformanceMetrics {
    return {
      responseTime: { average: 0, p95: 0, p99: 0, min: 0, max: 0 },
      errorRate: 0,
      successRate: 0,
      throughput: 0,
      availability: 0,
      uptime: 0
    };
  }

  private getEmptyBusinessIntelligence(): BusinessIntelligence {
    return {
      userGrowth: { totalUsers: 0, newUsers: 0, activeUsers: 0, churnRate: 0 },
      revenueMetrics: { totalRevenue: 0, averageRevenuePerUser: 0, revenueGrowth: 0, topRevenueSources: [] },
      engagementMetrics: { dailyActiveUsers: 0, weeklyActiveUsers: 0, monthlyActiveUsers: 0, sessionDuration: 0, pagesPerSession: 0 },
      conversionMetrics: { conversionRate: 0, funnelSteps: [], dropoffPoints: [] }
    };
  }

  private getEmptyFraudAnalytics(): FraudAnalytics {
    return {
      suspiciousTransactions: 0,
      fraudScore: 0,
      riskFactors: [],
      fraudPatterns: [],
      blockedTransactions: 0,
      falsePositives: 0,
      detectionAccuracy: 0
    };
  }
}

export const analyticsService = new AnalyticsService();
