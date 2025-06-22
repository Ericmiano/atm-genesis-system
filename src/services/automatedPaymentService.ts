import { supabase } from '../integrations/supabase/client';
import { OverdraftService } from './overdraftService';
import { CreditScoreService } from './creditScoreService';

export interface AutomatedPayment {
  id: string;
  userId: string;
  type: 'bill' | 'loan';
  targetId: string; // bill_id or loan_id
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'insufficient_funds';
  scheduledDate: Date;
  processedAt?: Date;
  errorMessage?: string;
}

export interface PaymentNotification {
  id: string;
  userId: string;
  type: 'insufficient_funds' | 'payment_success' | 'payment_failed';
  title: string;
  message: string;
  relatedPaymentId?: string;
  isRead: boolean;
  createdAt: Date;
}

export class AutomatedPaymentService {
  /**
   * Process all pending automated payments for a user
   */
  static async processAutomatedPayments(userId: string): Promise<{
    processed: number;
    successful: number;
    failed: number;
    insufficient: number;
  }> {
    try {
      const { data: pendingPayments, error } = await supabase
        .from('automated_payments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .lte('scheduled_date', new Date().toISOString());

      if (error) throw error;

      let processed = 0;
      let successful = 0;
      let failed = 0;
      let insufficient = 0;

      for (const payment of pendingPayments || []) {
        const result = await this.processSinglePayment(payment);
        
        processed++;
        switch (result.status) {
          case 'completed':
            successful++;
            break;
          case 'insufficient_funds':
            insufficient++;
            break;
          case 'failed':
            failed++;
            break;
        }
      }

      return { processed, successful, failed, insufficient };
    } catch (error) {
      console.error('Error processing automated payments:', error);
      return { processed: 0, successful: 0, failed: 0, insufficient: 0 };
    }
  }

  /**
   * Process a single automated payment
   */
  private static async processSinglePayment(payment: any): Promise<{ status: string; error?: string }> {
    try {
      // Get user's current balance
      const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', payment.user_id)
        .single();

      if (!account) {
        return { status: 'failed', error: 'Account not found' };
      }

      const currentBalance = account.balance || 0;

      if (currentBalance >= payment.amount) {
        // Sufficient funds - process payment
        return await this.executePayment(payment, currentBalance);
      } else {
        // Insufficient funds - check overdraft protection
        const overdraftResult = await OverdraftService.processOverdraftTransaction(
          payment.user_id,
          payment.amount,
          currentBalance
        );

        if (overdraftResult.allowed) {
          // Use overdraft protection
          return await this.executePaymentWithOverdraft(payment, currentBalance, overdraftResult);
        } else {
          // Insufficient funds and no overdraft protection
          await this.markPaymentInsufficient(payment);
          await this.createNotification(payment.user_id, {
            type: 'insufficient_funds',
            title: 'Insufficient Funds for Automated Payment',
            message: `Your automated ${payment.type} payment of KES ${payment.amount.toLocaleString()} could not be processed due to insufficient funds. Please add funds to your account.`,
            relatedPaymentId: payment.id
          });
          return { status: 'insufficient_funds', error: 'Insufficient funds' };
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      await this.markPaymentFailed(payment, error.message);
      return { status: 'failed', error: error.message };
    }
  }

  /**
   * Execute payment with sufficient funds
   */
  private static async executePayment(payment: any, currentBalance: number): Promise<{ status: string; error?: string }> {
    const { error } = await supabase.rpc('execute_automated_payment', {
      payment_id: payment.id,
      user_id: payment.user_id,
      payment_amount: payment.amount,
      payment_type: payment.type,
      target_id: payment.target_id
    });

    if (error) {
      await this.markPaymentFailed(payment, error.message);
      return { status: 'failed', error: error.message };
    }

    await this.markPaymentCompleted(payment);
    await this.createNotification(payment.user_id, {
      type: 'payment_success',
      title: 'Automated Payment Successful',
      message: `Your automated ${payment.type} payment of KES ${payment.amount.toLocaleString()} has been processed successfully.`,
      relatedPaymentId: payment.id
    });

    return { status: 'completed' };
  }

  /**
   * Execute payment using overdraft protection
   */
  private static async executePaymentWithOverdraft(
    payment: any, 
    currentBalance: number, 
    overdraftResult: any
  ): Promise<{ status: string; error?: string }> {
    try {
      // First, use available balance
      const balanceToUse = Math.min(currentBalance, payment.amount);
      const overdraftNeeded = payment.amount - balanceToUse;

      // Execute payment with overdraft
      const { error } = await supabase.rpc('execute_automated_payment_with_overdraft', {
        payment_id: payment.id,
        user_id: payment.user_id,
        payment_amount: payment.amount,
        balance_used: balanceToUse,
        overdraft_amount: overdraftNeeded,
        payment_type: payment.type,
        target_id: payment.target_id
      });

      if (error) {
        await this.markPaymentFailed(payment, error.message);
        return { status: 'failed', error: error.message };
      }

      await this.markPaymentCompleted(payment);
      await this.createNotification(payment.user_id, {
        type: 'payment_success',
        title: 'Automated Payment Completed with Overdraft',
        message: `Your automated ${payment.type} payment of KES ${payment.amount.toLocaleString()} was processed using overdraft protection. Overdraft amount: KES ${overdraftNeeded.toLocaleString()}`,
        relatedPaymentId: payment.id
      });

      return { status: 'completed' };
    } catch (error) {
      await this.markPaymentFailed(payment, error.message);
      return { status: 'failed', error: error.message };
    }
  }

  /**
   * Schedule automated bill payment
   */
  static async scheduleBillPayment(
    userId: string,
    billId: string,
    amount: number,
    scheduledDate: Date
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('automated_payments')
        .insert({
          user_id: userId,
          type: 'bill',
          target_id: billId,
          amount,
          status: 'pending',
          scheduled_date: scheduledDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, paymentId: data.id };
    } catch (error) {
      console.error('Error scheduling bill payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule automated loan repayment
   */
  static async scheduleLoanRepayment(
    userId: string,
    loanId: string,
    amount: number,
    scheduledDate: Date
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('automated_payments')
        .insert({
          user_id: userId,
          type: 'loan',
          target_id: loanId,
          amount,
          status: 'pending',
          scheduled_date: scheduledDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, paymentId: data.id };
    } catch (error) {
      console.error('Error scheduling loan repayment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's automated payment history
   */
  static async getPaymentHistory(userId: string): Promise<AutomatedPayment[]> {
    try {
      const { data, error } = await supabase
        .from('automated_payments')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data?.map(payment => ({
        ...payment,
        scheduledDate: new Date(payment.scheduled_date),
        processedAt: payment.processed_at ? new Date(payment.processed_at) : undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  /**
   * Get pending automated payments
   */
  static async getPendingPayments(userId: string): Promise<AutomatedPayment[]> {
    try {
      const { data, error } = await supabase
        .from('automated_payments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      return data?.map(payment => ({
        ...payment,
        scheduledDate: new Date(payment.scheduled_date),
        processedAt: payment.processed_at ? new Date(payment.processed_at) : undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  }

  /**
   * Cancel a scheduled payment
   */
  static async cancelPayment(paymentId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('automated_payments')
        .update({ status: 'cancelled' })
        .eq('id', paymentId)
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error cancelling payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user notifications
   */
  static async getNotifications(userId: string): Promise<PaymentNotification[]> {
    try {
      const { data, error } = await supabase
        .from('payment_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data?.map(notification => ({
        ...notification,
        createdAt: new Date(notification.created_at)
      })) || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string, userId: string): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('payment_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false };
    }
  }

  /**
   * Setup recurring bill payments
   */
  static async setupRecurringBillPayment(
    userId: string,
    billId: string,
    amount: number,
    frequency: 'weekly' | 'monthly' | 'quarterly',
    startDate: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create multiple scheduled payments based on frequency
      const payments = this.generateRecurringPayments(startDate, frequency, 12); // 12 payments ahead

      for (const paymentDate of payments) {
        await this.scheduleBillPayment(userId, billId, amount, paymentDate);
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting up recurring payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup recurring loan repayments
   */
  static async setupRecurringLoanRepayment(
    userId: string,
    loanId: string,
    amount: number,
    frequency: 'weekly' | 'monthly',
    startDate: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const payments = this.generateRecurringPayments(startDate, frequency, 24); // 24 payments ahead

      for (const paymentDate of payments) {
        await this.scheduleLoanRepayment(userId, loanId, amount, paymentDate);
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting up recurring loan repayment:', error);
      return { success: false, error: error.message };
    }
  }

  private static generateRecurringPayments(startDate: Date, frequency: string, count: number): Date[] {
    const payments: Date[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
      payments.push(new Date(currentDate));
      
      switch (frequency) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'quarterly':
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
      }
    }

    return payments;
  }

  private static async markPaymentCompleted(payment: any): Promise<void> {
    await supabase
      .from('automated_payments')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', payment.id);
  }

  private static async markPaymentFailed(payment: any, errorMessage: string): Promise<void> {
    await supabase
      .from('automated_payments')
      .update({
        status: 'failed',
        processed_at: new Date().toISOString(),
        error_message: errorMessage
      })
      .eq('id', payment.id);
  }

  private static async markPaymentInsufficient(payment: any): Promise<void> {
    await supabase
      .from('automated_payments')
      .update({
        status: 'insufficient_funds',
        processed_at: new Date().toISOString()
      })
      .eq('id', payment.id);
  }

  private static async createNotification(
    userId: string, 
    notification: Omit<PaymentNotification, 'id' | 'userId' | 'isRead' | 'createdAt'>
  ): Promise<void> {
    await supabase
      .from('payment_notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        related_payment_id: notification.relatedPaymentId,
        is_read: false
      });
  }
} 