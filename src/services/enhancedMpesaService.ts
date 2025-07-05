
import { supabase } from '@/integrations/supabase/client';
import { authService } from './authService';

export interface MpesaTransactionRequest {
  type: 'SEND_MONEY' | 'PAYBILL' | 'BUY_GOODS' | 'BUY_AIRTIME' | 'WITHDRAW' | 'DEPOSIT';
  amount: number;
  recipient: string;
  recipientName?: string;
  accountNumber?: string;
  businessNumber?: string;
  tillNumber?: string;
  phoneNumber?: string;
  description: string;
}

export interface MpesaTransaction {
  id: string;
  userId: string;
  transactionType: 'SEND_MONEY' | 'PAYBILL' | 'BUY_GOODS' | 'BUY_AIRTIME' | 'WITHDRAW' | 'DEPOSIT';
  amount: number;
  recipient: string;
  recipientName?: string;
  accountNumber?: string;
  businessNumber?: string;
  tillNumber?: string;
  phoneNumber?: string;
  description: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  referenceCode: string;
  mpesaReceiptNumber?: string;
  transactionCost: number;
  createdAt: string;
  completedAt?: string;
}

export class EnhancedMpesaService {
  private calculateTransactionCost(type: string, amount: number): number {
    // M-Pesa transaction costs based on amount ranges
    switch (type) {
      case 'SEND_MONEY':
        if (amount <= 100) return 11;
        if (amount <= 500) return 22;
        if (amount <= 1000) return 29;
        if (amount <= 1500) return 29;
        if (amount <= 2500) return 45;
        if (amount <= 3500) return 52;
        if (amount <= 5000) return 69;
        if (amount <= 7500) return 87;
        if (amount <= 10000) return 115;
        if (amount <= 15000) return 167;
        if (amount <= 20000) return 185;
        if (amount <= 35000) return 197;
        if (amount <= 50000) return 278;
        return 309;
      
      case 'WITHDRAW':
        if (amount <= 100) return 28;
        if (amount <= 500) return 28;
        if (amount <= 1000) return 28;
        if (amount <= 1500) return 28;
        if (amount <= 2500) return 28;
        if (amount <= 3500) return 52;
        if (amount <= 5000) return 69;
        if (amount <= 7500) return 87;
        if (amount <= 10000) return 115;
        if (amount <= 15000) return 167;
        if (amount <= 20000) return 185;
        if (amount <= 35000) return 197;
        if (amount <= 50000) return 278;
        return 309;
      
      case 'PAYBILL':
      case 'BUY_GOODS':
        return 0; // Usually free for most merchants
      
      case 'BUY_AIRTIME':
        return 0; // Free
      
      case 'DEPOSIT':
        return 0; // Free
      
      default:
        return 0;
    }
  }

