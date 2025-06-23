
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
      
      // Calculate overdraft limit based on credit score
      const overdraftLimit = this.calculateOverdraftLimit(creditScore.score);
      
      // For now, return mock data since overdrafts table doesn't exist
      const totalActiveAmount = 0; // Would query overdrafts table if it existed
      const available = Math.max(0, overdraftLimit - totalActiveAmount);

      return {
        enabled: creditScore.score >= 450,
        limit: overdraftLimit,
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
      
      // Would create overdraft record if table existed
      console.log('Overdraft would be created:', { userId, amount: overdraftNeeded, fee });

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
      // Return empty array since overdrafts table doesn't exist
      console.log('Would fetch active overdrafts for user:', userId);
      return [];
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
      // Return empty array since overdrafts table doesn't exist
      console.log('Would fetch overdraft history for user:', userId);
      return [];
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
      // Mock implementation since overdrafts table doesn't exist
      console.log('Would repay overdraft:', { overdraftId, userId, amount });
      
      return {
        success: true,
        remainingBalance: 0
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
      // Mock implementation since overdrafts table doesn't exist
      console.log('Would check for overdue overdrafts');
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
      // Return mock stats since overdrafts table doesn't exist
      console.log('Would get overdraft stats for user:', userId);
      
      return {
        totalUsed: 0,
        totalFees: 0,
        activeAmount: 0,
        overdueAmount: 0,
        repaymentRate: 0
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

  private static calculateOverdraftLimit(creditScore: number): number {
    if (creditScore >= 750) return 100000;
    if (creditScore >= 650) return 50000;
    if (creditScore >= 550) return 25000;
    if (creditScore >= 450) return 10000;
    return 0;
  }

  private static calculateOverdraftFee(amount: number, creditScore: number): number {
    const baseFee = amount * 0.05; // 5% base fee
    const scoreDiscount = creditScore >= 600 ? 0.5 : 1; // 50% discount for good credit
    return Math.round(baseFee * scoreDiscount);
  }

  private static async getUserCreditScore(userId: string): Promise<number> {
    try {
      const creditScore = await CreditScoreService.getCreditScore(userId);
      return creditScore.score;
    } catch (error) {
      console.error('Error getting user credit score:', error);
      return 400; // Default score
    }
  }
}
