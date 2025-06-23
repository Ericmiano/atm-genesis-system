
import { User, Transaction, Bill, Loan, AuditLog, FraudAlert, AdminAction } from '../types/atm';
import { authService } from './authService';
import { transactionService } from './transactionService';
import { userService } from './userService';
import { adminService } from './adminService';
import { auditService } from './auditService';
import { loanService } from './loanService';
import { supabase } from '../integrations/supabase/client';

class SupabaseATMService {
  // Authentication methods
  async getCurrentUser(): Promise<User | null> {
    return authService.getCurrentUser();
  }

  async authenticate(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    const result = await authService.authenticate(email, password);
    if (result.success) {
      await auditService.logAuditTrail('LOGIN', 'User logged in successfully');
    }
    return result;
  }

  async verifyPin(pin: string): Promise<{ success: boolean; message: string }> {
    const result = await authService.verifyPin(pin);
    if (result.success) {
      await auditService.logAuditTrail('PIN_VERIFICATION', 'PIN verified successfully');
    } else {
      await auditService.logAuditTrail('PIN_VERIFICATION_FAILED', 'Invalid PIN entered');
    }
    return result;
  }

  async logout(): Promise<void> {
    await auditService.logAuditTrail('LOGOUT', 'User logged out');
    await authService.logout();
  }

