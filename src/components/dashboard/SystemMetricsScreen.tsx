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
                    <Button variant="outline" className="flex items-center gap-2">
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
                            {(systemMetrics?.errorRate * 100).toFixed(2)}%
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Last 24 hours</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="card-modern">
                <CardHeader>
                    <CardTitle className="text-[#F1F1F1]">System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-400">Comprehensive system metrics and monitoring dashboard coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default SystemMetricsScreen; 