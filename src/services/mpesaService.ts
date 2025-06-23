
import { supabase } from '@/integrations/supabase/client';

export interface MpesaTransaction {
  id: string;
  type: 'SEND_MONEY' | 'PAYBILL' | 'BUY_GOODS' | 'BUY_AIRTIME';
  amount: number;
  recipient: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  timestamp: string;
  reference?: string;
}

export class MpesaService {
  static async sendMoney(userId: string, recipient: string, amount: number): Promise<MpesaTransaction> {
    try {
      // Check user balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (!user || user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction
      const transaction: MpesaTransaction = {
        id: crypto.randomUUID(),
        type: 'SEND_MONEY',
        amount,
        recipient,
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        reference: `SM${Date.now()}`
      };

      // Update user balance
      await supabase
        .from('users')
        .update({ balance: user.balance - amount })
        .eq('id', userId);

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'SEND_MONEY',
          amount: -amount,
          description: `Money sent to ${recipient}`,
          status: 'SUCCESS',
          to_account: recipient
        });

      return transaction;
    } catch (error) {
      console.error('Error sending money:', error);
      throw error;
    }
  }

  static async payBill(userId: string, billNumber: string, amount: number): Promise<MpesaTransaction> {
    try {
      // Check user balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (!user || user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction
      const transaction: MpesaTransaction = {
        id: crypto.randomUUID(),
        type: 'PAYBILL',
        amount,
        recipient: billNumber,
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        reference: `PB${Date.now()}`
      };

      // Update user balance
      await supabase
        .from('users')
        .update({ balance: user.balance - amount })
        .eq('id', userId);

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'PAYBILL',
          amount: -amount,
          description: `Bill payment to ${billNumber}`,
          status: 'SUCCESS',
          to_account: billNumber
        });

      return transaction;
    } catch (error) {
      console.error('Error paying bill:', error);
      throw error;
    }
  }

  static async buyGoods(userId: string, tillNumber: string, amount: number): Promise<MpesaTransaction> {
    try {
      // Check user balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (!user || user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction
      const transaction: MpesaTransaction = {
        id: crypto.randomUUID(),
        type: 'BUY_GOODS',
        amount,
        recipient: tillNumber,
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        reference: `BG${Date.now()}`
      };

      // Update user balance
      await supabase
        .from('users')
        .update({ balance: user.balance - amount })
        .eq('id', userId);

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'BUY_GOODS',
          amount: -amount,
          description: `Purchase from till ${tillNumber}`,
          status: 'SUCCESS',
          to_account: tillNumber
        });

      return transaction;
    } catch (error) {
      console.error('Error buying goods:', error);
      throw error;
    }
  }

  static async buyAirtime(userId: string, phoneNumber: string, amount: number): Promise<MpesaTransaction> {
    try {
      // Check user balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (!user || user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction
      const transaction: MpesaTransaction = {
        id: crypto.randomUUID(),
        type: 'BUY_AIRTIME',
        amount,
        recipient: phoneNumber,
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        reference: `AT${Date.now()}`
      };

      // Update user balance
      await supabase
        .from('users')
        .update({ balance: user.balance - amount })
        .eq('id', userId);

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'BUY_AIRTIME',
          amount: -amount,
          description: `Airtime for ${phoneNumber}`,
          status: 'SUCCESS',
          to_account: phoneNumber
        });

      return transaction;
    } catch (error) {
      console.error('Error buying airtime:', error);
      throw error;
    }
  }

  static async getTransactionHistory(userId: string): Promise<MpesaTransaction[]> {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .in('type', ['SEND_MONEY', 'PAYBILL', 'BUY_GOODS', 'BUY_AIRTIME'])
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return transactions.map(t => ({
        id: t.id,
        type: t.type as 'SEND_MONEY' | 'PAYBILL' | 'BUY_GOODS' | 'BUY_AIRTIME',
        amount: Math.abs(t.amount),
        recipient: t.to_account || '',
        status: t.status as 'SUCCESS' | 'FAILED' | 'PENDING',
        timestamp: t.timestamp,
        reference: t.id
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }
}

export const mpesaService = new MpesaService();
