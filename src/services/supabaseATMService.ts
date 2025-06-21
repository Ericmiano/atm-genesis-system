<<<<<<< HEAD
import { supabase } from '@/integrations/supabase/client';
import { User, Transaction, Loan, Bill } from '../types/atm';
=======

import { User, Transaction, Bill } from '../types/atm';
import { authService } from './authService';
import { transactionService } from './transactionService';
import { userService } from './userService';
import { adminService } from './adminService';
import { auditService } from './auditService';
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0

class SupabaseATMService {
  // Authentication methods
  async getCurrentUser(): Promise<User | null> {
<<<<<<< HEAD
    try {
      console.log('Service: Getting current user...');
      
      // Check for demo user in sessionStorage first
      const demoUserStr = sessionStorage.getItem('demoUser');
      if (demoUserStr) {
        console.log('Service: Found demo user in sessionStorage');
        const demoUser = JSON.parse(demoUserStr);
        return demoUser as User;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('Service: No authenticated user found');
        return null;
      }

      console.log('Service: Authenticated user found:', user.email);
      
      // Get user from database
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (dbUser && !error) {
        console.log('Service: User data retrieved from database');
        return {
          id: dbUser.id,
          accountNumber: dbUser.account_number,
          username: dbUser.username,
          password: '', // Don't expose password
          name: dbUser.name,
          email: dbUser.email,
          pin: dbUser.pin,
          balance: parseFloat(dbUser.balance.toString()),
          role: dbUser.role as 'USER' | 'ADMIN',
          isLocked: dbUser.is_locked,
          lockReason: dbUser.lock_reason,
          lockDate: dbUser.lock_date,
          failedAttempts: dbUser.failed_attempts,
          failedPasswordAttempts: dbUser.failed_password_attempts,
          lastPasswordAttempt: dbUser.last_password_attempt,
          createdAt: dbUser.created_at,
          lastLogin: dbUser.last_login,
          creditScore: dbUser.credit_score,
          monthlyIncome: dbUser.monthly_income ? parseFloat(dbUser.monthly_income.toString()) : undefined,
          cardNumber: dbUser.card_number,
          expiryDate: dbUser.expiry_date,
          cvv: dbUser.cvv,
          cardType: dbUser.card_type as 'VISA' | 'MASTERCARD',
          passwordLastChanged: dbUser.password_last_changed,
          mustChangePassword: dbUser.must_change_password
        };
      }

      console.log('Service: No user data found in database');
      return null;
    } catch (error) {
      console.error('Service: Error getting current user:', error);
      return null;
    }
  }

  async authenticate(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      console.log('Service: Starting authentication for:', email);
      
      // For demo purposes, allow specific test accounts without database
      if (email === 'john@example.com' && password === 'password123') {
        console.log('Service: Demo user login successful');
        const demoUser: User = {
          id: 'demo-user-1',
          accountNumber: '1234567890',
          username: 'john',
          password: '',
          name: 'John Doe',
          email: email,
          pin: '0000',
          balance: 25000,
          role: 'USER',
          isLocked: false,
          lockReason: null,
          lockDate: null,
          failedAttempts: 0,
          failedPasswordAttempts: 0,
          lastPasswordAttempt: null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          creditScore: 750,
          monthlyIncome: 50000,
          cardNumber: '4111111111111111',
          expiryDate: '12/25',
          cvv: '123',
          cardType: 'VISA',
          passwordLastChanged: null,
          mustChangePassword: false
        };
        
        // Store demo user in sessionStorage for getCurrentUser to retrieve
        sessionStorage.setItem('demoUser', JSON.stringify(demoUser));
        
        return { success: true, message: 'Login successful', user: demoUser };
      }
      
      if (email === 'admin@example.com' && password === 'admin123') {
        console.log('Service: Demo admin login successful');
        const demoAdmin: User = {
          id: 'demo-admin-1',
          accountNumber: '0987654321',
          username: 'admin',
          password: '',
          name: 'Admin User',
          email: email,
          pin: '0000',
          balance: 50000,
          role: 'ADMIN',
          isLocked: false,
          lockReason: null,
          lockDate: null,
          failedAttempts: 0,
          failedPasswordAttempts: 0,
          lastPasswordAttempt: null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          creditScore: 800,
          monthlyIncome: 100000,
          cardNumber: '5555555555554444',
          expiryDate: '12/25',
          cvv: '123',
          cardType: 'MASTERCARD',
          passwordLastChanged: null,
          mustChangePassword: false
        };
        
        // Store demo admin in sessionStorage for getCurrentUser to retrieve
        sessionStorage.setItem('demoUser', JSON.stringify(demoAdmin));
        
        return { success: true, message: 'Login successful', user: demoAdmin };
      }
      
      console.log('Service: Attempting database authentication');
      
      // For database users, authenticate with Supabase auth first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.log('Service: Supabase auth error:', authError.message);
        return { success: false, message: authError.message || 'Invalid credentials' };
      }

