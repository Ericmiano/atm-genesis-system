
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { supabaseATMService } from '../services/supabaseATMService';
import { User, Transaction, AuditLog, FraudAlert } from '../types/atm';
import UserManagement from './UserManagement';
import AdminHeader from './admin/AdminHeader';
import AdminTabs from './admin/AdminTabs';
import TransactionsList from './admin/TransactionsList';
import AuditLogsList from './admin/AuditLogsList';
import FraudAlertsList from './admin/FraudAlertsList';

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
          <AdminHeader onBack={onBack} language={language} />
          <CardContent>
            <Tabs defaultValue="users" className="space-y-4">
              <AdminTabs language={language} />

              <TabsContent value="users" className="space-y-4">
                <UserManagement 
                  users={users} 
                  onUserCreated={handleUserCreated}
                  onUserDeleted={handleUserDeleted}
                />
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <h3 className="text-lg font-semibold">Transaction History</h3>
                <TransactionsList transactions={transactions} />
              </TabsContent>

              <TabsContent value="audit" className="space-y-4">
                <h3 className="text-lg font-semibold">Audit Logs</h3>
                <AuditLogsList auditLogs={auditLogs} />
              </TabsContent>

              <TabsContent value="fraud" className="space-y-4">
                <h3 className="text-lg font-semibold">Fraud Alerts</h3>
                <FraudAlertsList fraudAlerts={fraudAlerts} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminScreen;
