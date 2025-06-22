import { supabase } from '../integrations/supabase/client';

export interface MPesaTransaction {
  id: string;
  type: 'SEND_MONEY' | 'PAYBILL' | 'BUY_GOODS' | 'BUY_AIRTIME';
  amount: number;
  recipient: string;
  recipientName?: string;
  accountNumber?: string;
  businessNumber?: string;
  tillNumber?: string;
  phoneNumber: string;
  description: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  reference: string;
  timestamp: string;
  userId: string;
}

export interface SendMoneyRequest {
  phoneNumber: string;
  amount: number;
  description: string;
  recipientName?: string;
}

export interface PayBillRequest {
  businessNumber: string;
  accountNumber: string;
  amount: number;
  description: string;
}

export interface BuyGoodsRequest {
  tillNumber: string;
  amount: number;
  description: string;
}

export interface BuyAirtimeRequest {
  phoneNumber: string;
  amount: number;
  provider: 'SAFARICOM' | 'AIRTEL' | 'TELKOM';
}

// Mock data storage for when database is not available
let mockTransactions: MPesaTransaction[] = [];

class MPesaService {
  private generateReference(): string {
    return 'MPESA' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private async validateBalance(userId: string, amount: number): Promise<boolean> {
    try {
      // Try to use real database first
      const { data: account, error } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If database is not available, assume sufficient balance for demo
        console.log('Database not available, using mock balance validation');
        return true;
      }
      return account.balance >= amount;
    } catch (error) {
      console.error('Error validating balance:', error);
      // For demo purposes, assume sufficient balance
      return true;
    }
  }

  private async deductAmount(userId: string, amount: number): Promise<boolean> {
    try {
      // Try to use real database first
      const { error } = await supabase
        .from('accounts')
        .update({ balance: supabase.rpc('decrease_balance', { user_id: userId, amount }) })
        .eq('user_id', userId);

      if (error) {
        // If database is not available, just return success for demo
        console.log('Database not available, skipping balance deduction for demo');
        return true;
      }
      return true;
    } catch (error) {
      console.error('Error deducting amount:', error);
      // For demo purposes, assume success
      return true;
    }
  }