      if (authData.user) {
        console.log('Service: Supabase auth successful for:', authData.user.email);
        
        // Now get user data from database
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (dbError || !dbUser) {
          console.log('Service: User not found in database, using fallback data');
          // Return fallback data for authenticated users without database record
          const fallbackUser: User = {
            id: authData.user.id,
            accountNumber: '1234567890',
            username: email.split('@')[0],
            password: '',
            name: email.split('@')[0],
            email: authData.user.email || email,
            pin: '0000',
            balance: 10000,
            role: 'USER',
            isLocked: false,
            lockReason: null,
            lockDate: null,
            failedAttempts: 0,
            failedPasswordAttempts: 0,
            lastPasswordAttempt: null,
            createdAt: authData.user.created_at || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            creditScore: 700,
            monthlyIncome: 30000,
            cardNumber: '4111111111111111',
            expiryDate: '12/25',
            cvv: '123',
            cardType: 'VISA',
            passwordLastChanged: null,
            mustChangePassword: false
          };
          return { success: true, message: 'Login successful', user: fallbackUser };
        }

        console.log('Service: User data retrieved from database');
        
        // Check if account is locked
        if (dbUser.is_locked) {
          console.log('Service: Account is locked:', dbUser.lock_reason);
          return { 
            success: false, 
            message: `Account is locked: ${dbUser.lock_reason || 'Contact administrator'}` 
          };
        }

        // Update last login and reset failed attempts
        await this.updateLastLogin(dbUser.id);
        await this.resetFailedAttempts(dbUser.id);
        
        // Convert database user to User type
        const user: User = {
          id: dbUser.id,
          accountNumber: dbUser.account_number,
          username: dbUser.username,
          password: '', // Don't expose password
          name: dbUser.name,
          email: dbUser.email,
          pin: dbUser.pin,
          balance: parseFloat(dbUser.balance.toString()),
          role: dbUser.role as 'USER' | 'ADMIN',
          isLocked: dbUser.is_locked,
          lockReason: dbUser.lock_reason,
          lockDate: dbUser.lock_date,
          failedAttempts: dbUser.failed_attempts,
          failedPasswordAttempts: dbUser.failed_password_attempts,
          lastPasswordAttempt: dbUser.last_password_attempt,
          createdAt: dbUser.created_at,
          lastLogin: dbUser.last_login,
          creditScore: dbUser.credit_score,
          monthlyIncome: dbUser.monthly_income ? parseFloat(dbUser.monthly_income.toString()) : undefined,
          cardNumber: dbUser.card_number,
          expiryDate: dbUser.expiry_date,
          cvv: dbUser.cvv,
          cardType: dbUser.card_type as 'VISA' | 'MASTERCARD',
          passwordLastChanged: dbUser.password_last_changed,
          mustChangePassword: dbUser.must_change_password
        };
        
        return { success: true, message: 'Login successful', user };
      }

