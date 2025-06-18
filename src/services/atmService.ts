
import { User, Transaction, AuditLog, ATMSession, FraudAlert, Bill } from '../types/atm';

class ATMService {
  private users: User[] = [];
  private transactions: Transaction[] = [];
  private auditLogs: AuditLog[] = [];
  private sessions: ATMSession[] = [];
  private fraudAlerts: FraudAlert[] = [];
  private currentSession: ATMSession | null = null;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample users with KES amounts
    this.users = [
      {
        id: '1',
        accountNumber: '1234567890',
        name: 'John Kimani',
        email: 'john@example.com',
        pin: '1234',
        balance: 125000, // KES 125,000
        role: 'USER',
        isLocked: false,
        failedAttempts: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        accountNumber: '0987654321',
        name: 'Grace Wanjiku',
        email: 'grace@example.com',
        pin: '5678',
        balance: 87500, // KES 87,500
        role: 'USER',
        isLocked: false,
        failedAttempts: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'admin',
        accountNumber: 'ADMIN001',
        name: 'ATM Administrator',
        email: 'admin@atm.com',
        pin: '0000',
        balance: 0,
        role: 'ADMIN',
        isLocked: false,
        failedAttempts: 0,
        createdAt: new Date().toISOString(),
      }
    ];

    // Sample transactions
    this.transactions = [
      {
        id: '1',
        userId: '1',
        type: 'WITHDRAWAL',
        amount: 5000,
        description: 'Cash withdrawal',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'SUCCESS'
      },
      {
        id: '2',
        userId: '1',
        type: 'DEPOSIT',
        amount: 15000,
        description: 'Cash deposit',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'SUCCESS'
      }
    ];
  }

  // Authentication
  async authenticate(accountNumber: string, pin: string): Promise<{ success: boolean; user?: User; message: string }> {
    const user = this.users.find(u => u.accountNumber === accountNumber);
    
    if (!user) {
      this.logAudit('LOGIN_FAILED', `Failed login attempt for account: ${accountNumber}`);
      return { success: false, message: 'Invalid account number' };
    }

    if (user.isLocked) {
      this.logAudit('LOGIN_BLOCKED', `Login attempt for locked account: ${accountNumber}`, user.id);
      return { success: false, message: 'Account is locked. Please contact customer service.' };
    }

    if (user.pin !== pin) {
      user.failedAttempts++;
      if (user.failedAttempts >= 3) {
        user.isLocked = true;
        this.logAudit('ACCOUNT_LOCKED', `Account locked due to multiple failed attempts`, user.id);
        return { success: false, message: 'Account locked due to multiple failed attempts' };
      }
      this.logAudit('LOGIN_FAILED', `Invalid PIN for account: ${accountNumber}`, user.id);
      return { success: false, message: `Invalid PIN. ${3 - user.failedAttempts} attempts remaining.` };
    }

    // Reset failed attempts on successful login
    user.failedAttempts = 0;
    user.lastLogin = new Date().toISOString();

    // Create session
    this.currentSession = {
      sessionId: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      startTime: new Date().toISOString(),
      isActive: true
    };
    this.sessions.push(this.currentSession);

    this.logAudit('LOGIN_SUCCESS', `Successful login`, user.id);
    return { success: true, user, message: 'Login successful' };
  }

  // Cash Withdrawal
  async withdraw(amount: number): Promise<{ success: boolean; message: string; balance?: number }> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return { success: false, message: 'No active session' };
    }

    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'User not found' };

    if (amount <= 0) {
      return { success: false, message: 'Invalid amount' };
    }

    if (amount > user.balance) {
      this.logTransaction(user.id, 'WITHDRAWAL', amount, 'Insufficient funds withdrawal attempt', 'FAILED');
      return { success: false, message: 'Insufficient funds' };
    }

    // Fraud detection for large amounts (KES 50,000+)
    if (this.detectFraud(user.id, 'WITHDRAWAL', amount)) {
      this.createFraudAlert(user.id, 'SUSPICIOUS_AMOUNT', `Large withdrawal attempt: KES ${amount.toLocaleString()}`);
      return { success: false, message: 'Transaction blocked for security reasons' };
    }

    user.balance -= amount;
    this.logTransaction(user.id, 'WITHDRAWAL', amount, `Cash withdrawal of KES ${amount.toLocaleString()}`, 'SUCCESS');
    this.logAudit('WITHDRAWAL', `Withdrew KES ${amount.toLocaleString()}`, user.id);

    return { success: true, message: `Successfully withdrew KES ${amount.toLocaleString()}`, balance: user.balance };
  }

  // Cash Deposit
  async deposit(amount: number): Promise<{ success: boolean; message: string; balance?: number }> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return { success: false, message: 'No active session' };
    }

    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'User not found' };

    if (amount <= 0) {
      return { success: false, message: 'Invalid amount' };
    }

    user.balance += amount;
    this.logTransaction(user.id, 'DEPOSIT', amount, `Cash deposit of KES ${amount.toLocaleString()}`, 'SUCCESS');
    this.logAudit('DEPOSIT', `Deposited KES ${amount.toLocaleString()}`, user.id);

    return { success: true, message: `Successfully deposited KES ${amount.toLocaleString()}`, balance: user.balance };
  }

  // Balance Inquiry
  async getBalance(): Promise<{ success: boolean; balance?: number; message: string }> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return { success: false, message: 'No active session' };
    }

    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'User not found' };

    this.logTransaction(user.id, 'BALANCE_INQUIRY', 0, 'Balance inquiry', 'SUCCESS');
    this.logAudit('BALANCE_INQUIRY', 'Balance checked', user.id);

    return { success: true, balance: user.balance, message: 'Balance retrieved successfully' };
  }

  // Funds Transfer
  async transfer(toAccountNumber: string, amount: number): Promise<{ success: boolean; message: string; balance?: number }> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return { success: false, message: 'No active session' };
    }

    const fromUser = this.getCurrentUser();
    const toUser = this.users.find(u => u.accountNumber === toAccountNumber);

    if (!fromUser) return { success: false, message: 'User not found' };
    if (!toUser) return { success: false, message: 'Recipient account not found' };
    if (amount <= 0) return { success: false, message: 'Invalid amount' };
    if (amount > fromUser.balance) return { success: false, message: 'Insufficient funds' };
    if (fromUser.accountNumber === toAccountNumber) return { success: false, message: 'Cannot transfer to same account' };

    fromUser.balance -= amount;
    toUser.balance += amount;

    this.logTransaction(fromUser.id, 'TRANSFER', amount, `Transfer to ${toAccountNumber}`, 'SUCCESS', fromUser.accountNumber, toAccountNumber);
    this.logAudit('TRANSFER', `Transferred KES ${amount.toLocaleString()} to ${toAccountNumber}`, fromUser.id);

    return { success: true, message: `Successfully transferred KES ${amount.toLocaleString()} to ${toAccountNumber}`, balance: fromUser.balance };
  }

  // PIN Change
  async changePin(currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return { success: false, message: 'No active session' };
    }

    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'User not found' };

    if (user.pin !== currentPin) {
      return { success: false, message: 'Current PIN is incorrect' };
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return { success: false, message: 'PIN must be 4 digits' };
    }

    user.pin = newPin;
    this.logTransaction(user.id, 'PIN_CHANGE', 0, 'PIN changed successfully', 'SUCCESS');
    this.logAudit('PIN_CHANGE', 'PIN changed', user.id);

    return { success: true, message: 'PIN changed successfully' };
  }

  // Bill Payment
  async payBill(billId: string, amount: number): Promise<{ success: boolean; message: string; balance?: number }> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return { success: false, message: 'No active session' };
    }

    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'User not found' };

    if (amount <= 0) return { success: false, message: 'Invalid amount' };
    if (amount > user.balance) return { success: false, message: 'Insufficient funds' };

    user.balance -= amount;
    this.logTransaction(user.id, 'BILL_PAYMENT', amount, `Bill payment: ${billId}`, 'SUCCESS');
    this.logAudit('BILL_PAYMENT', `Paid bill ${billId}: KES ${amount.toLocaleString()}`, user.id);

    return { success: true, message: `Bill payment of KES ${amount.toLocaleString()} successful`, balance: user.balance };
  }

  // Transaction History
  getTransactionHistory(limit: number = 10): Transaction[] {
    if (!this.currentSession || !this.currentSession.isActive) {
      return [];
    }

    return this.transactions
      .filter(t => t.userId === this.currentSession!.userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Get available bills
  getAvailableBills(): Bill[] {
    return [
      { id: 'KPLC001', type: 'UTILITY', name: 'Kenya Power', amount: 2500, dueDate: '2024-07-15' },
      { id: 'NAIROBI_WATER', type: 'UTILITY', name: 'Nairobi Water', amount: 1200, dueDate: '2024-07-20' },
      { id: 'SAFARICOM', type: 'SUBSCRIPTION', name: 'Safaricom Postpaid', amount: 3000, dueDate: '2024-07-10' },
      { id: 'DSTV', type: 'SUBSCRIPTION', name: 'DSTV Premium', amount: 4500, dueDate: '2024-07-25' }
    ];
  }

  // Logout
  logout(): void {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      this.currentSession.endTime = new Date().toISOString();
      this.logAudit('LOGOUT', 'User logged out', this.currentSession.userId);
      this.currentSession = null;
    }
  }

  // Admin functions
  getAllUsers(): User[] {
    return this.users;
  }

  getAllTransactions(): Transaction[] {
    return this.transactions;
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getFraudAlerts(): FraudAlert[] {
    return this.fraudAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  unlockAccount(userId: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isLocked = false;
      user.failedAttempts = 0;
      this.logAudit('ACCOUNT_UNLOCKED', `Account unlocked by admin`, userId);
      return true;
    }
    return false;
  }

  // Private helper methods
  private getCurrentUser(): User | undefined {
    if (!this.currentSession) return undefined;
    return this.users.find(u => u.id === this.currentSession!.userId);
  }

  private logTransaction(userId: string, type: Transaction['type'], amount: number, description: string, status: Transaction['status'], fromAccount?: string, toAccount?: string): void {
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      type,
      amount,
      description,
      timestamp: new Date().toISOString(),
      status,
      fromAccount,
      toAccount
    };
    this.transactions.push(transaction);
  }

  private logAudit(action: string, details: string, userId?: string): void {
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      userAgent: 'ATM-System'
    };
    this.auditLogs.push(log);
  }

  private detectFraud(userId: string, type: string, amount: number): boolean {
    // Fraud detection for KES amounts
    if (amount > 50000) return true; // Large withdrawal (KES 50,000+)
    
    const recentTransactions = this.transactions.filter(
      t => t.userId === userId && 
      new Date(t.timestamp).getTime() > Date.now() - 3600000 // Last hour
    );
    
    if (recentTransactions.length > 5) return true; // Too many transactions

    return false;
  }

  private createFraudAlert(userId: string, type: FraudAlert['type'], description: string): void {
    const alert: FraudAlert = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      type,
      description,
      timestamp: new Date().toISOString(),
      severity: 'HIGH',
      resolved: false
    };
    this.fraudAlerts.push(alert);
  }
}

export const atmService = new ATMService();
