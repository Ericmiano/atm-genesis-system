
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

      // Call the database function directly using supabase.rpc
      const { data: loanId, error } = await supabase.rpc('process_loan_application', {
        p_user_id: userId.user.id,
        p_type: type,
        p_principal: amount,
        p_term_months: termMonths,
        p_purpose: purpose,
        p_collateral: collateral || null
      });

      if (error) {
        console.error('Loan application error:', error);
        return { success: false, message: 'Failed to process loan application' };
      }

      // Auto-approve loans for demo purposes
      const { error: approvalError } = await supabase.rpc('approve_loan', {
        p_loan_id: loanId
      });

      if (approvalError) {
        console.error('Loan approval error:', approvalError);
        return { success: true, message: 'Loan application submitted successfully and is pending approval' };
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
      const interestPortion = paymentAmount * 0.3; // Simple calculation
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
