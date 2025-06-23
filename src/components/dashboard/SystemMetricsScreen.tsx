
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
    Activity, 
    Users, 
    CreditCard, 
    Shield, 
    TrendingUp, 
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    Database,
    Server,
    BarChart3,
    RefreshCw,
    Download,
    Eye,
    Zap,
    Cpu,
    HardDrive,
    Network,
    Globe
} from 'lucide-react';
import { systemMetricsService, SystemMetrics, UserMetrics, TransactionMetrics, SecurityMetrics } from '../../services/systemMetricsService';

const SystemMetricsScreen: React.FC = () => {
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
    const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
    const [transactionMetrics, setTransactionMetrics] = useState<TransactionMetrics | null>(null);
    const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const [system, users, transactions, security] = await Promise.all([
                systemMetricsService.getSystemMetrics(),
                systemMetricsService.getUserMetrics(),
                systemMetricsService.getTransactionMetrics(),
                systemMetricsService.getSecurityMetrics()
            ]);

            setSystemMetrics(system);
            setUserMetrics(users);
            setTransactionMetrics(transactions);
            setSecurityMetrics(security);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'text-green-400 bg-green-400/10';
            case 'good': return 'text-blue-400 bg-blue-400/10';
            case 'fair': return 'text-yellow-400 bg-yellow-400/10';
            case 'poor': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-400 bg-red-400/10';
            case 'high': return 'text-orange-400 bg-orange-400/10';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10';
            case 'low': return 'text-blue-400 bg-blue-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#F1F1F1]">System Metrics</h1>
                    <p className="text-gray-400 mt-2">Real-time system monitoring and analytics</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2" onClick={fetchMetrics}>
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                    <Button className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="stat-card primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#F1F1F1]">System Health</CardTitle>
                        <Activity className="w-4 h-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <Badge className={`${getHealthColor(systemMetrics?.systemHealth || 'poor')}`}>
                            {systemMetrics?.systemHealth?.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">Overall system status</p>
                    </CardContent>
                </Card>

                <Card className="stat-card success">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#F1F1F1]">System Uptime</CardTitle>
                        <Clock className="w-4 h-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#F1F1F1]">
                            {systemMetrics?.systemUptime}%
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card className="stat-card warning">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#F1F1F1]">API Response</CardTitle>
                        <Zap className="w-4 h-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#F1F1F1]">
                            {systemMetrics?.apiResponseTime}ms
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Average response time</p>
                    </CardContent>
                </Card>

                <Card className="stat-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#F1F1F1]">Error Rate</CardTitle>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#F1F1F1]">
                            {((systemMetrics?.errorRate || 0) * 100).toFixed(2)}%
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Last 24 hours</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="card-modern">
                            <CardHeader>
                                <CardTitle className="text-[#F1F1F1] flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Total Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-[#F1F1F1]">
                                    {systemMetrics?.totalUsers || 0}
                                </div>
                                <p className="text-sm text-gray-400">
                                    {systemMetrics?.activeUsers || 0} active users
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="card-modern">
                            <CardHeader>
                                <CardTitle className="text-[#F1F1F1] flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-[#F1F1F1]">
                                    {systemMetrics?.totalTransactions || 0}
                                </div>
                                <p className="text-sm text-gray-400">
                                    KES {(systemMetrics?.totalVolume || 0).toLocaleString()} volume
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="card-modern">
                            <CardHeader>
                                <CardTitle className="text-[#F1F1F1] flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Security Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-[#F1F1F1]">
                                    {systemMetrics?.fraudAlerts || 0}
                                </div>
                                <p className="text-sm text-gray-400">
                                    {securityMetrics?.lockedAccounts || 0} locked accounts
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <Card className="card-modern">
                        <CardHeader>
                            <CardTitle className="text-[#F1F1F1]">User Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F1F1F1]">
                                        {userMetrics?.newUsers || 0}
                                    </div>
                                    <p className="text-sm text-gray-400">New Users</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F1F1F1]">
                                        {userMetrics?.activeUsers || 0}
                                    </div>
                                    <p className="text-sm text-gray-400">Active Users</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F1F1F1]">
                                        {userMetrics?.lockedUsers || 0}
                                    </div>
                                    <p className="text-sm text-gray-400">Locked Users</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F1F1F1]">
                                        {Object.values(userMetrics?.usersByRole || {}).reduce((a, b) => a + b, 0)}
                                    </div>
                                    <p className="text-sm text-gray-400">Total Users</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                    <Card className="card-modern">
                        <CardHeader>
                            <CardTitle className="text-[#F1F1F1]">Transaction Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F1F1F1]">
                                        {transactionMetrics?.totalTransactions || 0}
                                    </div>
                                    <p className="text-sm text-gray-400">Total Transactions</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F1F1F1]">
                                        KES {(transactionMetrics?.totalVolume || 0).toLocaleString()}
                                    </div>
                                    <p className="text-sm text-gray-400">Total Volume</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F1F1F1]">
                                        KES {(transactionMetrics?.averageAmount || 0).toLocaleString()}
                                    </div>
                                    <p className="text-sm text-gray-400">Average Amount</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <Card className="card-modern">
                        <CardHeader>
                            <CardTitle className="text-[#F1F1F1]">Security Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F1F1F1]">
                                        {securityMetrics?.failedLoginAttempts || 0}
                                    </div>
                                    <p className="text-sm text-gray-400">Failed Login Attempts</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F1F1F1]">
                                        {securityMetrics?.lockedAccounts || 0}
                                    </div>
                                    <p className="text-sm text-gray-400">Locked Accounts</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F1F1F1]">
                                        {securityMetrics?.fraudAlerts || 0}
                                    </div>
                                    <p className="text-sm text-gray-400">Fraud Alerts</p>
                                </div>
                            </div>

                            {securityMetrics?.securityEvents && securityMetrics.securityEvents.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-lg font-semibold text-[#F1F1F1]">Recent Security Events</h4>
                                    {securityMetrics.securityEvents.slice(0, 5).map((event) => (
                                        <div key={event.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Badge className={getSeverityColor(event.severity)}>
                                                    {event.severity.toUpperCase()}
                                                </Badge>
                                                <span className="text-[#F1F1F1]">{event.type}</span>
                                            </div>
                                            <span className="text-sm text-gray-400">
                                                {new Date(event.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SystemMetricsScreen;
