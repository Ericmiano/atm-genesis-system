
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { translations } from '../utils/translations';
import { supabaseATMService } from '../services/supabaseATMService';
import { User, Transaction, AuditLog, FraudAlert } from '../types/atm';
import { ArrowLeft, Shield, Users, FileText, AlertTriangle, Activity, Eye } from 'lucide-react';
import UserManagement from './UserManagement';

interface AdminScreenProps {
  onBack: () => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useSupabaseATM();
  const t = translations[language];

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersData, transactionsData] = await Promise.all([
        supabaseATMService.getAllUsers(),
        supabaseATMService.getTransactionHistory()
      ]);
      
      setUsers(usersData);
      setTransactions(transactionsData);
      // Note: Audit logs and fraud alerts would need similar implementation
      setAuditLogs([]);
      setFraudAlerts([]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUserCreated = () => {
    fetchAdminData();
  };

  const handleUserDeleted = () => {
    fetchAdminData();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-KE');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 p-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl animate-scale-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                <CardTitle className="text-xl">{t.adminPanel}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t.users}
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {t.transactions}
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t.auditLogs}
                </TabsTrigger>
                <TabsTrigger value="fraud" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t.fraudAlerts}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <UserManagement 
                  users={users} 
                  onUserCreated={handleUserCreated}
                  onUserDeleted={handleUserDeleted}
                />
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <h3 className="text-lg font-semibold">Transaction History</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No transactions found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    transactions.map((transaction, index) => (
                      <Card 
                        key={transaction.id} 
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge>{transaction.type}</Badge>
                                <span className="font-medium">{transaction.description}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{formatDate(transaction.timestamp)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">KES {transaction.amount.toLocaleString()}</p>
                              <Badge variant={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="audit" className="space-y-4">
                <h3 className="text-lg font-semibold">Audit Logs</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No audit logs available</p>
                      </CardContent>
                    </Card>
                  ) : (
                    auditLogs.map((log, index) => (
                      <Card 
                        key={log.id} 
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{log.action}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatDate(log.timestamp)}</p>
                            </div>
                            <Badge variant="outline">{log.userId || 'System'}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="fraud" className="space-y-4">
                <h3 className="text-lg font-semibold">Fraud Alerts</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No fraud alerts detected</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminScreen;