  // Transaction methods
  async getBalance(): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.getBalance();
  }

  async withdraw(amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.withdraw(amount);
  }

  async deposit(amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.deposit(amount);
  }

  async transfer(toAccount: string, amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.transfer(toAccount, amount);
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    return transactionService.getTransactionHistory();
  }

  async getBills(): Promise<Bill[]> {
    return transactionService.getBills();
  }

  async getAvailableBills(): Promise<Bill[]> {
    return transactionService.getBills();
  }

  async payBill(billId: string, amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.payBill(billId, amount);
  }

  // Loan methods
  async getUserLoans(): Promise<Loan[]> {
    return loanService.getUserLoans();
  }

  async getAllLoans(): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('application_date', { ascending: false });

      if (error) {
        console.error('Error fetching all loans:', error);
        return [];
      }

      // Map database fields to TypeScript interface
      return (data || []).map(loan => ({
        id: loan.id,
        userId: loan.user_id,
        type: loan.type as Loan['type'],
        principal: parseFloat(loan.principal.toString()),
        interestRate: parseFloat(loan.interest_rate.toString()),
        termMonths: loan.term_months,
        monthlyPayment: parseFloat(loan.monthly_payment.toString()),
        totalAmount: parseFloat(loan.total_amount.toString()),
        remainingBalance: parseFloat(loan.remaining_balance.toString()),
        status: loan.status as Loan['status'],
        applicationDate: loan.application_date,
        approvalDate: loan.approval_date,
        disbursementDate: loan.disbursement_date,
        nextPaymentDate: loan.next_payment_date,
        collateral: loan.collateral,
        purpose: loan.purpose
      }));
    } catch (error) {
      console.error('Error fetching all loans:', error);
      return [];
    }
  }

  async applyForLoan(
    type: Loan['type'],
    amount: number,
    termMonths: number,
    purpose: string,
    collateral?: string
  ): Promise<{ success: boolean; message: string; loan?: Loan }> {
    return loanService.applyForLoan(type, amount, termMonths, purpose, collateral);
  }

  async makePayment(loanId: string, amount: number): Promise<{ success: boolean; message: string; balance?: number }> {
    return loanService.makePayment(loanId, amount);
  }

  async approveLoan(loanId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .update({ 
          status: 'APPROVED',
          approval_date: new Date().toISOString()
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) {
        console.error('Error approving loan:', error);
        return { success: false, message: error.message };
      }

      await auditService.logAuditTrail('LOAN_APPROVED', `Loan ${loanId} approved`);
      return { success: true, message: 'Loan approved successfully' };
    } catch (error) {
      console.error('Error approving loan:', error);
      return { success: false, message: 'Failed to approve loan' };
    }
  }

  async rejectLoan(loanId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .update({ 
          status: 'REJECTED',
          approval_date: new Date().toISOString()
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) {
        console.error('Error rejecting loan:', error);
        return { success: false, message: error.message };
      }

      await auditService.logAuditTrail('LOAN_REJECTED', `Loan ${loanId} rejected: ${reason}`);
      return { success: true, message: 'Loan rejected successfully' };
    } catch (error) {
      console.error('Error rejecting loan:', error);
      return { success: false, message: 'Failed to reject loan' };
    }
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    return userService.getAllUsers();
  }

  // Admin methods
  async createUser(email: string, password: string, name: string, initialBalance: number = 0): Promise<{ success: boolean; message: string; userId?: string }> {
    const result = await adminService.createUser(email, password, name, initialBalance);
    if (result.success) {
      await auditService.logAuditTrail('CREATE_USER', `Created user account for ${email}`);
    }
    return result;
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const result = await adminService.deleteUser(userId);
    if (result.success) {
      await auditService.logAuditTrail('DELETE_USER', `Deleted user account ${userId}`);
    }
    return result;
  }

  // Audit and monitoring methods
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  async getFraudAlerts(): Promise<FraudAlert[]> {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching fraud alerts:', error);
        return [];
      }

      // Map database fields to TypeScript interface
      return (data || []).map(alert => ({
        id: alert.id,
        userId: alert.user_id,
        type: alert.type as FraudAlert['type'],
        description: alert.description,
        timestamp: alert.timestamp,
        severity: alert.severity as FraudAlert['severity'],
        resolved: alert.resolved
      }));
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      return [];
    }
  }

  async resolveFraudAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .update({ resolved: true })
        .eq('id', alertId)
        .select()
        .single();

      if (error) {
        console.error('Error resolving fraud alert:', error);
        return { success: false, message: error.message };
      }

      await auditService.logAuditTrail('FRAUD_ALERT_RESOLVED', `Fraud alert ${alertId} resolved`);
      return { success: true, message: 'Fraud alert resolved successfully' };
    } catch (error) {
      console.error('Error resolving fraud alert:', error);
      return { success: false, message: 'Failed to resolve fraud alert' };
    }
  }

  async getAdminActions(): Promise<AdminAction[]> {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching admin actions:', error);
        return [];
      }

      // Map database fields to TypeScript interface
      return (data || []).map(action => ({
        id: action.id,
        adminId: action.admin_id,
        action: action.action as AdminAction['action'],
        targetUserId: action.target_user_id,
        targetLoanId: action.target_loan_id,
        details: action.details,
        timestamp: action.timestamp,
        reason: action.reason
      }));
    } catch (error) {
      console.error('Error fetching admin actions:', error);
      return [];
    }
  }

  async logAdminAction(
    action: AdminAction['action'],
    details: string,
    targetUserId?: string,
    targetLoanId?: string,
    reason?: string
  ): Promise<void> {
    try {
      const currentUser = await this.getCurrentUser();
      
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser?.id,
          action,
          target_user_id: targetUserId,
          target_loan_id: targetLoanId,
          details,
          reason,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  // System monitoring methods
  async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalVolume: number;
    pendingLoans: number;
    fraudAlerts: number;
  }> {
    try {
      const [users, transactions, loans, fraudAlerts] = await Promise.all([
        this.getAllUsers(),
        this.getTransactionHistory(),
        this.getAllLoans(),
        this.getFraudAlerts()
      ]);

      const activeUsers = users.filter(user => !user.isLocked).length;
      const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
      const pendingLoans = loans.filter(loan => loan.status === 'PENDING').length;

      return {
        totalUsers: users.length,
        activeUsers,
        totalTransactions: transactions.length,
        totalVolume,
        pendingLoans,
        fraudAlerts: fraudAlerts.length
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalTransactions: 0,
        totalVolume: 0,
        pendingLoans: 0,
        fraudAlerts: 0
      };
    }
  }

  // Security settings methods (mock implementation since table doesn't exist)
  async updateSecuritySettings(settings: {
    maxFailedAttempts: number;
    lockoutDuration: number;
    passwordExpiryDays: number;
    sessionTimeout: number;
    requireMFA: boolean;
    enableFraudDetection: boolean;
    enableAuditLogging: boolean;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Mock implementation - in reality would need security_settings table
      console.log('Security settings updated:', settings);
      await auditService.logAuditTrail('SECURITY_SETTINGS_UPDATED', 'Security settings modified');
      return { success: true, message: 'Security settings updated successfully' };
    } catch (error) {
      console.error('Error updating security settings:', error);
      return { success: false, message: 'Failed to update security settings' };
    }
  }

  async getSecuritySettings(): Promise<{
    maxFailedAttempts: number;
    lockoutDuration: number;
    passwordExpiryDays: number;
    sessionTimeout: number;
    requireMFA: boolean;
    enableFraudDetection: boolean;
    enableAuditLogging: boolean;
  } | null> {
    try {
      // Mock implementation - return default values
      return {
        maxFailedAttempts: 3,
        lockoutDuration: 30,
        passwordExpiryDays: 90,
        sessionTimeout: 15,
        requireMFA: false,
        enableFraudDetection: true,
        enableAuditLogging: true
      };
    } catch (error) {
      console.error('Error fetching security settings:', error);
      return null;
    }
  }

  // Advanced user management methods
  async lockUser(userId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_locked: true,
          lock_reason: reason,
          lock_date: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error locking user:', error);
        return { success: false, message: error.message };
      }

      await auditService.logAuditTrail('USER_LOCKED', `User ${userId} locked: ${reason}`);
      await this.logAdminAction('SUSPEND_USER', `User locked: ${reason}`, userId, undefined, reason);
      return { success: true, message: 'User locked successfully' };
    } catch (error) {
      console.error('Error locking user:', error);
      return { success: false, message: 'Failed to lock user' };
    }
  }

  async unlockUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_locked: false,
          lock_reason: null,
          lock_date: null,
          failed_attempts: 0
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error unlocking user:', error);
        return { success: false, message: error.message };
      }

      await auditService.logAuditTrail('USER_UNLOCKED', `User ${userId} unlocked`);
      await this.logAdminAction('ACTIVATE_USER', 'User unlocked', userId, undefined, 'Admin unlock');
      return { success: true, message: 'User unlocked successfully' };
    } catch (error) {
      console.error('Error unlocking user:', error);
      return { success: false, message: 'Failed to unlock user' };
    }
  }

  async adjustUserBalance(userId: string, amount: number, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get current user balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user balance:', userError);
        return { success: false, message: userError.message };
      }

      const newBalance = user.balance + amount;
      if (newBalance < 0) {
        return { success: false, message: 'Insufficient balance for adjustment' };
      }

      // Update user balance
      const { data, error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error adjusting user balance:', error);
        return { success: false, message: error.message };
      }

      // Log the transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: amount > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
          amount: Math.abs(amount),
          description: `Admin adjustment: ${reason}`,
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });

      await auditService.logAuditTrail('BALANCE_ADJUSTED', `User ${userId} balance adjusted by ${amount}: ${reason}`);
      await this.logAdminAction('ADJUST_BALANCE', `Balance adjusted by ${amount}`, userId, undefined, reason);
      return { success: true, message: 'Balance adjusted successfully' };
    } catch (error) {
      console.error('Error adjusting user balance:', error);
      return { success: false, message: 'Failed to adjust balance' };
    }
  }

  async changeUserRole(userId: string, newRole: 'USER' | 'ADMIN'): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error changing user role:', error);
        return { success: false, message: error.message };
      }

      await auditService.logAuditTrail('ROLE_CHANGED', `User ${userId} role changed to ${newRole}`);
      await this.logAdminAction('CHANGE_ROLE' as AdminAction['action'], `Role changed to ${newRole}`, userId, undefined, 'Admin role change');
      return { success: true, message: 'User role changed successfully' };
    } catch (error) {
      console.error('Error changing user role:', error);
      return { success: false, message: 'Failed to change user role' };
    }
  }
}

export const supabaseATMService = new SupabaseATMService();
