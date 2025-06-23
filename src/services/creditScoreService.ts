import { supabase } from '@/integrations/supabase/client';

export interface CreditScoreData {
  score: number;
  factors: {
    paymentHistory: number;
    creditUtilization: number;
    creditLength: number;
    creditMix: number;
    newCredit: number;
  };
  recommendations: string[];
  trend: 'improving' | 'stable' | 'declining';
}

export class CreditScoreService {
  static async getCreditScore(userId: string): Promise<CreditScoreData> {
    return await this.calculateCreditScore(userId);
  }

  static async calculateCreditScore(userId: string): Promise<CreditScoreData> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (transactionsError) throw transactionsError;

      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId);

      if (loansError) throw loansError;

      // Calculate credit score based on available data
      const paymentHistory = this.calculatePaymentHistory(transactions || [], loans || []);
      const creditUtilization = this.calculateCreditUtilization(user, transactions || []);
      const creditLength = this.calculateCreditLength(user);
      const creditMix = this.calculateCreditMix(loans || []);
      const newCredit = this.calculateNewCredit(loans || []);

      const overallScore = Math.round(
        paymentHistory * 0.35 +
        creditUtilization * 0.30 +
        creditLength * 0.15 +
        creditMix * 0.10 +
        newCredit * 0.10
      );

      const recommendations = this.generateRecommendations({
        paymentHistory,
        creditUtilization,
        creditLength,
        creditMix,
        newCredit
      });

      return {
        score: Math.max(300, Math.min(850, overallScore)),
        factors: {
          paymentHistory,
          creditUtilization,
          creditLength,
          creditMix,
          newCredit
        },
        recommendations,
        trend: this.determineTrend(user.credit_score || 0, overallScore)
      };
    } catch (error) {
      console.error('Error calculating credit score:', error);
      return {
        score: 650, // Default score
        factors: {
          paymentHistory: 650,
          creditUtilization: 650,
          creditLength: 650,
          creditMix: 650,
          newCredit: 650
        },
        recommendations: ['Unable to calculate credit score at this time'],
        trend: 'stable'
      };
    }
  }

  private static calculatePaymentHistory(transactions: any[], loans: any[]): number {
    // Calculate based on successful vs failed transactions and loan payments
    const totalTransactions = transactions.length;
    if (totalTransactions === 0) return 650; // Default score

    const successfulTransactions = transactions.filter(t => t.status === 'SUCCESS').length;
    const successRate = successfulTransactions / totalTransactions;

    // Check loan payment history
    const overdueLoans = loans.filter(l => 
      l.status === 'ACTIVE' && 
      l.next_payment_date && 
      new Date(l.next_payment_date) < new Date()
    ).length;

    let score = 300 + (successRate * 400); // Base range 300-700
    
    // Penalty for overdue loans
    score -= (overdueLoans * 50);

    return Math.max(300, Math.min(850, score));
  }

  private static calculateCreditUtilization(user: any, transactions: any[]): number {
    // Calculate based on balance vs spending patterns
    const balance = user.balance || 0;
    const monthlySpending = transactions
      .filter(t => {
        const transactionDate = new Date(t.timestamp);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return transactionDate >= oneMonthAgo && t.amount < 0; // Negative amounts are spending
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (balance === 0) return 650; // Default if no balance data

    const utilizationRatio = monthlySpending / balance;
    
    // Lower utilization is better
    let score = 850 - (utilizationRatio * 300);
    return Math.max(300, Math.min(850, score));
  }

  private static calculateCreditLength(user: any): number {
    // Calculate based on account age
    const accountAge = user.created_at ? 
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;

    // Longer history is better
    let score = 300 + (accountAge * 100); // 100 points per year
    return Math.max(300, Math.min(850, score));
  }

  private static calculateCreditMix(loans: any[]): number {
    // Calculate based on variety of credit types
    const loanTypes = new Set(loans.map(l => l.type)).size;
    
    let score = 600; // Base score
    score += loanTypes * 50; // Bonus for variety
    
    return Math.max(300, Math.min(850, score));
  }

  private static calculateNewCredit(loans: any[]): number {
    // Calculate based on recent credit applications
    const recentLoans = loans.filter(l => {
      const loanDate = new Date(l.application_date);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return loanDate >= sixMonthsAgo;
    }).length;

    // Too many recent applications hurt the score
    let score = 750 - (recentLoans * 50);
    return Math.max(300, Math.min(850, score));
  }

  private static generateRecommendations(factors: any): string[] {
    const recommendations: string[] = [];

    if (factors.paymentHistory < 700) {
      recommendations.push('Improve payment history by ensuring all transactions are successful');
    }

    if (factors.creditUtilization > 700) {
      recommendations.push('Reduce spending relative to your account balance');
    }

    if (factors.creditLength < 600) {
      recommendations.push('Maintain your account longer to build credit history');
    }

    if (factors.creditMix < 650) {
      recommendations.push('Consider diversifying your credit portfolio');
    }

    if (factors.newCredit < 700) {
      recommendations.push('Avoid applying for multiple loans in a short period');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your credit profile looks good! Keep up the good financial habits.');
    }

    return recommendations;
  }

  private static determineTrend(oldScore: number, newScore: number): 'improving' | 'stable' | 'declining' {
    const difference = newScore - oldScore;
    
    if (difference > 10) return 'improving';
    if (difference < -10) return 'declining';
    return 'stable';
  }

  static async updateCreditScore(userId: string): Promise<boolean> {
    try {
      const creditData = await this.calculateCreditScore(userId);
      
      const { error } = await supabase
        .from('users')
        .update({ credit_score: creditData.score })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating credit score:', error);
      return false;
    }
  }
}

export const creditScoreService = new CreditScoreService();
