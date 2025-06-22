import { supabase } from '../integrations/supabase/client';

export interface CreditScore {
  score: number;
  maxLoanLimit: number;
  overdraftLimit: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

export interface FinancialMetrics {
  averageBalance: number;
  transactionFrequency: number;
  depositConsistency: number;
  loanRepaymentHistory: number;
  overdraftRepaymentHistory: number;
}

export class CreditScoreService {
  private static readonly INITIAL_SCORE = 400;
  private static readonly INITIAL_LOAN_LIMIT = 10000;
  private static readonly INITIAL_OVERDRAFT_LIMIT = 5000;
  
  private static readonly SCORE_WEIGHTS = {
    loanRepayment: 0.35,
    overdraftRepayment: 0.25,
    depositConsistency: 0.20,
    transactionFrequency: 0.15,
    averageBalance: 0.05
  };

  private static readonly RISK_THRESHOLDS = {
    low: 700,
    medium: 500
  };

  /**
   * Calculate credit score based on user's financial behavior
   */
  static async calculateCreditScore(userId: string): Promise<CreditScore> {
    try {
      const metrics = await this.getFinancialMetrics(userId);
      const score = this.computeScore(metrics);
      const riskLevel = this.determineRiskLevel(score);
      const maxLoanLimit = this.calculateLoanLimit(score, metrics);
      const overdraftLimit = this.calculateOverdraftLimit(score, metrics);

      const creditScore: CreditScore = {
        score,
        maxLoanLimit,
        overdraftLimit,
        riskLevel,
        lastUpdated: new Date()
      };

      // Save to database
      await this.saveCreditScore(userId, creditScore);
      
      return creditScore;
    } catch (error) {
      console.error('Error calculating credit score:', error);
      return this.getDefaultCreditScore();
    }
  }

  /**
   * Get current credit score for user
   */
  static async getCreditScore(userId: string): Promise<CreditScore> {
    try {
      const { data, error } = await supabase
        .from('credit_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.log('Credit score not found, calculating new one...');
        return await this.calculateCreditScore(userId);
      }

      return {
        score: data.score,
        maxLoanLimit: data.max_loan_limit,
        overdraftLimit: data.overdraft_limit,
        riskLevel: data.risk_level,
        lastUpdated: new Date(data.last_updated)
      };
    } catch (error) {
      console.error('Error fetching credit score:', error);
      console.log('Returning default credit score due to error');
      return this.getDefaultCreditScore();
    }
  }

  /**
   * Check loan eligibility and calculate maximum loan amount
   */
  static async checkLoanEligibility(userId: string, requestedAmount: number): Promise<{
    eligible: boolean;
    maxAmount: number;
    reason?: string;
    interestRate: number;
  }> {
    const creditScore = await this.getCreditScore(userId);
    const { data: existingLoans } = await supabase
      .from('loans')
      .select('amount, remaining_balance')
      .eq('user_id', userId)
      .eq('status', 'active');

    const totalExistingDebt = existingLoans?.reduce((sum, loan) => sum + loan.remaining_balance, 0) || 0;
    const availableLimit = creditScore.maxLoanLimit - totalExistingDebt;

    const eligible = availableLimit >= requestedAmount && creditScore.score >= 500;
    const interestRate = this.calculateInterestRate(creditScore.score);

    return {
      eligible,
      maxAmount: availableLimit,
      reason: !eligible ? this.getEligibilityReason(creditScore, availableLimit, requestedAmount) : undefined,
      interestRate
    };
  }

  /**
   * Check overdraft eligibility
   */
  static async checkOverdraftEligibility(userId: string, amount: number): Promise<{
    eligible: boolean;
    limit: number;
    fee: number;
  }> {
    const creditScore = await this.getCreditScore(userId);
    const eligible = creditScore.score >= 450 && amount <= creditScore.overdraftLimit;
    const fee = eligible ? this.calculateOverdraftFee(amount, creditScore.score) : 0;

    return {
      eligible,
      limit: creditScore.overdraftLimit,
      fee
    };
  }

  /**
   * Update credit score after loan repayment
   */
  static async updateScoreAfterRepayment(userId: string, wasOnTime: boolean, amount: number): Promise<void> {
    const currentScore = await this.getCreditScore(userId);
    const scoreChange = wasOnTime ? 
      Math.min(50, Math.floor(amount / 1000) * 10) : 
      Math.max(-100, -Math.floor(amount / 1000) * 20);

    const newScore = Math.max(300, Math.min(850, currentScore.score + scoreChange));
    
    await this.updateCreditScore(userId, newScore);
  }

  /**
   * Update credit score after overdraft usage
   */
  static async updateScoreAfterOverdraft(userId: string, wasRepaidOnTime: boolean): Promise<void> {
    const currentScore = await this.getCreditScore(userId);
    const scoreChange = wasRepaidOnTime ? 10 : -30;
    
    const newScore = Math.max(300, Math.min(850, currentScore.score + scoreChange));
    
    await this.updateCreditScore(userId, newScore);
  }

  private static async getFinancialMetrics(userId: string): Promise<FinancialMetrics> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get loan history
    const { data: loans } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId);

    // Get overdraft history
    const { data: overdrafts } = await supabase
      .from('overdrafts')
      .select('*')
      .eq('user_id', userId);

