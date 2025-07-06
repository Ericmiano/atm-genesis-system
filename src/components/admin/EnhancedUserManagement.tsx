
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserPlus, 
  Lock, 
  Unlock, 
  DollarSign, 
  UserCheck, 
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  account_number: string;
  balance: number;
  role: 'USER' | 'ADMIN';
  is_locked: boolean;
  lock_reason?: string;
  created_at: string;
  last_login?: string;
  user_profiles?: {
    kyc_status: string;
    account_tier: string;
    phone_number?: string;
  }[];
}

interface EnhancedUserManagementProps {
  users: User[];
  onUserCreated: () => void;
  onUserDeleted: () => void;
}

const EnhancedUserManagement: React.FC<EnhancedUserManagementProps> = ({
  users,
  onUserCreated,
  onUserDeleted
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showBalanceAdjust, setShowBalanceAdjust] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.account_number.includes(searchTerm);
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'locked') return matchesSearch && user.is_locked;
    if (filterStatus === 'active') return matchesSearch && !user.is_locked;
    if (filterStatus === 'admin') return matchesSearch && user.role === 'ADMIN';
    
    return matchesSearch;
  });

  const handleLockUser = async (user: User) => {
    setLoading(true);
    const reason = prompt('Enter reason for locking this account:');
    if (!reason) {
      setLoading(false);
      return;
    }

    const result = await adminService.lockUser(user.id, reason);
    if (result.success) {
      toast.success(result.message);
      onUserCreated(); // Refresh data
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleUnlockUser = async (user: User) => {
    setLoading(true);
    const result = await adminService.unlockUser(user.id);
    if (result.success) {
      toast.success(result.message);
      onUserCreated(); // Refresh data
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    const result = await adminService.deleteUser(user.id);
    if (result.success) {
      toast.success(result.message);
      onUserDeleted();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleRoleChange = async (user: User, newRole: 'USER' | 'ADMIN') => {
    setLoading(true);
    const result = await adminService.changeUserRole(user.id, newRole);
    if (result.success) {
      toast.success(result.message);
      onUserCreated(); // Refresh data
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const getKycStatus = (user: User) => {
    return user.user_profiles?.[0]?.kyc_status || 'incomplete';
  };

  const getAccountTier = (user: User) => {
    return user.user_profiles?.[0]?.account_tier || 'basic';
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <CreateUserDialog 
          isOpen={showCreateUser}
          onOpenChange={setShowCreateUser}
          onUserCreated={onUserCreated}
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or account number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active Users</SelectItem>
            <SelectItem value="locked">Locked Users</SelectItem>
            <SelectItem value="admin">Administrators</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <UserActionsMenu 
                  user={user}
                  onLock={handleLockUser}
                  onUnlock={handleUnlockUser}
                  onDelete={handleDeleteUser}
                  onRoleChange={handleRoleChange}
                  onViewDetails={setSelectedUser}
                  loading={loading}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Account Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Account Number</p>
                  <p className="font-mono">{user.account_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Balance</p>
                  <p className="font-semibold text-green-600">
                    KES {user.balance.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                  {user.role}
                </Badge>
                <Badge variant={user.is_locked ? 'destructive' : 'default'}>
                  {user.is_locked ? 'Locked' : 'Active'}
                </Badge>
                <Badge variant="outline">
                  {getKycStatus(user)}
                </Badge>
                <Badge className="capitalize">
                  {getAccountTier(user)}
                </Badge>
              </div>

              {/* Lock Reason */}
              {user.is_locked && user.lock_reason && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
                  <p className="font-medium">Lock Reason:</p>
                  <p>{user.lock_reason}</p>
                </div>
              )}

              {/* Last Login */}
              <div className="text-xs text-muted-foreground">
                Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No users found</p>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'No users match the selected filter'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onRefresh={onUserCreated}
        />
      )}

      {/* Balance Adjustment Modal */}
      {showBalanceAdjust && selectedUser && (
        <BalanceAdjustmentModal
          user={selectedUser}
          isOpen={showBalanceAdjust}
          onClose={() => setShowBalanceAdjust(false)}
          onAdjusted={onUserCreated}
        />
      )}
    </div>
  );
};

// User Actions Menu Component
const UserActionsMenu: React.FC<{
  user: User;
  onLock: (user: User) => void;
  onUnlock: (user: User) => void;
  onDelete: (user: User) => void;
  onRoleChange: (user: User, role: 'USER' | 'ADMIN') => void;
  onViewDetails: (user: User) => void;
  loading: boolean;
}> = ({ user, onLock, onUnlock, onDelete, onRoleChange, onViewDetails, loading }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Actions - {user.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            onClick={() => onViewDetails(user)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Button>
          
          {user.is_locked ? (
            <Button 
              variant="outline" 
              onClick={() => onUnlock(user)}
              className="flex items-center gap-2 text-green-600"
            >
              <Unlock className="w-4 h-4" />
              Unlock
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => onLock(user)}
              className="flex items-center gap-2 text-orange-600"
            >
              <Lock className="w-4 h-4" />
              Lock
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={() => onRoleChange(user, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
            className="flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
          </Button>

          <Button 
            variant="destructive" 
            onClick={() => onDelete(user)}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Create User Dialog Component
const CreateUserDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}> = ({ isOpen, onOpenChange, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    initialBalance: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await adminService.createUser(
      formData.email,
      formData.password,
      formData.name,
      formData.initialBalance
    );

    if (result.success) {
      toast.success(result.message);
      onUserCreated();
      onOpenChange(false);
      setFormData({ name: '', email: '', password: '', initialBalance: 0 });
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Strong password"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Initial Balance (KES)</label>
            <Input
              type="number"
              value={formData.initialBalance}
              onChange={(e) => setFormData({ ...formData, initialBalance: Number(e.target.value) })}
              placeholder="0"
              min="0"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// User Details Modal Component
const UserDetailsModal: React.FC<{
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}> = ({ user, isOpen, onClose, onRefresh }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details - {user.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {user.name}</div>
                <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
                <div><span className="text-muted-foreground">Account:</span> {user.account_number}</div>
                <div><span className="text-muted-foreground">Role:</span> {user.role}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Account Status</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Status:</span> {user.is_locked ? 'Locked' : 'Active'}</div>
                <div><span className="text-muted-foreground">Balance:</span> KES {user.balance.toLocaleString()}</div>
                <div><span className="text-muted-foreground">Created:</span> {new Date(user.created_at).toLocaleDateString()}</div>
                <div><span className="text-muted-foreground">Last Login:</span> {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          {user.user_profiles?.[0] && (
            <div>
              <h4 className="font-medium mb-2">Profile Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Phone:</span> {user.user_profiles[0].phone_number || 'Not provided'}</div>
                <div><span className="text-muted-foreground">KYC Status:</span> {user.user_profiles[0].kyc_status}</div>
                <div><span className="text-muted-foreground">Account Tier:</span> {user.user_profiles[0].account_tier}</div>
              </div>
            </div>
          )}

          {/* Lock Info */}
          {user.is_locked && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded">
              <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">Account Locked</h4>
              <p className="text-sm text-red-600 dark:text-red-400">{user.lock_reason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Balance Adjustment Modal Component
const BalanceAdjustmentModal: React.FC<{
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onAdjusted: () => void;
}> = ({ user, isOpen, onClose, onAdjusted }) => {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }

    setLoading(true);
    const result = await adminService.adjustBalance(user.id, amount, reason);
    if (result.success) {
      toast.success(result.message);
      onAdjusted();
      onClose();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Balance - {user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Balance</label>
            <p className="text-lg font-semibold text-green-600">KES {user.balance.toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Adjustment Amount (KES)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter positive or negative amount"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use negative values to deduct, positive to add
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Reason</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for adjustment"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adjusting...' : 'Adjust Balance'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedUserManagement;
