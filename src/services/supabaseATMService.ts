
import { supabase } from '@/integrations/supabase/client';
import { User, Transaction, Loan, Bill } from '../types/atm';

class SupabaseATMService {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      accountNumber: data.account_number,
      username: data.username,
      password: '', // Don't expose password
      name: data.name,
      email: data.email,
      pin: data.pin,
      balance: parseFloat(data.balance.toString()),
      role: data.role as 'USER' | 'ADMIN',
      isLocked: data.is_locked,
      lockReason: data.lock_reason,
      lockDate: data.lock_date,
      failedAttempts: data.failed_attempts,
      failedPasswordAttempts: data.failed_password_attempts,
      lastPasswordAttempt: data.last_password_attempt,
      createdAt: data.created_at,
      lastLogin: data.last_login,
      creditScore: data.credit_score,
      monthlyIncome: data.monthly_income ? parseFloat(data.monthly_income.toString()) : undefined,
      cardNumber: data.card_number,
      expiryDate: data.expiry_date,
      cvv: data.cvv,
      cardType: data.card_type as 'VISA' | 'MASTERCARD',
      passwordLastChanged: data.password_last_changed,
      mustChangePassword: data.must_change_password
    };
  }

  async authenticate(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Check if account is locked
        const { data: userData } = await supabase
          .from('users')
          .select('is_locked, lock_reason, failed_password_attempts')
          .eq('email', email)
          .single();

        if (userData?.is_locked) {
          return { success: false, message: userData.lock_reason || 'Account is locked' };
        }

        // Increment failed attempts
        if (userData) {
          await supabase
            .from('users')
            .update({ 
              failed_password_attempts: userData.failed_password_attempts + 1,
              last_password_attempt: new Date().toISOString()
            })
            .eq('email', email);
        }

        return { success: false, message: 'Invalid credentials' };
      }

      if (data.user) {
        // Update last login and reset failed attempts
        await supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            failed_password_attempts: 0
          })
          .eq('id', data.user.id);

        const user = await this.getCurrentUser();
        if (user) {
          // Log audit trail
          await this.logAuditTrail('LOGIN', 'User logged in successfully');
          return { success: true, message: 'Login successful', user };
        }
      }

      return { success: false, message: 'Authentication failed' };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  }

  async verifyPin(pin: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (user.pin === pin) {
        await this.logAuditTrail('PIN_VERIFICATION', 'PIN verified successfully');
        return { success: true, message: 'PIN verified' };
      } else {
        // Increment failed PIN attempts
        await supabase
          .from('users')
          .update({ failed_attempts: user.failedAttempts + 1 })
          .eq('id', user.id);

        await this.logAuditTrail('PIN_VERIFICATION_FAILED', 'Invalid PIN entered');
        return { success: false, message: 'Invalid PIN' };
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  async getBalance(): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      await this.logTransaction('BALANCE_INQUIRY', 0, 'Balance inquiry');
      return { success: true, balance: user.balance, message: 'Balance retrieved successfully' };
    } catch (error) {
      console.error('Get balance error:', error);
      return { success: false, message: 'Failed to retrieve balance' };
    }
  }

  async withdraw(amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (amount <= 0) {
        return { success: false, message: 'Invalid amount' };
      }

      if (user.balance < amount) {
        await this.logTransaction('WITHDRAWAL', amount, 'Insufficient funds', 'FAILED');
        return { success: false, message: 'Insufficient funds' };
      }

      const newBalance = user.balance - amount;

      // Update user balance
      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (error) throw error;

      // Log transaction
      await this.logTransaction('WITHDRAWAL', amount, `Cash withdrawal of KES ${amount.toLocaleString()}`);

      return { success: true, balance: newBalance, message: `Successfully withdrew KES ${amount.toLocaleString()}` };
    } catch (error) {
      console.error('Withdrawal error:', error);
      return { success: false, message: 'Withdrawal failed' };
    }
  }

  async deposit(amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (amount <= 0) {
        return { success: false, message: 'Invalid amount' };
      }

      const newBalance = user.balance + amount;

      // Update user balance
      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (error) throw error;

      // Log transaction
      await this.logTransaction('DEPOSIT', amount, `Cash deposit of KES ${amount.toLocaleString()}`);

      return { success: true, balance: newBalance, message: `Successfully deposited KES ${amount.toLocaleString()}` };
    } catch (error) {
      console.error('Deposit error:', error);
      return { success: false, message: 'Deposit failed' };
    }
  }

  async transfer(toAccount: string, amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (amount <= 0) {
        return { success: false, message: 'Invalid amount' };
      }

      if (user.balance < amount) {
        return { success: false, message: 'Insufficient funds' };
      }

      // Check if target account exists
      const { data: targetUser } = await supabase
        .from('users')
        .select('id, name')
        .eq('account_number', toAccount)
        .single();

      if (!targetUser) {
        return { success: false, message: 'Target account not found' };
      }

      // Perform transfer (this should be in a transaction)
      const newBalance = user.balance - amount;

      await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      // Update target user balance
      const { data: targetUserBalance } = await supabase
        .from('users')
        .select('balance')
        .eq('id', targetUser.id)
        .single();

      if (targetUserBalance) {
        const targetNewBalance = parseFloat(targetUserBalance.balance.toString()) + amount;
        await supabase
          .from('users')
          .update({ balance: targetNewBalance })
          .eq('id', targetUser.id);
      }

      // Log transactions
      await this.logTransaction('TRANSFER', amount, `Transfer to ${targetUser.name} (${toAccount})`, 'SUCCESS', user.accountNumber, toAccount);

      return { success: true, balance: newBalance, message: `Successfully transferred KES ${amount.toLocaleString()} to ${targetUser.name}` };
    } catch (error) {
      console.error('Transfer error:', error);
      return { success: false, message: 'Transfer failed' };
    }
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.map(t => ({
        id: t.id,
        userId: t.user_id,
        type: t.type as Transaction['type'],
        amount: parseFloat(t.amount.toString()),
        description: t.description,
        timestamp: t.timestamp,
        status: t.status as Transaction['status'],
        fromAccount: t.from_account,
        toAccount: t.to_account,
        loanId: t.loan_id
      }));
    } catch (error) {
      console.error('Get transaction history error:', error);
      return [];
    }
  }

  async getBills(): Promise<Bill[]> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      return data.map(b => ({
        id: b.id,
        type: b.type as Bill['type'],
        name: b.name,
        amount: parseFloat(b.amount.toString()),
        dueDate: b.due_date
      }));
    } catch (error) {
      console.error('Get bills error:', error);
      return [];
    }
  }

  async payBill(billId: string, amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (user.balance < amount) {
        return { success: false, message: 'Insufficient funds' };
      }

      const { data: bill } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();

      if (!bill) {
        return { success: false, message: 'Bill not found' };
      }

      const newBalance = user.balance - amount;

      await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      await this.logTransaction('BILL_PAYMENT', amount, `Payment for ${bill.name}`);

      return { success: true, balance: newBalance, message: `Successfully paid ${bill.name}` };
    } catch (error) {
      console.error('Bill payment error:', error);
      return { success: false, message: 'Bill payment failed' };
    }
  }

  private async logTransaction(
    type: Transaction['type'], 
    amount: number, 
    description: string, 
    status: Transaction['status'] = 'SUCCESS',
    fromAccount?: string,
    toAccount?: string
  ): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type,
          amount,
          description,
          status,
          from_account: fromAccount,
          to_account: toAccount
        });
    } catch (error) {
      console.error('Log transaction error:', error);
    }
  }

  private async logAuditTrail(action: string, details: string): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action,
          details
        });
    } catch (error) {
      console.error('Log audit trail error:', error);
    }
  }

  async logout(): Promise<void> {
    await this.logAuditTrail('LOGOUT', 'User logged out');
    await supabase.auth.signOut();
  }
}

export const supabaseATMService = new SupabaseATMService();
