
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { User } from '../types/atm';
import { supabaseATMService } from '../services/supabaseATMService';
import { UserPlus, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UserManagementProps {
  users: User[];
  onUserCreated: () => void;
  onUserDeleted: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUserCreated, onUserDeleted }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Create user form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    initialBalance: 0
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
        setNewUser({ email: '', password: '', name: '', initialBalance: 0 });
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

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Management</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account that can immediately access the ATM system.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user, index) => (
          <Card 
            key={user.id} 
            className="animate-fade-in transition-all duration-200 hover:scale-105"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{user.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    {user.role !== 'ADMIN' && (
                      <Button
                        onClick={() => openDeleteDialog(user)}
                        size="sm"
                        variant="destructive"
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Account:</span> {user.accountNumber}</p>
                  <p><span className="font-medium">Balance:</span> KES {user.balance.toLocaleString()}</p>
                  <p><span className="font-medium">Failed Attempts:</span> {user.failedAttempts}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={user.isLocked ? 'destructive' : 'default'}>
                    {user.isLocked ? 'Locked' : 'Active'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
};

export default UserManagement;
