import { supabase } from '../integrations/supabase/client';
import { CreditScoreService } from './creditScoreService';

export interface Overdraft {
  id: string;
  userId: string;
  amount: number;
  fee: number;
  status: 'active' | 'repaid' | 'overdue';
  created_at: Date;
  due_date: Date;
  repaid_at?: Date;
}

export interface OverdraftProtection {
  enabled: boolean;
  limit: number;
  available: number;
  fee: number;
  nextDueDate?: Date;
}

export class OverdraftService {
  /**
   * Check if user is eligible for overdraft protection
   */
  static async checkEligibility(userId: string): Promise<OverdraftProtection> {
    try {
      const creditScore = await CreditScoreService.getCreditScore(userId);
      const { data: activeOverdrafts } = await supabase
        .from('overdrafts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      const totalActiveAmount = activeOverdrafts?.reduce((sum, od) => sum + od.amount, 0) || 0;
      const available = Math.max(0, creditScore.overdraftLimit - totalActiveAmount);

      return {
        enabled: creditScore.score >= 450,
        limit: creditScore.overdraftLimit,
        available,
        fee: this.calculateOverdraftFee(available, creditScore.score)
      };
    } catch (error) {
      console.error('Error checking overdraft eligibility:', error);
      return {
        enabled: false,
        limit: 0,
        available: 0,
        fee: 0
      };
    }
  }

  /**
   * Process a transaction that would result in overdraft
   */
  static async processOverdraftTransaction(
    userId: string, 
    transactionAmount: number, 
    currentBalance: number
  ): Promise<{
    allowed: boolean;
    overdraftAmount?: number;
    fee?: number;
    reason?: string;
  }> {
    try {
      const protection = await this.checkEligibility(userId);
      
      if (!protection.enabled) {
        return {
          allowed: false,
          reason: 'Overdraft protection not available for your account'
        };
      }

      const overdraftNeeded = transactionAmount - currentBalance;
      
      if (overdraftNeeded <= 0) {
        return { allowed: true };
      }

      if (overdraftNeeded > protection.available) {
        return {
          allowed: false,
          reason: `Insufficient overdraft limit. Available: KES ${protection.available.toLocaleString()}`
        };
      }

      const fee = this.calculateOverdraftFee(overdraftNeeded, await this.getUserCreditScore(userId));
      
      // Create overdraft record
      await this.createOverdraft(userId, overdraftNeeded, fee);

      return {
        allowed: true,
        overdraftAmount: overdraftNeeded,
        fee
      };
    } catch (error) {
      console.error('Error processing overdraft transaction:', error);
      return {
        allowed: false,
        reason: 'Unable to process overdraft at this time'
      };
    }
  }

  /**
   * Get user's active overdrafts
   */
  static async getActiveOverdrafts(userId: string): Promise<Overdraft[]> {
    try {
      const { data, error } = await supabase
        .from('overdrafts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(od => ({
        ...od,
        created_at: new Date(od.created_at),
        due_date: new Date(od.due_date),
        repaid_at: od.repaid_at ? new Date(od.repaid_at) : undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching active overdrafts:', error);
      return [];
    }
  }

  /**
   * Get user's overdraft history
   */
  static async getOverdraftHistory(userId: string): Promise<Overdraft[]> {
    try {
      const { data, error } = await supabase
        .from('overdrafts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data?.map(od => ({
        ...od,
        created_at: new Date(od.created_at),
        due_date: new Date(od.due_date),
        repaid_at: od.repaid_at ? new Date(od.repaid_at) : undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching overdraft history:', error);
      return [];
    }
  }

  /**
   * Repay an overdraft
   */
  static async repayOverdraft(
    overdraftId: string, 
    userId: string, 
    amount: number
  ): Promise<{
    success: boolean;
    remainingBalance?: number;
    reason?: string;
  }> {
    try {
      const { data: overdraft, error: fetchError } = await supabase
        .from('overdrafts')
        .select('*')
        .eq('id', overdraftId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !overdraft) {
        return {
          success: false,
          reason: 'Overdraft not found'
        };
      }

      if (overdraft.status !== 'active') {
        return {
          success: false,
          reason: 'Overdraft is not active'
        };
      }

      const remainingBalance = overdraft.amount - amount;
      const isFullyRepaid = remainingBalance <= 0;
      const wasOnTime = new Date() <= new Date(overdraft.due_date);

      // Update overdraft record
      const { error: updateError } = await supabase
        .from('overdrafts')
        .update({
          amount: Math.max(0, remainingBalance),
          status: isFullyRepaid ? 'repaid' : 'active',
          repaid_at: isFullyRepaid ? new Date().toISOString() : null
        })
        .eq('id', overdraftId);

      if (updateError) throw updateError;

      // Update credit score if fully repaid
      if (isFullyRepaid) {
        await CreditScoreService.updateScoreAfterOverdraft(userId, wasOnTime);
      }

      return {
        success: true,
        remainingBalance: Math.max(0, remainingBalance)
      };
    } catch (error) {
      console.error('Error repaying overdraft:', error);
      return {
        success: false,
        reason: 'Unable to process repayment'
      };
    }
  }

  /**
   * Check for overdue overdrafts and update status
   */
  static async checkOverdueOverdrafts(): Promise<void> {
    try {
      const { data: overdueOverdrafts, error } = await supabase
        .from('overdrafts')
        .select('*')
        .eq('status', 'active')
        .lt('due_date', new Date().toISOString());

      if (error) throw error;

      for (const overdraft of overdueOverdrafts || []) {
        await supabase
          .from('overdrafts')
          .update({ status: 'overdue' })
          .eq('id', overdraft.id);
      }
    } catch (error) {
      console.error('Error checking overdue overdrafts:', error);
    }
  }

  /**
   * Get overdraft statistics for user
   */
  static async getOverdraftStats(userId: string): Promise<{
    totalUsed: number;
    totalFees: number;
    activeAmount: number;
    overdueAmount: number;
    repaymentRate: number;
  }> {
    try {
      const history = await this.getOverdraftHistory(userId);
      
      const totalUsed = history.reduce((sum, od) => sum + od.amount, 0);
      const totalFees = history.reduce((sum, od) => sum + od.fee, 0);
      const activeAmount = history
        .filter(od => od.status === 'active')
        .reduce((sum, od) => sum + od.amount, 0);
      const overdueAmount = history
        .filter(od => od.status === 'overdue')
        .reduce((sum, od) => sum + od.amount, 0);
      
      const repaidCount = history.filter(od => od.status === 'repaid').length;
      const repaymentRate = history.length > 0 ? repaidCount / history.length : 0;

      return {
        totalUsed,
        totalFees,
        activeAmount,
        overdueAmount,
        repaymentRate
      };
    } catch (error) {
      console.error('Error getting overdraft stats:', error);
      return {
        totalUsed: 0,
        totalFees: 0,
        activeAmount: 0,
        overdueAmount: 0,
        repaymentRate: 0
      };
    }
  }

  private static async createOverdraft(userId: string, amount: number, fee: number): Promise<void> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days to repay

    const { error } = await supabase
      .from('overdrafts')
      .insert({
        user_id: userId,
        amount,
        fee,
        status: 'active',
        due_date: dueDate.toISOString()
      });

    if (error) {
      console.error('Error creating overdraft:', error);
      throw error;
    }
  }

  private static calculateOverdraftFee(amount: number, creditScore: number): number {
    const baseFee = amount * 0.05; // 5% base fee
    const scoreDiscount = creditScore >= 600 ? 0.5 : 1; // 50% discount for good credit
    return Math.round(baseFee * scoreDiscount);
  }

  private static async getUserCreditScore(userId: string): Promise<number> {
    const creditScore = await CreditScoreService.getCreditScore(userId);
    return creditScore.score;
  }
} 