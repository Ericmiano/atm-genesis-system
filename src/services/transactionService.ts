
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Bill } from '../types/atm';
import { authService } from './authService';
import { securityService } from './securityService';

export class TransactionService {
  async getBalance(): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await authService.getCurrentUser();
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
      const user = await authService.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (amount <= 0) {
        return { success: false, message: 'Invalid amount' };
      }

      // Fraud detection
      const fraudCheck = await securityService.detectFraudulentActivity(user.id, 'WITHDRAWAL', amount);
      if (fraudCheck.isSuspicious) {
        await this.logTransaction('WITHDRAWAL', amount, `Suspicious withdrawal blocked: ${fraudCheck.reason}`, 'FAILED');
        return { success: false, message: `Transaction blocked: ${fraudCheck.reason}` };
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
      const user = await authService.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (amount <= 0) {
        return { success: false, message: 'Invalid amount' };
      }

      // Fraud detection for large deposits
      const fraudCheck = await securityService.detectFraudulentActivity(user.id, 'DEPOSIT', amount);
      if (fraudCheck.isSuspicious) {
        await this.logTransaction('DEPOSIT', amount, `Suspicious deposit flagged: ${fraudCheck.reason}`, 'PENDING');
        // Don't block deposits, but flag for review
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
      const user = await authService.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (amount <= 0) {
        return { success: false, message: 'Invalid amount' };
      }

      // Fraud detection
      const fraudCheck = await securityService.detectFraudulentActivity(user.id, 'TRANSFER', amount);
      if (fraudCheck.isSuspicious) {
        await this.logTransaction('TRANSFER', amount, `Suspicious transfer blocked: ${fraudCheck.reason}`, 'FAILED');
        return { success: false, message: `Transaction blocked: ${fraudCheck.reason}` };
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
      const user = await authService.getCurrentUser();
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
      const user = await authService.getCurrentUser();
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
      const user = await authService.getCurrentUser();
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
}

export const transactionService = new TransactionService();