    return {
      averageBalance: this.calculateAverageBalance(transactions || []),
      transactionFrequency: this.calculateTransactionFrequency(transactions || []),
      depositConsistency: this.calculateDepositConsistency(transactions || []),
      loanRepaymentHistory: this.calculateLoanRepaymentHistory(loans || []),
      overdraftRepaymentHistory: this.calculateOverdraftRepaymentHistory(overdrafts || [])
    };
  }

  private static computeScore(metrics: FinancialMetrics): number {
    const score = 
      metrics.loanRepaymentHistory * this.SCORE_WEIGHTS.loanRepayment +
      metrics.overdraftRepaymentHistory * this.SCORE_WEIGHTS.overdraftRepayment +
      metrics.depositConsistency * this.SCORE_WEIGHTS.depositConsistency +
      metrics.transactionFrequency * this.SCORE_WEIGHTS.transactionFrequency +
      metrics.averageBalance * this.SCORE_WEIGHTS.averageBalance;

    return Math.round(score * 1000); // Scale to 0-1000 range
  }

  private static determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= this.RISK_THRESHOLDS.low) return 'low';
    if (score >= this.RISK_THRESHOLDS.medium) return 'medium';
    return 'high';
  }

  private static calculateLoanLimit(score: number, metrics: FinancialMetrics): number {
    const baseLimit = this.INITIAL_LOAN_LIMIT;
    const scoreMultiplier = score / 400; // Normalize to initial score
    const activityBonus = Math.min(0.5, metrics.transactionFrequency * 0.1);
    
    return Math.round(baseLimit * scoreMultiplier * (1 + activityBonus));
  }

  private static calculateOverdraftLimit(score: number, metrics: FinancialMetrics): number {
    const baseLimit = this.INITIAL_OVERDRAFT_LIMIT;
    const scoreMultiplier = score / 400;
    const balanceBonus = Math.min(0.3, metrics.averageBalance / 100000);
    
    return Math.round(baseLimit * scoreMultiplier * (1 + balanceBonus));
  }

  private static calculateInterestRate(score: number): number {
    if (score >= 700) return 0.12; // 12% for excellent credit
    if (score >= 600) return 0.15; // 15% for good credit
    if (score >= 500) return 0.18; // 18% for fair credit
    return 0.25; // 25% for poor credit
  }

  private static calculateOverdraftFee(amount: number, score: number): number {
    const baseFee = amount * 0.05; // 5% base fee
    const scoreDiscount = score >= 600 ? 0.5 : 1; // 50% discount for good credit
    return Math.round(baseFee * scoreDiscount);
  }

  private static getEligibilityReason(creditScore: CreditScore, availableLimit: number, requestedAmount: number): string {
    if (creditScore.score < 500) return 'Credit score too low (minimum 500 required)';
    if (availableLimit < requestedAmount) return `Insufficient loan limit. Maximum available: KES ${availableLimit.toLocaleString()}`;
    return 'Not eligible for loans at this time';
  }

  private static calculateAverageBalance(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    const balances = transactions.map(t => t.balance_after || 0);
    return balances.reduce((sum, balance) => sum + balance, 0) / balances.length;
  }

  private static calculateTransactionFrequency(transactions: any[]): number {
    const uniqueDays = new Set(transactions.map(t => new Date(t.created_at).toDateString())).size;
    return Math.min(1, uniqueDays / 30); // Normalize to 0-1
  }

  private static calculateDepositConsistency(transactions: any[]): number {
    const deposits = transactions.filter(t => t.type === 'deposit');
    const depositDays = new Set(deposits.map(t => new Date(t.created_at).toDateString())).size;
    return Math.min(1, depositDays / 15); // Normalize to 0-1
  }

  private static calculateLoanRepaymentHistory(loans: any[]): number {
    if (loans.length === 0) return 0.5; // Neutral score for new users
    
    const onTimeRepayments = loans.filter(loan => 
      loan.status === 'paid' && 
      new Date(loan.paid_at) <= new Date(loan.due_date)
    ).length;
    
    return onTimeRepayments / loans.length;
  }

  private static calculateOverdraftRepaymentHistory(overdrafts: any[]): number {
    if (overdrafts.length === 0) return 0.5;
    
    const onTimeRepayments = overdrafts.filter(od => 
      od.status === 'repaid' && 
      new Date(od.repaid_at) <= new Date(od.due_date)
    ).length;
    
    return onTimeRepayments / overdrafts.length;
  }

  private static async saveCreditScore(userId: string, creditScore: CreditScore): Promise<void> {
    const { error } = await supabase
      .from('credit_scores')
      .upsert({
        user_id: userId,
        score: creditScore.score,
        max_loan_limit: creditScore.maxLoanLimit,
        overdraft_limit: creditScore.overdraftLimit,
        risk_level: creditScore.riskLevel,
        last_updated: creditScore.lastUpdated.toISOString()
      });

    if (error) {
      console.error('Error saving credit score:', error);
    }
  }

  private static async updateCreditScore(userId: string, newScore: number): Promise<void> {
    const { error } = await supabase
      .from('credit_scores')
      .update({ 
        score: newScore,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating credit score:', error);
    }
  }

  private static getDefaultCreditScore(): CreditScore {
    return {
      score: this.INITIAL_SCORE,
      maxLoanLimit: this.INITIAL_LOAN_LIMIT,
      overdraftLimit: this.INITIAL_OVERDRAFT_LIMIT,
      riskLevel: 'high',
      lastUpdated: new Date()
    };
  }
} 