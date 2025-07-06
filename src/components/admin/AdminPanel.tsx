
import React, { useState, useEffect } from 'react';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Shield, AlertTriangle, Database, TrendingUp } from 'lucide-react';
import UserManagement from '../UserManagement';
import SystemMetrics from './SystemMetrics';
import AnalyticsDashboard from './AnalyticsDashboard';
import SecurityDashboard from './SecurityDashboard';

const AdminPanel: React.FC = () => {
  const { currentUser } = useSupabaseATM();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. Administrator privileges required to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const refreshUsers = async () => {
    setLoading(true);
    // Mock data for now - in real app would fetch from Supabase
    setTimeout(() => {
      setUsers([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
            System Administration
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete system management and monitoring dashboard
          </p>
        </div>
        <Badge variant="destructive" className="text-sm px-3 py-1">
          ADMIN ACCESS
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">342</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Alerts</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold text-green-600">98.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            System Metrics
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement 
            users={users} 
            onUserCreated={refreshUsers} 
            onUserDeleted={refreshUsers} 
          />
        </TabsContent>

        <TabsContent value="metrics">
          <SystemMetrics />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="security">
          <SecurityDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
