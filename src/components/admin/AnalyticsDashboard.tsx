
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Download } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
          case '24h':
            startDate.setHours(startDate.getHours() - 24);
            break;
          case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
        }

        const [transactionData, performanceData, businessData] = await Promise.all([
          analyticsService.getTransactionAnalytics(startDate, endDate),
          analyticsService.getPerformanceMetrics(timeRange),
          analyticsService.getBusinessIntelligence()
        ]);

        setAnalytics({
          transactions: transactionData,
          performance: performanceData,
          business: businessData
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Mock data for charts
  const transactionVolumeData = [
    { date: '2024-01-01', volume: 45000, count: 124 },
    { date: '2024-01-02', volume: 52000, count: 142 },
    { date: '2024-01-03', volume: 48000, count: 135 },
    { date: '2024-01-04', volume: 61000, count: 167 },
    { date: '2024-01-05', volume: 55000, count: 153 },
    { date: '2024-01-06', volume: 67000, count: 178 },
    { date: '2024-01-07', volume: 59000, count: 162 }
  ];

  const transactionTypeData = [
    { name: 'Send Money', value: 45, color: '#E91E63' },
    { name: 'Pay Bill', value: 30, color: '#9C27B0' },
    { name: 'Buy Airtime', value: 15, color: '#FF5722' },
    { name: 'Withdraw', value: 10, color: '#4CAF50' }
  ];

  const userGrowthData = [
    { month: 'Jan', users: 1200, active: 980 },
    { month: 'Feb', users: 1350, active: 1100 },
    { month: 'Mar', users: 1480, active: 1220 },
    { month: 'Apr', users: 1620, active: 1350 },
    { month: 'May', users: 1750, active: 1480 },
    { month: 'Jun', users: 1890, active: 1620 }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-40 bg-gray-100 dark:bg-gray-800 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">KES 2.4M</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">1,620</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.2%
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">8,450</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15.3%
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">98.7%</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -0.3%
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={transactionVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#E91E63" 
                  fill="#E91E63" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Types */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Growth & Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#E91E63" 
                  strokeWidth={2}
                  name="Total Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#9C27B0" 
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Transaction activity by hour of day
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { hour: '00', transactions: 45 },
                { hour: '06', transactions: 120 },
                { hour: '12', transactions: 280 },
                { hour: '18', transactions: 350 },
                { hour: '21', transactions: 180 }
              ]}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="transactions" fill="#E91E63" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Response Time</span>
              <span className="font-semibold">234ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">System Uptime</span>
              <span className="font-semibold text-green-600">99.98%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Error Rate</span>
              <span className="font-semibold text-red-600">0.02%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Peak Concurrent Users</span>
              <span className="font-semibold">542</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
