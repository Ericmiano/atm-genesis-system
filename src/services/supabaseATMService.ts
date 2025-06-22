
import { User, Transaction, Bill, Loan } from '../types/atm';
import { authService } from './authService';
import { transactionService } from './transactionService';
import { userService } from './userService';
import { adminService } from './adminService';
import { auditService } from './auditService';
import { loanService } from './loanService';

class SupabaseATMService {
  // Authentication methods
  async getCurrentUser(): Promise<User | null> {
    return authService.getCurrentUser();
  }

  async authenticate(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    const result = await authService.authenticate(email, password);
    if (result.success) {
      await auditService.logAuditTrail('LOGIN', 'User logged in successfully');
    }
    return result;
  }

  async verifyPin(pin: string): Promise<{ success: boolean; message: string }> {
    const result = await authService.verifyPin(pin);
    if (result.success) {
      await auditService.logAuditTrail('PIN_VERIFICATION', 'PIN verified successfully');
    } else {
      await auditService.logAuditTrail('PIN_VERIFICATION_FAILED', 'Invalid PIN entered');
    }
    return result;
  }

  async logout(): Promise<void> {
    await auditService.logAuditTrail('LOGOUT', 'User logged out');
    await authService.logout();
  }

  // Transaction methods
  async getBalance(): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.getBalance();
  }

  async withdraw(amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.withdraw(amount);
  }

  async deposit(amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.deposit(amount);
  }

  async transfer(toAccount: string, amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.transfer(toAccount, amount);
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    return transactionService.getTransactionHistory();
  }

  async getBills(): Promise<Bill[]> {
    return transactionService.getBills();
  }

  async getAvailableBills(): Promise<Bill[]> {
    return transactionService.getBills();
  }

  async payBill(billId: string, amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.payBill(billId, amount);
  }

  // Loan methods
  async getUserLoans(): Promise<Loan[]> {
    return loanService.getUserLoans();
  }

  async applyForLoan(
    type: Loan['type'],
    amount: number,
    termMonths: number,
    purpose: string,
    collateral?: string
  ): Promise<{ success: boolean; message: string; loan?: Loan }> {
    return loanService.applyForLoan(type, amount, termMonths, purpose, collateral);
  }

  async makePayment(loanId: string, amount: number): Promise<{ success: boolean; message: string; balance?: number }> {
    return loanService.makePayment(loanId, amount);
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    return userService.getAllUsers();
  }

  // Admin methods
  async createUser(email: string, password: string, name: string, initialBalance: number = 0): Promise<{ success: boolean; message: string; userId?: string }> {
    const result = await adminService.createUser(email, password, name, initialBalance);
    if (result.success) {
      await auditService.logAuditTrail('CREATE_USER', `Created user account for ${email}`);
    }
    return result;
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const result = await adminService.deleteUser(userId);
    if (result.success) {
      await auditService.logAuditTrail('DELETE_USER', `Deleted user account ${userId}`);
    }
    return result;
  }
}

export const supabaseATMService = new SupabaseATMService();
