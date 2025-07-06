
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Server, Database, Cpu, HardDrive, Wifi, AlertCircle } from 'lucide-react';

const SystemMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    cpu: 45,
    memory: 67,
    disk: 34,
    network: 78,
    uptime: '15d 4h 23m',
    activeConnections: 145,
    queuedJobs: 12,
    errorRate: 0.02
  });

  const performanceData = [
    { time: '00:00', cpu: 25, memory: 45, network: 30 },
    { time: '04:00', cpu: 20, memory: 42, network: 25 },
    { time: '08:00', cpu: 45, memory: 55, network: 60 },
    { time: '12:00', cpu: 65, memory: 70, network: 85 },
    { time: '16:00', cpu: 55, memory: 65, network: 75 },
    { time: '20:00', cpu: 40, memory: 50, network: 55 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Metrics</h2>
        <p className="text-muted-foreground">Real-time system performance monitoring</p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <Badge variant={metrics.cpu > 80 ? 'destructive' : metrics.cpu > 60 ? 'secondary' : 'outline'}>
                {metrics.cpu}%
              </Badge>
            </div>
            <Progress value={metrics.cpu} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">4 cores @ 2.4GHz</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <Badge variant={metrics.memory > 80 ? 'destructive' : metrics.memory > 60 ? 'secondary' : 'outline'}>
                {metrics.memory}%
              </Badge>
            </div>
            <Progress value={metrics.memory} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">5.4GB / 8GB used</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Disk Usage</span>
              </div>
              <Badge variant={metrics.disk > 80 ? 'destructive' : 'outline'}>
                {metrics.disk}%
              </Badge>
            </div>
            <Progress value={metrics.disk} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">340GB / 1TB used</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Network</span>
              </div>
              <Badge variant="outline">{metrics.network} Mbps</Badge>
            </div>
            <Progress value={metrics.network} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Bandwidth utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} name="Memory %" />
              <Line type="monotone" dataKey="network" stroke="#F59E0B" strokeWidth={2} name="Network %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="font-mono text-green-600">{metrics.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Connections</span>
              <span className="font-mono">{metrics.activeConnections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Queued Jobs</span>
              <span className="font-mono">{metrics.queuedJobs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className="font-mono text-red-600">{metrics.errorRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">High memory usage detected</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Database connection timeout</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Backup completed successfully</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemMetrics;