  private async generateReferenceCode(): Promise<string> {
    try {
      // Call the database function to generate unique reference
      const { data, error } = await supabase.rpc('generate_mpesa_reference');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating reference code:', error);
      // Fallback to local generation
      return 'MP' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  }

  async sendMoney(request: MpesaTransactionRequest): Promise<{ success: boolean; transaction?: MpesaTransaction; error?: string }> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Validate phone number format (Kenyan)
      const phoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/;
      if (!phoneRegex.test(request.recipient)) {
        return { success: false, error: 'Invalid phone number format' };
      }

      // Check user balance
      if (user.balance < request.amount) {
        return { success: false, error: 'Insufficient balance' };
      }

      const transactionCost = this.calculateTransactionCost('SEND_MONEY', request.amount);
      const totalCost = request.amount + transactionCost;

      if (user.balance < totalCost) {
        return { success: false, error: `Insufficient balance. Total cost: KSh ${totalCost} (Amount: KSh ${request.amount} + Fee: KSh ${transactionCost})` };
      }

      const referenceCode = await this.generateReferenceCode();

      // Create transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'SEND_MONEY',
          amount: request.amount,
          recipient: request.recipient,
          recipient_name: request.recipientName,
          phone_number: request.recipient,
          description: request.description,
          status: 'PENDING',
          reference_code: referenceCode,
          transaction_cost: transactionCost
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Simulate M-Pesa API call
      const mpesaResult = await this.simulateMpesaAPI('SEND_MONEY', {
        amount: request.amount,
        recipient: request.recipient,
        reference: referenceCode
      });

      if (mpesaResult.success) {
        // Update user balance
        await supabase
          .from('users')
          .update({ balance: user.balance - totalCost })
          .eq('id', user.id);

        // Update transaction status
        await supabase
          .from('mpesa_transactions')
          .update({
            status: 'SUCCESS',
            mpesa_receipt_number: mpesaResult.receiptNumber,
            completed_at: new Date().toISOString()
          })
          .eq('id', transactionData.id);

        // Create transaction record in main transactions table
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'TRANSFER',
            amount: -totalCost,
            description: `M-Pesa Send Money: ${request.description}`,
            status: 'SUCCESS',
            to_account: request.recipient
          });

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'transaction',
            title: 'Money Sent Successfully',
            message: `KSh ${request.amount} sent to ${request.recipient}. Reference: ${referenceCode}`,
            priority: 'medium'
          });

        return {
          success: true,
          transaction: {
            id: transactionData.id,
            userId: transactionData.user_id,
            transactionType: transactionData.transaction_type,
            amount: transactionData.amount,
            recipient: transactionData.recipient,
            recipientName: transactionData.recipient_name,
            phoneNumber: transactionData.phone_number,
            description: transactionData.description,
            status: 'SUCCESS',
            referenceCode: transactionData.reference_code,
            mpesaReceiptNumber: mpesaResult.receiptNumber,
            transactionCost: transactionData.transaction_cost,
            createdAt: transactionData.created_at,
            completedAt: new Date().toISOString()
          }
        };
      } else {
        // Update transaction as failed
        await supabase
          .from('mpesa_transactions')
          .update({ status: 'FAILED' })
          .eq('id', transactionData.id);

        return { success: false, error: mpesaResult.error };
      }
    } catch (error: any) {
      console.error('Send money error:', error);
      return { success: false, error: error.message || 'Transaction failed' };
    }
  }

  async payBill(request: MpesaTransactionRequest): Promise<{ success: boolean; transaction?: MpesaTransaction; error?: string }> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      if (!request.businessNumber || !request.accountNumber) {
        return { success: false, error: 'Business number and account number are required for PayBill' };
      }

      // Validate business number (5-6 digits)
      if (!/^\d{5,6}$/.test(request.businessNumber)) {
        return { success: false, error: 'Invalid business number format' };
      }

      const transactionCost = this.calculateTransactionCost('PAYBILL', request.amount);
      const totalCost = request.amount + transactionCost;

      if (user.balance < totalCost) {
        return { success: false, error: `Insufficient balance. Total cost: KSh ${totalCost}` };
      }

      const referenceCode = await this.generateReferenceCode();

      const { data: transactionData, error: transactionError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'PAYBILL',
          amount: request.amount,
          recipient: request.businessNumber,
          business_number: request.businessNumber,
          account_number: request.accountNumber,
          description: request.description,
          status: 'PENDING',
          reference_code: referenceCode,
          transaction_cost: transactionCost
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      const mpesaResult = await this.simulateMpesaAPI('PAYBILL', {
        amount: request.amount,
        businessNumber: request.businessNumber,
        accountNumber: request.accountNumber,
        reference: referenceCode
      });

      if (mpesaResult.success) {
        await supabase
          .from('users')
          .update({ balance: user.balance - totalCost })
          .eq('id', user.id);

        await supabase
          .from('mpesa_transactions')
          .update({
            status: 'SUCCESS',
            mpesa_receipt_number: mpesaResult.receiptNumber,
            completed_at: new Date().toISOString()
          })
          .eq('id', transactionData.id);

        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'BILL_PAYMENT',
            amount: -totalCost,
            description: `PayBill: ${request.description}`,
            status: 'SUCCESS',
            to_account: `${request.businessNumber}-${request.accountNumber}`
          });

        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'transaction',
            title: 'Bill Payment Successful',
            message: `KSh ${request.amount} paid to ${request.businessNumber}. Reference: ${referenceCode}`,
            priority: 'medium'
          });

        return {
          success: true,
          transaction: {
            id: transactionData.id,
            userId: transactionData.user_id,
            transactionType: transactionData.transaction_type,
            amount: transactionData.amount,
            recipient: transactionData.recipient,
            businessNumber: transactionData.business_number,
            accountNumber: transactionData.account_number,
            description: transactionData.description,
            status: 'SUCCESS',
            referenceCode: transactionData.reference_code,
            mpesaReceiptNumber: mpesaResult.receiptNumber,
            transactionCost: transactionData.transaction_cost,
            createdAt: transactionData.created_at,
            completedAt: new Date().toISOString()
          }
        };
      } else {
        await supabase
          .from('mpesa_transactions')
          .update({ status: 'FAILED' })
          .eq('id', transactionData.id);

        return { success: false, error: mpesaResult.error };
      }
    } catch (error: any) {
      console.error('Pay bill error:', error);
      return { success: false, error: error.message || 'Transaction failed' };
    }
  }

  async buyGoods(request: MpesaTransactionRequest): Promise<{ success: boolean; transaction?: MpesaTransaction; error?: string }> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      if (!request.tillNumber) {
        return { success: false, error: 'Till number is required for Buy Goods' };
      }

      // Validate till number (5 digits)
      if (!/^\d{5}$/.test(request.tillNumber)) {
        return { success: false, error: 'Invalid till number format (must be 5 digits)' };
      }

      const transactionCost = this.calculateTransactionCost('BUY_GOODS', request.amount);
      const totalCost = request.amount + transactionCost;

      if (user.balance < totalCost) {
        return { success: false, error: `Insufficient balance. Total cost: KSh ${totalCost}` };
      }

      const referenceCode = await this.generateReferenceCode();

      const { data: transactionData, error: transactionError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'BUY_GOODS',
          amount: request.amount,
          recipient: request.tillNumber,
          till_number: request.tillNumber,
          description: request.description,
          status: 'PENDING',
          reference_code: referenceCode,
          transaction_cost: transactionCost
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      const mpesaResult = await this.simulateMpesaAPI('BUY_GOODS', {
        amount: request.amount,
        tillNumber: request.tillNumber,
        reference: referenceCode
      });

      if (mpesaResult.success) {
        await supabase
          .from('users')
          .update({ balance: user.balance - totalCost })
          .eq('id', user.id);

        await supabase
          .from('mpesa_transactions')
          .update({
            status: 'SUCCESS',
            mpesa_receipt_number: mpesaResult.receiptNumber,
            completed_at: new Date().toISOString()
          })
          .eq('id', transactionData.id);

        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'WITHDRAWAL',
            amount: -totalCost,
            description: `Buy Goods: ${request.description}`,
            status: 'SUCCESS',
            to_account: request.tillNumber
          });

        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'transaction',
            title: 'Purchase Successful',
            message: `KSh ${request.amount} paid to Till ${request.tillNumber}. Reference: ${referenceCode}`,
            priority: 'medium'
          });

        return {
          success: true,
          transaction: {
            id: transactionData.id,
            userId: transactionData.user_id,
            transactionType: transactionData.transaction_type,
            amount: transactionData.amount,
            recipient: transactionData.recipient,
            tillNumber: transactionData.till_number,
            description: transactionData.description,
            status: 'SUCCESS',
            referenceCode: transactionData.reference_code,
            mpesaReceiptNumber: mpesaResult.receiptNumber,
            transactionCost: transactionData.transaction_cost,
            createdAt: transactionData.created_at,
            completedAt: new Date().toISOString()
          }
        };
      } else {
        await supabase
          .from('mpesa_transactions')
          .update({ status: 'FAILED' })
          .eq('id', transactionData.id);

        return { success: false, error: mpesaResult.error };
      }
    } catch (error: any) {
      console.error('Buy goods error:', error);
      return { success: false, error: error.message || 'Transaction failed' };
    }
  }

  async buyAirtime(request: MpesaTransactionRequest): Promise<{ success: boolean; transaction?: MpesaTransaction; error?: string }> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      if (!request.phoneNumber) {
        return { success: false, error: 'Phone number is required for airtime purchase' };
      }

      // Validate phone number
      const phoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/;
      if (!phoneRegex.test(request.phoneNumber)) {
        return { success: false, error: 'Invalid phone number format' };
      }

      const transactionCost = this.calculateTransactionCost('BUY_AIRTIME', request.amount);
      const totalCost = request.amount + transactionCost;

      if (user.balance < totalCost) {
        return { success: false, error: `Insufficient balance. Total cost: KSh ${totalCost}` };
      }

      const referenceCode = await this.generateReferenceCode();

      const { data: transactionData, error: transactionError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'BUY_AIRTIME',
          amount: request.amount,
          recipient: request.phoneNumber,
          phone_number: request.phoneNumber,
          description: request.description,
          status: 'PENDING',
          reference_code: referenceCode,
          transaction_cost: transactionCost
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      const mpesaResult = await this.simulateMpesaAPI('BUY_AIRTIME', {
        amount: request.amount,
        phoneNumber: request.phoneNumber,
        reference: referenceCode
      });

      if (mpesaResult.success) {
        await supabase
          .from('users')
          .update({ balance: user.balance - totalCost })
          .eq('id', user.id);

        await supabase
          .from('mpesa_transactions')
          .update({
            status: 'SUCCESS',
            mpesa_receipt_number: mpesaResult.receiptNumber,
            completed_at: new Date().toISOString()
          })
          .eq('id', transactionData.id);

        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'WITHDRAWAL',
            amount: -totalCost,
            description: `Airtime purchase: ${request.description}`,
            status: 'SUCCESS',
            to_account: request.phoneNumber
          });

        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'transaction',
            title: 'Airtime Purchase Successful',
            message: `KSh ${request.amount} airtime sent to ${request.phoneNumber}. Reference: ${referenceCode}`,
            priority: 'medium'
          });

        return {
          success: true,
          transaction: {
            id: transactionData.id,
            userId: transactionData.user_id,
            transactionType: transactionData.transaction_type,
            amount: transactionData.amount,
            recipient: transactionData.recipient,
            phoneNumber: transactionData.phone_number,
            description: transactionData.description,
            status: 'SUCCESS',
            referenceCode: transactionData.reference_code,
            mpesaReceiptNumber: mpesaResult.receiptNumber,
            transactionCost: transactionData.transaction_cost,
            createdAt: transactionData.created_at,
            completedAt: new Date().toISOString()
          }
        };
      } else {
        await supabase
          .from('mpesa_transactions')
          .update({ status: 'FAILED' })
          .eq('id', transactionData.id);

        return { success: false, error: mpesaResult.error };
      }
    } catch (error: any) {
      console.error('Buy airtime error:', error);
      return { success: false, error: error.message || 'Transaction failed' };
    }
  }

  async depositFromMpesa(phoneNumber: string, amount: number): Promise<{ success: boolean; transaction?: MpesaTransaction; error?: string }> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const referenceCode = await this.generateReferenceCode();

      const { data: transactionData, error: transactionError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'DEPOSIT',
          amount: amount,
          recipient: user.accountNumber,
          phone_number: phoneNumber,
          description: 'Deposit from M-Pesa',
          status: 'PENDING',
          reference_code: referenceCode,
          transaction_cost: 0 // Deposits are usually free
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      const mpesaResult = await this.simulateMpesaAPI('DEPOSIT', {
        amount: amount,
        phoneNumber: phoneNumber,
        accountNumber: user.accountNumber,
        reference: referenceCode
      });

      if (mpesaResult.success) {
        await supabase
          .from('users')
          .update({ balance: user.balance + amount })
          .eq('id', user.id);

        await supabase
          .from('mpesa_transactions')
          .update({
            status: 'SUCCESS',
            mpesa_receipt_number: mpesaResult.receiptNumber,
            completed_at: new Date().toISOString()
          })
          .eq('id', transactionData.id);

        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'DEPOSIT',
            amount: amount,
            description: 'M-Pesa Deposit',
            status: 'SUCCESS',
            from_account: phoneNumber
          });

        return {
          success: true,
          transaction: {
            id: transactionData.id,
            userId: transactionData.user_id,
            transactionType: transactionData.transaction_type,
            amount: transactionData.amount,
            recipient: transactionData.recipient,
            phoneNumber: transactionData.phone_number,
            description: transactionData.description,
            status: 'SUCCESS',
            referenceCode: transactionData.reference_code,
            mpesaReceiptNumber: mpesaResult.receiptNumber,
            transactionCost: transactionData.transaction_cost,
            createdAt: transactionData.created_at,
            completedAt: new Date().toISOString()
          }
        };
      } else {
        await supabase
          .from('mpesa_transactions')
          .update({ status: 'FAILED' })
          .eq('id', transactionData.id);

        return { success: false, error: mpesaResult.error };
      }
    } catch (error: any) {
      console.error('Deposit from M-Pesa error:', error);
      return { success: false, error: error.message || 'Transaction failed' };
    }
  }

  async getTransactionHistory(userId?: string, limit = 50): Promise<MpesaTransaction[]> {
    try {
      const user = userId ? { id: userId } : await authService.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(t => ({
        id: t.id,
        userId: t.user_id,
        transactionType: t.transaction_type,
        amount: t.amount,
        recipient: t.recipient,
        recipientName: t.recipient_name,
        accountNumber: t.account_number,
        businessNumber: t.business_number,
        tillNumber: t.till_number,
        phoneNumber: t.phone_number,
        description: t.description,
        status: t.status,
        referenceCode: t.reference_code,
        mpesaReceiptNumber: t.mpesa_receipt_number,
        transactionCost: t.transaction_cost || 0,
        createdAt: t.created_at,
        completedAt: t.completed_at
      }));
    } catch (error) {
      console.error('Get transaction history error:', error);
      return [];
    }
  }

  private async simulateMpesaAPI(type: string, params: any): Promise<{ success: boolean; receiptNumber?: string; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Simulate 95% success rate
    const success = Math.random() > 0.05;

    if (success) {
      return {
        success: true,
        receiptNumber: 'MP' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase()
      };
    } else {
      const errors = [
        'Insufficient funds in M-Pesa account',
        'Transaction declined by M-Pesa',
        'Invalid recipient details',
        'Network timeout',
        'Service temporarily unavailable'
      ];
      return {
        success: false,
        error: errors[Math.floor(Math.random() * errors.length)]
      };
    }
  }

  async getMpesaBalance(): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      // Simulate M-Pesa balance check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        balance: Math.floor(Math.random() * 50000) + 1000 // Random balance between 1000-51000
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to check M-Pesa balance'
      };
    }
  }

  async checkTransactionStatus(referenceCode: string): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('status')
        .eq('reference_code', referenceCode)
        .single();

      if (error) throw error;

      return {
        success: true,
        status: data.status
      };
    } catch (error) {
      return {
        success: false,
        error: 'Transaction not found'
      };
    }
  }
}

export const enhancedMpesaService = new EnhancedMpesaService();
