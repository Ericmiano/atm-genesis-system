import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, TrendingDown, Users, DollarSign, Activity, Shield, BarChart3, Clock, AlertTriangle } from 'lucide-react';
import { analyticsService, AnalyticsEventType } from '@/services/analyticsService';

interface AnalyticsData {
  transactions: any;
  performance: any;
  business: any;
  fraud: any;
  realTime: any;
}

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadRealTimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = getStartDate(timeRange);

      const [transactions, performance, business, fraud, realTime] = await Promise.all([
        analyticsService.getTransactionAnalytics(startDate, endDate),
        analyticsService.getPerformanceMetrics(timeRange),
        analyticsService.getBusinessIntelligence(),
        analyticsService.getFraudAnalytics(timeRange),
        analyticsService.getRealTimeAnalytics()
      ]);

      setAnalyticsData({
        transactions,
        performance,
        business,
        fraud,
        realTime
      });
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const realTime = await analyticsService.getRealTimeAnalytics();
      setAnalyticsData(prev => prev ? { ...prev, realTime } : null);
    } catch (err) {
      console.error('Real-time data loading error:', err);
    }
  };

  const getStartDate = (range: string): Date => {
    const now = new Date();
    switch (range) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into system performance, user behavior, and business metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{analyticsData.realTime.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Transactions</p>
                  <p className="text-2xl font-bold">{analyticsData.realTime.currentTransactions}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Health</p>
                  <Badge className={getSystemHealthColor(analyticsData.realTime.systemHealth)}>
                    {analyticsData.realTime.systemHealth}
                  </Badge>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Events</p>
                  <p className="text-2xl font-bold">{analyticsData.realTime.recentEvents.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="fraud">Fraud</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Transaction Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{formatNumber(analyticsData.transactions.totalTransactions)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(analyticsData.transactions.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(analyticsData.transactions.successRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(analyticsData.transactions.averageAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Response Time (avg)</span>
                      <span>{analyticsData.performance.responseTime.average.toFixed(0)}ms</span>
                    </div>
                    <Progress value={Math.min(analyticsData.performance.responseTime.average / 1000 * 100, 100)} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Availability</span>
                      <span>{analyticsData.performance.availability.toFixed(1)}%</span>
                    </div>
                    <Progress value={analyticsData.performance.availability} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span>{formatPercentage(analyticsData.performance.errorRate)}</span>
                    </div>
                    <Progress value={analyticsData.performance.errorRate * 100} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Business Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{formatNumber(analyticsData.business.userGrowth.totalUsers)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{formatNumber(analyticsData.business.userGrowth.activeUsers)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(analyticsData.business.revenueMetrics.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Growth</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{formatPercentage(analyticsData.business.revenueMetrics.revenueGrowth)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fraud Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Fraud Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Suspicious Transactions</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {analyticsData.fraud.suspiciousTransactions}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fraud Score</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPercentage(analyticsData.fraud.fraudScore)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Detection Accuracy</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(analyticsData.fraud.detectionAccuracy)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blocked Transactions</p>
                    <p className="text-2xl font-bold">{analyticsData.fraud.blockedTransactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Types */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analyticsData.transactions.transactionTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle>Top Users by Transaction Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.transactions.topUsers.slice(0, 5).map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span className="text-sm">{user.userId.slice(0, 8)}...</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{user.count} transactions</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(user.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{analyticsData.performance.responseTime.average.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">P95</p>
                    <p className="text-2xl font-bold">{analyticsData.performance.responseTime.p95.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">P99</p>
                    <p className="text-2xl font-bold">{analyticsData.performance.responseTime.p99.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max</p>
                    <p className="text-2xl font-bold">{analyticsData.performance.responseTime.max.toFixed(0)}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span>{analyticsData.performance.uptime.toFixed(1)}%</span>
                    </div>
                    <Progress value={analyticsData.performance.uptime} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Throughput</span>
                      <span>{analyticsData.performance.throughput.toFixed(1)} req/min</span>
                    </div>
                    <Progress value={Math.min(analyticsData.performance.throughput / 10, 100)} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{formatPercentage(analyticsData.performance.successRate)}</span>
                    </div>
                    <Progress value={analyticsData.performance.successRate * 100} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{formatNumber(analyticsData.business.userGrowth.totalUsers)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Users</p>
                    <p className="text-2xl font-bold text-green-600">{formatNumber(analyticsData.business.userGrowth.newUsers)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{formatNumber(analyticsData.business.userGrowth.activeUsers)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Churn Rate</p>
                    <p className="text-2xl font-bold text-red-600">{formatPercentage(analyticsData.business.userGrowth.churnRate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(analyticsData.business.revenueMetrics.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Revenue/User</p>
                    <p className="text-2xl font-bold">{formatCurrency(analyticsData.business.revenueMetrics.averageRevenuePerUser)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue Growth</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{formatPercentage(analyticsData.business.revenueMetrics.revenueGrowth)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Top Revenue Sources</p>
                  <div className="space-y-2">
                    {analyticsData.business.revenueMetrics.topRevenueSources.map((source, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="capitalize">{source.source}</span>
                        <span>{formatCurrency(source.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Active Users</p>
                    <p className="text-2xl font-bold">{formatNumber(analyticsData.business.engagementMetrics.dailyActiveUsers)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly Active Users</p>
                    <p className="text-2xl font-bold">{formatNumber(analyticsData.business.engagementMetrics.weeklyActiveUsers)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Session Duration</p>
                    <p className="text-2xl font-bold">{Math.round(analyticsData.business.engagementMetrics.sessionDuration / 60)}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pages/Session</p>
                    <p className="text-2xl font-bold">{analyticsData.business.engagementMetrics.pagesPerSession}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.business.conversionMetrics.funnelSteps.map((step, index) => (
                    <div key={step.step}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{step.step}</span>
                        <span>{formatPercentage(step.rate)}</span>
                      </div>
                      <Progress value={step.rate * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fraud Tab */}
        <TabsContent value="fraud" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.fraud.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{factor.factor}</p>
                        <p className="text-xs text-muted-foreground capitalize">{factor.impact} impact</p>
                      </div>
                      <Badge variant={factor.impact === 'high' ? 'destructive' : factor.impact === 'medium' ? 'secondary' : 'outline'}>
                        {formatPercentage(factor.score)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fraud Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Detected Fraud Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.fraud.fraudPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{pattern.pattern}</p>
                        <p className="text-xs text-muted-foreground">{pattern.count} occurrences</p>
                      </div>
                      <Badge variant={pattern.risk === 'high' ? 'destructive' : pattern.risk === 'medium' ? 'secondary' : 'outline'}>
                        {pattern.risk} risk
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fraud Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Fraud Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Detection Accuracy</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(analyticsData.fraud.detectionAccuracy)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">False Positives</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {analyticsData.fraud.falsePositives}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blocked Transactions</p>
                    <p className="text-2xl font-bold text-red-600">
                      {analyticsData.fraud.blockedTransactions}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fraud Score</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPercentage(analyticsData.fraud.fraudScore)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AnalyticsDashboard; 