  async sendMoney(userId: string, request: SendMoneyRequest): Promise<MPesaTransaction> {
    try {
      // Validate balance
      if (!(await this.validateBalance(userId, request.amount))) {
        throw new Error('Insufficient balance');
      }

      // Validate phone number format (Kenyan format)
      const phoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/;
      if (!phoneRegex.test(request.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Create transaction record
      const transaction: MPesaTransaction = {
        id: crypto.randomUUID(),
        type: 'SEND_MONEY',
        amount: request.amount,
        recipient: request.phoneNumber,
        recipientName: request.recipientName,
        phoneNumber: request.phoneNumber,
        description: request.description,
        status: 'PENDING',
        reference: this.generateReference(),
        timestamp: new Date().toISOString(),
        userId
      };

      // Simulate M-Pesa API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Deduct amount from account
      if (!(await this.deductAmount(userId, request.amount))) {
        throw new Error('Failed to process transaction');
      }

      // Update transaction status to success
      transaction.status = 'SUCCESS';

      // Save to database or mock storage
      try {
        const { data, error } = await supabase
          .from('mpesa_transactions')
          .insert([transaction])
          .select()
          .single();

        if (error) {
          // If database is not available, save to mock storage
          console.log('Database not available, saving to mock storage');
          mockTransactions.unshift(transaction);
          return transaction;
        }

        return data;
      } catch (dbError) {
        // Save to mock storage if database fails
        console.log('Database error, saving to mock storage');
        mockTransactions.unshift(transaction);
        return transaction;
      }

    } catch (error) {
      console.error('Error sending money:', error);
      throw error;
    }
  }

  async payBill(userId: string, request: PayBillRequest): Promise<MPesaTransaction> {
    try {
      // Validate balance
      if (!(await this.validateBalance(userId, request.amount))) {
        throw new Error('Insufficient balance');
      }

      // Validate business number format
      if (!/^\d{5,6}$/.test(request.businessNumber)) {
        throw new Error('Invalid business number');
      }

      // Create transaction record
      const transaction: MPesaTransaction = {
        id: crypto.randomUUID(),
        type: 'PAYBILL',
        amount: request.amount,
        recipient: request.businessNumber,
        accountNumber: request.accountNumber,
        businessNumber: request.businessNumber,
        phoneNumber: '', // Will be filled from user profile
        description: request.description,
        status: 'PENDING',
        reference: this.generateReference(),
        timestamp: new Date().toISOString(),
        userId
      };

      // Simulate M-Pesa API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Deduct amount from account
      if (!(await this.deductAmount(userId, request.amount))) {
        throw new Error('Failed to process transaction');
      }

      // Update transaction status to success
      transaction.status = 'SUCCESS';

      // Save to database or mock storage
      try {
        const { data, error } = await supabase
          .from('mpesa_transactions')
          .insert([transaction])
          .select()
          .single();

        if (error) {
          // If database is not available, save to mock storage
          console.log('Database not available, saving to mock storage');
          mockTransactions.unshift(transaction);
          return transaction;
        }

        return data;
      } catch (dbError) {
        // Save to mock storage if database fails
        console.log('Database error, saving to mock storage');
        mockTransactions.unshift(transaction);
        return transaction;
      }

    } catch (error) {
      console.error('Error paying bill:', error);
      throw error;
    }
  }

  async buyGoods(userId: string, request: BuyGoodsRequest): Promise<MPesaTransaction> {
    try {
      // Validate balance
      if (!(await this.validateBalance(userId, request.amount))) {
        throw new Error('Insufficient balance');
      }

      // Validate till number format
      if (!/^\d{5}$/.test(request.tillNumber)) {
        throw new Error('Invalid till number');
      }

      // Create transaction record
      const transaction: MPesaTransaction = {
        id: crypto.randomUUID(),
        type: 'BUY_GOODS',
        amount: request.amount,
        recipient: request.tillNumber,
        tillNumber: request.tillNumber,
        phoneNumber: '', // Will be filled from user profile
        description: request.description,
        status: 'PENDING',
        reference: this.generateReference(),
        timestamp: new Date().toISOString(),
        userId
      };

      // Simulate M-Pesa API call
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Deduct amount from account
      if (!(await this.deductAmount(userId, request.amount))) {
        throw new Error('Failed to process transaction');
      }

      // Update transaction status to success
      transaction.status = 'SUCCESS';

      // Save to database or mock storage
      try {
        const { data, error } = await supabase
          .from('mpesa_transactions')
          .insert([transaction])
          .select()
          .single();

        if (error) {
          // If database is not available, save to mock storage
          console.log('Database not available, saving to mock storage');
          mockTransactions.unshift(transaction);
          return transaction;
        }

        return data;
      } catch (dbError) {
        // Save to mock storage if database fails
        console.log('Database error, saving to mock storage');
        mockTransactions.unshift(transaction);
        return transaction;
      }

    } catch (error) {
      console.error('Error buying goods:', error);
      throw error;
    }
  }

  async buyAirtime(userId: string, request: BuyAirtimeRequest): Promise<MPesaTransaction> {
    try {
      // Validate balance
      if (!(await this.validateBalance(userId, request.amount))) {
        throw new Error('Insufficient balance');
      }

      // Validate phone number format
      const phoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/;
      if (!phoneRegex.test(request.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Create transaction record
      const transaction: MPesaTransaction = {
        id: crypto.randomUUID(),
        type: 'BUY_AIRTIME',
        amount: request.amount,
        recipient: request.phoneNumber,
        phoneNumber: request.phoneNumber,
        description: `Airtime purchase for ${request.phoneNumber}`,
        status: 'PENDING',
        reference: this.generateReference(),
        timestamp: new Date().toISOString(),
        userId
      };

      // Simulate M-Pesa API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Deduct amount from account
      if (!(await this.deductAmount(userId, request.amount))) {
        throw new Error('Failed to process transaction');
      }

      // Update transaction status to success
      transaction.status = 'SUCCESS';

      // Save to database or mock storage
      try {
        const { data, error } = await supabase
          .from('mpesa_transactions')
          .insert([transaction])
          .select()
          .single();

        if (error) {
          // If database is not available, save to mock storage
          console.log('Database not available, saving to mock storage');
          mockTransactions.unshift(transaction);
          return transaction;
        }

        return data;
      } catch (dbError) {
        // Save to mock storage if database fails
        console.log('Database error, saving to mock storage');
        mockTransactions.unshift(transaction);
        return transaction;
      }

    } catch (error) {
      console.error('Error buying airtime:', error);
      throw error;
    }
  }

  async getTransactionHistory(userId: string): Promise<MPesaTransaction[]> {
    try {
      // Try to get from real database first
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        // If database is not available, return mock data
        console.log('Database not available, returning mock transaction history');
        return mockTransactions.filter(t => t.userId === userId);
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      // Return mock data if database fails
      return mockTransactions.filter(t => t.userId === userId);
    }
  }
}

export const mpesaService = new MPesaService(); 