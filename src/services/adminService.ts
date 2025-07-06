
import { supabase } from '@/integrations/supabase/client';

export class AdminService {
  async createUser(email: string, password: string, name: string, initialBalance: number = 0): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      const { data, error } = await supabase.rpc('create_user_account', {
        user_email: email,
        user_password: password,
        user_name: name,
        initial_balance: initialBalance
      });

      if (error) {
        console.error('Create user error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'User created successfully', userId: data };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, message: 'Failed to create user' };
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('delete_user_account', {
        target_user_id: userId
      });

      if (error) {
        console.error('Delete user error:', error);
        return { success: false, message: error.message };
      }

      if (!data) {
        return { success: false, message: 'Failed to delete user account' };
      }

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, message: 'Failed to delete user' };
    }
  }

  async lockUser(userId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('lock_user_account', {
        target_user_id: userId,
        reason: reason
      });

      if (error) {
        console.error('Lock user error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'User locked successfully' };
    } catch (error) {
      console.error('Lock user error:', error);
      return { success: false, message: 'Failed to lock user' };
    }
  }

  async unlockUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('unlock_user_account', {
        target_user_id: userId
      });

      if (error) {
        console.error('Unlock user error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'User unlocked successfully' };
    } catch (error) {
      console.error('Unlock user error:', error);
      return { success: false, message: 'Failed to unlock user' };
    }
  }

  async adjustBalance(userId: string, amount: number, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('adjust_user_balance', {
        target_user_id: userId,
        adjustment_amount: amount,
        reason: reason
      });

      if (error) {
        console.error('Adjust balance error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Balance adjusted successfully' };
    } catch (error) {
      console.error('Adjust balance error:', error);
      return { success: false, message: 'Failed to adjust balance' };
    }
  }

  async changeUserRole(userId: string, newRole: 'USER' | 'ADMIN'): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('change_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (error) {
        console.error('Change role error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'User role changed successfully' };
    } catch (error) {
      console.error('Change role error:', error);
      return { success: false, message: 'Failed to change user role' };
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles (
            phone_number,
            date_of_birth,
            gender,
            nationality,
            kyc_status,
            account_tier
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get users error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  }

  async getTransactionHistory(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          users (
            name,
            email,
            account_number
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Get transactions error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get transactions error:', error);
      return [];
    }
  }

  async getAllLoans(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          users (
            name,
            email,
            account_number
          )
        `)
        .order('application_date', { ascending: false });

      if (error) {
        console.error('Get loans error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get loans error:', error);
      return [];
    }
  }

  async getAuditLogs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Get audit logs error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get audit logs error:', error);
      return [];
    }
  }

  async getFraudAlerts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select(`
          *,
          users (
            name,
            email,
            account_number
          )
        `)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Get fraud alerts error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get fraud alerts error:', error);
      return [];
    }
  }

  async resolveFraudAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('fraud_alerts')
        .update({ resolved: true })
        .eq('id', alertId);

      if (error) {
        console.error('Resolve fraud alert error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Fraud alert resolved successfully' };
    } catch (error) {
      console.error('Resolve fraud alert error:', error);
      return { success: false, message: 'Failed to resolve fraud alert' };
    }
  }

  async approveLoan(loanId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ 
          status: 'APPROVED',
          approval_date: new Date().toISOString()
        })
        .eq('id', loanId);

      if (error) {
        console.error('Approve loan error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Loan approved successfully' };
    } catch (error) {
      console.error('Approve loan error:', error);
      return { success: false, message: 'Failed to approve loan' };
    }
  }

  async rejectLoan(loanId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ 
          status: 'REJECTED'
        })
        .eq('id', loanId);

      if (error) {
        console.error('Reject loan error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Loan rejected successfully' };
    } catch (error) {
      console.error('Reject loan error:', error);
      return { success: false, message: 'Failed to reject loan' };
    }
  }
}

export const adminService = new AdminService();
