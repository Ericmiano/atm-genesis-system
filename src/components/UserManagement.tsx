import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '../types/atm';
import { supabaseATMService } from '../services/supabaseATMService';
import { 
  UserPlus, 
  Trash2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  DollarSign, 
  Shield,
  RefreshCw,
  Eye,
  Edit,
  Search,
  Filter,
  Download,
  Upload,
  Users,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Settings,
  Key,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UserManagementProps {
  users: User[];
  onUserCreated: () => void;
  onUserDeleted: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUserCreated, onUserDeleted }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('users');
  const { toast } = useToast();

  // Create user form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    initialBalance: 0,
    role: 'USER' as 'USER' | 'ADMIN'
  });

  // Lock user form state
  const [lockReason, setLockReason] = useState('');

  // Balance adjustment form state
  const [balanceAdjustment, setBalanceAdjustment] = useState({
    amount: 0,
    reason: ''
  });

  // Role change form state
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.accountNumber.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'locked' && user.isLocked) ||
                         (filterStatus === 'active' && !user.isLocked);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await supabaseATMService.createUser(
        newUser.email,
        newUser.password,
        newUser.name,
        newUser.initialBalance
      );

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setCreateDialogOpen(false);
        setNewUser({ email: '', password: '', name: '', initialBalance: 0, role: 'USER' });
        onUserCreated();
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError('');

    try {
      const result = await supabaseATMService.deleteUser(selectedUser.id);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        onUserDeleted();
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError('');

    try {
      const result = await supabaseATMService.lockUser?.(selectedUser.id, lockReason);

      if (result?.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setLockDialogOpen(false);
        setSelectedUser(null);
        setLockReason('');
        onUserCreated(); // Refresh user list
      } else {
        setError(result?.message || 'Failed to lock user');
      }
    } catch (error) {
      setError('Failed to lock user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockUser = async (userId: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await supabaseATMService.unlockUser?.(userId);

      if (result?.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        onUserCreated(); // Refresh user list
      } else {
        setError(result?.message || 'Failed to unlock user');
      }
    } catch (error) {
      setError('Failed to unlock user');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError('');

    try {
      const result = await supabaseATMService.adjustUserBalance?.(
        selectedUser.id, 
        balanceAdjustment.amount, 
        balanceAdjustment.reason
      );

      if (result?.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setBalanceDialogOpen(false);
        setSelectedUser(null);
        setBalanceAdjustment({ amount: 0, reason: '' });
        onUserCreated(); // Refresh user list
      } else {
        setError(result?.message || 'Failed to adjust balance');
      }
    } catch (error) {
      setError('Failed to adjust balance');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError('');

    try {
      const result = await supabaseATMService.changeUserRole?.(selectedUser.id, newRole);

      if (result?.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setRoleDialogOpen(false);
        setSelectedUser(null);
        setNewRole('USER');
        onUserCreated(); // Refresh user list
      } else {
        setError(result?.message || 'Failed to change role');
      }
    } catch (error) {
      setError('Failed to change role');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (user: User, dialogType: string) => {
    setSelectedUser(user);
    setError('');
    switch (dialogType) {
      case 'delete':
        setDeleteDialogOpen(true);
        break;
      case 'lock':
        setLockDialogOpen(true);
        break;
      case 'balance':
        setBalanceDialogOpen(true);
        break;
      case 'role':
        setNewRole(user.role);
        setRoleDialogOpen(true);
        break;
    }
  };

  const getAccountAge = (createdAt: string) => {
    const age = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.round(age * 10) / 10;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Header with Actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold">User Management</h3>
              <p className="text-gray-600 dark:text-gray-300">Manage user accounts and permissions</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account with initial settings.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-email">Email</Label>
                      <Input
                        id="create-email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-password">Password</Label>
                      <Input
                        id="create-password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-name">Full Name</Label>
                      <Input
                        id="create-name"
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-balance">Initial Balance (KES)</Label>
                      <Input
                        id="create-balance"
                        type="number"
                        value={newUser.initialBalance}
                        onChange={(e) => setNewUser({ ...newUser, initialBalance: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-role">Role</Label>
                      <Select value={newUser.role} onValueChange={(value: 'USER' | 'ADMIN') => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create User'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name, email, or account number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full lg:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="USER">Users</SelectItem>
                    <SelectItem value="ADMIN">Admins</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Active Users</p>
                    <p className="text-2xl font-bold">{users.filter(u => !u.isLocked).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Locked Users</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.isLocked).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Admins</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user, index) => (
              <Card 
                key={user.id} 
                className="group cursor-pointer bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* User Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{user.name}</h4>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.isLocked ? 'destructive' : 'default'}>
                          {user.isLocked ? 'Locked' : 'Active'}
                        </Badge>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Account:</span>
                        <span className="font-mono">{user.accountNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Balance:</span>
                        <span className="font-semibold text-green-600">KES {user.balance.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Failed Attempts:</span>
                        <Badge variant={user.failedAttempts > 0 ? 'destructive' : 'outline'}>
                          {user.failedAttempts}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Account Age:</span>
                        <span>{getAccountAge(user.createdAt)} years</span>
                      </div>
                      {user.isLocked && user.lockReason && (
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                          <span className="font-medium text-red-600">Lock Reason:</span> {user.lockReason}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        {user.role !== 'ADMIN' && (
                          <>
                            <Button
                              onClick={() => openDialog(user, 'balance')}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              title="Adjust Balance"
                            >
                              <DollarSign className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => openDialog(user, 'role')}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              title="Change Role"
                            >
                              <Shield className="w-3 h-3" />
                            </Button>
                            {user.isLocked ? (
                              <Button
                                onClick={() => handleUnlockUser(user.id)}
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                title="Unlock User"
                              >
                                <Unlock className="w-3 h-3" />
                              </Button>
                            ) : (
                              <Button
                                onClick={() => openDialog(user, 'lock')}
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                title="Lock User"
                              >
                                <Lock className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              onClick={() => openDialog(user, 'delete')}
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              title="Delete User"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found matching your criteria</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analytics dashboard will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">User management settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete User Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the account for <strong>{selectedUser?.name}</strong>? 
              This action cannot be undone and will permanently remove all user data including transactions and balances.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedUser(null);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock User Dialog */}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-600" />
              Lock User Account
            </DialogTitle>
            <DialogDescription>
              Lock the account for <strong>{selectedUser?.name}</strong>. The user will not be able to access the system until unlocked.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lock-reason">Reason for Lock</Label>
              <Input
                id="lock-reason"
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Enter reason for locking account"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setLockDialogOpen(false);
                setSelectedUser(null);
                setLockReason('');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLockUser}
              disabled={loading || !lockReason}
            >
              {loading ? 'Locking...' : 'Lock User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Balance Adjustment Dialog */}
      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Adjust User Balance
            </DialogTitle>
            <DialogDescription>
              Adjust the balance for <strong>{selectedUser?.name}</strong>. Current balance: KES {selectedUser?.balance.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="balance-amount">Amount (KES)</Label>
              <Input
                id="balance-amount"
                type="number"
                value={balanceAdjustment.amount}
                onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter amount (positive or negative)"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance-reason">Reason</Label>
              <Input
                id="balance-reason"
                value={balanceAdjustment.reason}
                onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, reason: e.target.value })}
                placeholder="Enter reason for adjustment"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setBalanceDialogOpen(false);
                setSelectedUser(null);
                setBalanceAdjustment({ amount: 0, reason: '' });
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAdjustBalance}
              disabled={loading || !balanceAdjustment.reason}
            >
              {loading ? 'Adjusting...' : 'Adjust Balance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Change User Role
            </DialogTitle>
            <DialogDescription>
              Change the role for <strong>{selectedUser?.name}</strong>. Current role: {selectedUser?.role}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-select">New Role</Label>
              <Select value={newRole} onValueChange={(value: 'USER' | 'ADMIN') => setNewRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRoleDialogOpen(false);
                setSelectedUser(null);
                setNewRole('USER');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleChangeRole}
              disabled={loading || newRole === selectedUser?.role}
            >
              {loading ? 'Changing...' : 'Change Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
