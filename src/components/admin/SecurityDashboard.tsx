
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Lock, Key, Eye, Clock } from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  const securityAlerts = [
    {
      id: 1,
      type: 'Failed Login Attempt',
      severity: 'medium',
      description: 'Multiple failed login attempts from IP 192.168.1.100',
      timestamp: '2024-01-07 10:30:00',
      status: 'investigating'
    },
    {
      id: 2,
      type: 'Suspicious Transaction',
      severity: 'high',
      description: 'Large transaction amount detected outside normal pattern',
      timestamp: '2024-01-07 09:15:00',
      status: 'resolved'
    },
    {
      id: 3,
      type: 'Account Lockout',
      severity: 'low',
      description: 'User account locked due to exceeded failed attempts',
      timestamp: '2024-01-07 08:45:00',
      status: 'resolved'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600';
      case 'investigating': return 'text-yellow-600';
      case 'pending': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Security Dashboard</h2>
        <p className="text-muted-foreground">Advanced security monitoring and threat detection</p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold text-green-600">95/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Threats</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Locked Accounts</p>
                <p className="text-2xl font-bold">7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audit Events</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Security Alerts
            </CardTitle>
            <Button variant="outline" size="sm">
              View All Alerts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{alert.type}</h4>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                    <span className={`font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Investigate
                  </Button>
                  <Button variant="outline" size="sm">
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Authentication Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Password Policy</span>
              <Badge variant="outline">Strong</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Two-Factor Authentication</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Session Timeout</span>
              <span className="text-sm font-mono">30 minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Max Login Attempts</span>
              <span className="text-sm font-mono">5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Fraud Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Real-time Monitoring</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Risk Scoring</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Transaction Limits</span>
              <Badge variant="outline">Enforced</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Geo-location Checks</span>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityDashboard;
