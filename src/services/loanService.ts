
import { supabase } from '@/integrations/supabase/client';
import { Loan } from '../types/atm';

export class LoanService {
  async getUserLoans(): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(loan => ({
        id: loan.id,
        userId: loan.user_id,
        type: loan.type as Loan['type'],
        principal: parseFloat(loan.principal.toString()),
        interestRate: parseFloat(loan.interest_rate.toString()),
        termMonths: loan.term_months,
        monthlyPayment: parseFloat(loan.monthly_payment.toString()),
        totalAmount: parseFloat(loan.total_amount.toString()),
        remainingBalance: parseFloat(loan.remaining_balance.toString()),
        status: loan.status as Loan['status'],
        applicationDate: loan.application_date,
        approvalDate: loan.approval_date,
        disbursementDate: loan.disbursement_date,
        nextPaymentDate: loan.next_payment_date,
        collateral: loan.collateral,
        purpose: loan.purpose
      }));
    } catch (error) {
      console.error('Error fetching user loans:', error);
      return [];
    }
  }

  async applyForLoan(
    type: Loan['type'],
    amount: number,
    termMonths: number,
    purpose: string,
    collateral?: string
  ): Promise<{ success: boolean; message: string; loan?: Loan }> {
    try {
      const { data: userId } = await supabase.auth.getUser();
      if (!userId.user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Calculate loan details
      const interestRates = {
        'PERSONAL': 15.0,
        'BUSINESS': 12.0,
        'EMERGENCY': 18.0,
        'EDUCATION': 10.0
      };
      
      const interestRate = interestRates[type] || 15.0;
      const monthlyRate = interestRate / 100 / 12;
      let monthlyPayment: number;
      
      if (monthlyRate === 0) {
        monthlyPayment = amount / termMonths;
      } else {
        monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
      }
      
      const totalAmount = monthlyPayment * termMonths;

      // Insert loan application directly
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .insert({
          user_id: userId.user.id,
          type: type,
          principal: amount,
          interest_rate: interestRate,
          term_months: termMonths,
          monthly_payment: Math.round(monthlyPayment * 100) / 100,
          total_amount: Math.round(totalAmount * 100) / 100,
          remaining_balance: Math.round(totalAmount * 100) / 100,
          status: 'PENDING',
          purpose: purpose,
          collateral: collateral || null
        })
        .select()
        .single();

      if (loanError) {
        console.error('Loan application error:', loanError);
        return { success: false, message: 'Failed to process loan application' };
      }

      // Auto-approve for demo purposes
      const { error: approvalError } = await supabase
        .from('loans')
        .update({
          status: 'ACTIVE',
          approval_date: new Date().toISOString(),
          disbursement_date: new Date().toISOString(),
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', loanData.id);

      if (!approvalError) {
        // Get current user balance first
        const { data: currentUser, error: userError } = await supabase
          .from('users')
          .select('balance')
          .eq('id', userId.user.id)
          .single();

        if (!userError && currentUser) {
          // Add loan amount to user's balance
          const newBalance = parseFloat(currentUser.balance.toString()) + amount;
          await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', userId.user.id);
        }

        // Create disbursement transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: userId.user.id,
            type: 'LOAN_DISBURSEMENT',
            amount: amount,
            description: `${type} loan disbursement`,
            status: 'SUCCESS',
            loan_id: loanData.id
          });
      }

      return { success: true, message: 'Loan approved and disbursed successfully!' };
    } catch (error) {
      console.error('Apply for loan error:', error);
      return { success: false, message: 'Failed to apply for loan' };
    }
  }

  async makePayment(loanId: string, amount: number): Promise<{ success: boolean; message: string; balance?: number }> {
    try {
      const { data: userId } = await supabase.auth.getUser();
      if (!userId.user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Get current user balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId.user.id)
        .single();

      if (userError || !user) {
        return { success: false, message: 'Failed to get user balance' };
      }

      const currentBalance = parseFloat(user.balance.toString());
      if (currentBalance < amount) {
        return { success: false, message: 'Insufficient funds' };
      }

      // Get loan details
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();

      if (loanError || !loan) {
        return { success: false, message: 'Loan not found' };
      }

      const remainingBalance = parseFloat(loan.remaining_balance.toString());
      const paymentAmount = Math.min(amount, remainingBalance);
      const newRemainingBalance = remainingBalance - paymentAmount;
      const newUserBalance = currentBalance - paymentAmount;

      // Update loan balance
      const { error: updateLoanError } = await supabase
        .from('loans')
        .update({
          remaining_balance: newRemainingBalance,
          status: newRemainingBalance === 0 ? 'COMPLETED' : loan.status,
          next_payment_date: newRemainingBalance > 0 ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
        })
        .eq('id', loanId);

      if (updateLoanError) {
        return { success: false, message: 'Failed to update loan' };
      }

      // Update user balance
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ balance: newUserBalance })
        .eq('id', userId.user.id);

      if (updateUserError) {
        return { success: false, message: 'Failed to update balance' };
      }

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userId.user.id,
          type: 'LOAN_PAYMENT',
          amount: paymentAmount,
          description: `Loan payment for ${loan.type} loan`,
          status: 'SUCCESS',
          loan_id: loanId
        });

      // Create loan payment record
      const interestPortion = paymentAmount * 0.3;
      const principalPortion = paymentAmount - interestPortion;

      await supabase
        .from('loan_payments')
        .insert({
          loan_id: loanId,
          amount: paymentAmount,
          principal_portion: principalPortion,
          interest_portion: interestPortion,
          remaining_balance: newRemainingBalance,
          status: 'SUCCESS'
        });

      return { 
        success: true, 
        message: `Payment of KES ${paymentAmount.toLocaleString()} successful`,
        balance: newUserBalance
      };
    } catch (error) {
      console.error('Make payment error:', error);
      return { success: false, message: 'Payment failed' };
    }
  }
}

export const loanService = new LoanService();