      console.log('Service: No user data returned from Supabase');
      return { success: false, message: 'Authentication failed' };
    } catch (error) {
      console.error('Service: Authentication error:', error);
      return { success: false, message: 'An unexpected error occurred' };
=======
    return authService.getCurrentUser();
  }

  async authenticate(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    const result = await authService.authenticate(email, password);
    if (result.success) {
      await auditService.logAuditTrail('LOGIN', 'User logged in successfully');
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
    }
    return result;
  }

  private async updateFailedPasswordAttempts(userId: string): Promise<void> {
    try {
      // First get current failed attempts
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('failed_password_attempts')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Service: Error fetching current failed attempts:', fetchError);
        return;
      }

      // Update with incremented value
      const { error } = await supabase
        .from('users')
        .update({
          failed_password_attempts: (user?.failed_password_attempts || 0) + 1,
          last_password_attempt: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Service: Error updating failed password attempts:', error);
      }
    } catch (error) {
      console.error('Service: Error updating failed password attempts:', error);
    }
  }

  private async resetFailedAttempts(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          failed_attempts: 0,
          failed_password_attempts: 0,
          last_password_attempt: null
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Service: Error resetting failed attempts:', error);
      }
    } catch (error) {
      console.error('Service: Error resetting failed attempts:', error);
    }
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Service: Error updating last login:', error);
      }
    } catch (error) {
      console.error('Service: Error updating last login:', error);
    }
  }

  async verifyPin(pin: string): Promise<{ success: boolean; message: string }> {
<<<<<<< HEAD
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (!pin || typeof pin !== 'string') {
        return { success: false, message: 'Invalid PIN format' };
      }

      if (user.pin === pin) {
        await this.logAuditTrail('PIN_VERIFICATION', 'PIN verified successfully');
        return { success: true, message: 'PIN verified' };
      } else {
        // Increment failed PIN attempts safely
        try {
          const { error } = await supabase
            .from('users')
            .update({ 
              failed_attempts: (user.failedAttempts || 0) + 1 
            })
            .eq('id', user.id);

          if (error) {
            console.error('Service: Error updating failed PIN attempts:', error);
          }
        } catch (updateError) {
          console.error('Service: Error updating failed PIN attempts:', updateError);
        }

        await this.logAuditTrail('PIN_VERIFICATION_FAILED', 'Invalid PIN entered');
        return { success: false, message: 'Invalid PIN' };
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  async getBalance(): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      await this.logTransaction('BALANCE_INQUIRY', 0, 'Balance inquiry');
      return { success: true, balance: user.balance, message: 'Balance retrieved successfully' };
    } catch (error) {
      console.error('Get balance error:', error);
      return { success: false, message: 'Failed to retrieve balance' };
    }
  }

  async withdraw(amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Input validation
      if (!amount || isNaN(amount) || amount <= 0) {
        return { success: false, message: 'Invalid amount' };
      }

      if (user.balance < amount) {
        await this.logTransaction('WITHDRAWAL', amount, 'Insufficient funds', 'FAILED');
        return { success: false, message: 'Insufficient funds' };
      }

      const newBalance = user.balance - amount;

      // Update user balance
      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (error) {
        console.error('Service: Error updating balance for withdrawal:', error);
        await this.logTransaction('WITHDRAWAL', amount, 'Database error during withdrawal', 'FAILED');
        return { success: false, message: 'Withdrawal failed due to system error' };
      }

      // Log transaction
      await this.logTransaction('WITHDRAWAL', amount, `Cash withdrawal of KES ${amount.toLocaleString()}`);

      return { success: true, balance: newBalance, message: `Successfully withdrew KES ${amount.toLocaleString()}` };
    } catch (error) {
      console.error('Withdrawal error:', error);
      return { success: false, message: 'Withdrawal failed' };
    }
  }

  async deposit(amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Input validation
      if (!amount || isNaN(amount) || amount <= 0) {
        return { success: false, message: 'Invalid amount' };
      }

      const newBalance = user.balance + amount;

      // Update user balance
      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (error) {
        console.error('Service: Error updating balance for deposit:', error);
        await this.logTransaction('DEPOSIT', amount, 'Database error during deposit', 'FAILED');
        return { success: false, message: 'Deposit failed due to system error' };
      }

      // Log transaction
      await this.logTransaction('DEPOSIT', amount, `Cash deposit of KES ${amount.toLocaleString()}`);

      return { success: true, balance: newBalance, message: `Successfully deposited KES ${amount.toLocaleString()}` };
    } catch (error) {
      console.error('Deposit error:', error);
      return { success: false, message: 'Deposit failed' };
    }
  }

  async transfer(toAccount: string, amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (amount <= 0) {
        return { success: false, message: 'Invalid amount' };
      }

      if (user.balance < amount) {
        return { success: false, message: 'Insufficient funds' };
      }

      // Check if target account exists
      const { data: targetUser } = await supabase
        .from('users')
        .select('id, name')
        .eq('account_number', toAccount)
        .single();

      if (!targetUser) {
        return { success: false, message: 'Target account not found' };
      }

      // Perform transfer (this should be in a transaction)
      const newBalance = user.balance - amount;

      await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      // Update target user balance
      const { data: targetUserBalance } = await supabase
        .from('users')
        .select('balance')
        .eq('id', targetUser.id)
        .single();

      if (targetUserBalance) {
        const targetNewBalance = parseFloat(targetUserBalance.balance.toString()) + amount;
        await supabase
          .from('users')
          .update({ balance: targetNewBalance })
          .eq('id', targetUser.id);
      }

      // Log transactions
      await this.logTransaction('TRANSFER', amount, `Transfer to ${targetUser.name} (${toAccount})`, 'SUCCESS', user.accountNumber, toAccount);

      return { success: true, balance: newBalance, message: `Successfully transferred KES ${amount.toLocaleString()} to ${targetUser.name}` };
    } catch (error) {
      console.error('Transfer error:', error);
      return { success: false, message: 'Transfer failed' };
    }
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.map(t => ({
        id: t.id,
        userId: t.user_id,
        type: t.type as Transaction['type'],
        amount: parseFloat(t.amount.toString()),
        description: t.description,
        timestamp: t.timestamp,
        status: t.status as Transaction['status'],
        fromAccount: t.from_account,
        toAccount: t.to_account,
        loanId: t.loan_id
      }));
    } catch (error) {
      console.error('Get transaction history error:', error);
      return [];
    }
  }

  async getBills(): Promise<Bill[]> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      return data.map(b => ({
        id: b.id,
        type: b.type as Bill['type'],
        name: b.name,
        amount: parseFloat(b.amount.toString()),
        dueDate: b.due_date
      }));
    } catch (error) {
      console.error('Get bills error:', error);
      return [];
    }
  }

  async payBill(billId: string, amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (user.balance < amount) {
        return { success: false, message: 'Insufficient funds' };
      }

      const { data: bill } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();

      if (!bill) {
        return { success: false, message: 'Bill not found' };
      }

      const newBalance = user.balance - amount;

      await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      await this.logTransaction('BILL_PAYMENT', amount, `Payment for ${bill.name}`);

      return { success: true, balance: newBalance, message: `Successfully paid ${bill.name}` };
    } catch (error) {
      console.error('Bill payment error:', error);
      return { success: false, message: 'Bill payment failed' };
    }
  }

  private async logTransaction(
    type: Transaction['type'], 
    amount: number, 
    description: string, 
    status: Transaction['status'] = 'SUCCESS',
    fromAccount?: string,
    toAccount?: string
  ): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type,
          amount,
          description,
          status,
          from_account: fromAccount,
          to_account: toAccount
        });
    } catch (error) {
      console.error('Log transaction error:', error);
    }
  }

  private async logAuditTrail(action: string, details: string): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action,
          details
        });
    } catch (error) {
      console.error('Log audit trail error:', error);
=======
    const result = await authService.verifyPin(pin);
    if (result.success) {
      await auditService.logAuditTrail('PIN_VERIFICATION', 'PIN verified successfully');
    } else {
      await auditService.logAuditTrail('PIN_VERIFICATION_FAILED', 'Invalid PIN entered');
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
    }
    return result;
  }

  async logout(): Promise<void> {
<<<<<<< HEAD
    try {
      // Clear demo user from sessionStorage
      sessionStorage.removeItem('demoUser');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Service: Logout error:', error);
    }
  }

  // Additional methods for components
  getAvailableBills(): Bill[] {
    // Mock data for now - in a real app, this would fetch from the database
    return [
      {
        id: '1',
        type: 'UTILITY',
        name: 'Electricity Bill',
        amount: 2500,
        dueDate: '2024-01-20'
      },
      {
        id: '2',
        type: 'UTILITY',
        name: 'Water Bill',
        amount: 800,
        dueDate: '2024-01-25'
      },
      {
        id: '3',
        type: 'SUBSCRIPTION',
        name: 'Internet Bill',
        amount: 1500,
        dueDate: '2024-01-30'
      },
      {
        id: '4',
        type: 'SUBSCRIPTION',
        name: 'DSTV Subscription',
        amount: 2000,
        dueDate: '2024-02-05'
      }
    ];
  }

  getUserLoans(): Loan[] {
    // Mock data for now - in a real app, this would fetch from the database
    return [
      {
        id: '1',
        userId: 'user1',
        type: 'PERSONAL',
        principal: 50000,
        remainingBalance: 35000,
        interestRate: 12,
        termMonths: 12,
        monthlyPayment: 5000,
        status: 'ACTIVE',
        applicationDate: '2024-01-01',
        approvalDate: '2024-01-02',
        nextPaymentDate: '2024-02-01',
        purpose: 'Home renovation',
        collateral: 'Vehicle'
      }
    ];
  }

  async applyForLoan(
    type: Loan['type'],
    amount: number,
    termMonths: number,
    purpose: string,
    collateral?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Mock loan application logic
      await this.logAuditTrail('LOAN_APPLICATION', `Applied for ${type} loan of KES ${amount.toLocaleString()}`);
      
      return { success: true, message: 'Loan application submitted successfully' };
    } catch (error) {
      console.error('Loan application error:', error);
      return { success: false, message: 'Loan application failed' };
    }
  }

  async makePayment(loanId: string, amount: number): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (user.balance < amount) {
        return { success: false, message: 'Insufficient funds' };
      }

      // Mock payment logic
      const newBalance = user.balance - amount;
      await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      await this.logTransaction('LOAN_PAYMENT', amount, `Loan payment for loan ${loanId}`);
      
      return { success: true, message: 'Payment processed successfully' };
    } catch (error) {
      console.error('Loan payment error:', error);
      return { success: false, message: 'Payment failed' };
    }
  }

  getAllUsers(): User[] {
    // Mock data for admin panel
    return [
      {
        id: '1',
        accountNumber: '1234567890',
        username: 'john_doe',
        password: '',
        name: 'John Doe',
        email: 'john@example.com',
        pin: '1234',
        balance: 50000,
        role: 'USER',
        isLocked: false,
        lockReason: '',
        lockDate: '',
        failedAttempts: 0,
        failedPasswordAttempts: 0,
        lastPasswordAttempt: '',
        createdAt: '2024-01-01',
        lastLogin: '2024-01-15',
        creditScore: 750,
        monthlyIncome: 45000,
        cardNumber: '1234567890123456',
        expiryDate: '12/25',
        cvv: '123',
        cardType: 'VISA',
        passwordLastChanged: '2024-01-01',
        mustChangePassword: false
      }
    ];
  }

  getAllTransactions(): Transaction[] {
    // Mock data for admin panel
    return [
      {
        id: '1',
        userId: '1',
        type: 'WITHDRAWAL',
        amount: 5000,
        description: 'ATM withdrawal',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'SUCCESS',
        fromAccount: '1234567890',
        toAccount: undefined,
        loanId: undefined
      }
    ];
  }

  getAuditLogs(): any[] {
    // Mock data for admin panel
    return [
      {
        id: '1',
        userId: '1',
        action: 'LOGIN',
        details: 'User logged in successfully',
        timestamp: '2024-01-15T10:30:00Z'
      }
    ];
  }

  getFraudAlerts(): any[] {
    // Mock data for admin panel
    return [
      {
        id: '1',
        userId: '1',
        type: 'SUSPICIOUS_ACTIVITY',
        description: 'Multiple failed login attempts',
        severity: 'HIGH',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'PENDING'
      }
    ];
  }

  unlockAccount(userId: string): boolean {
    // Mock unlock logic
    console.log(`Unlocking account ${userId}`);
    return true;
=======
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

  async payBill(billId: string, amount: number): Promise<{ success: boolean; balance?: number; message: string }> {
    return transactionService.payBill(billId, amount);
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
>>>>>>> 1a9386906cd0b99ea65a3cb17bc553dad145f0f0
  }
}

export const supabaseATMService = new SupabaseATMService();
