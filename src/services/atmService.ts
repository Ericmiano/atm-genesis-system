import { User, Transaction, Loan, LoanPayment, AuditLog, Bill, ATMSession, FraudAlert, AdminAction, PasswordRequirements, SecuritySettings } from '../types/atm';

// Mock data - replace with actual database or API calls
let users: User[] = [
  {
    id: '1',
    accountNumber: '1234567890',
    username: 'user1',
    password: 'password1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    pin: '1234',
    balance: 1000,
    role: 'USER',
    isLocked: false,
    failedAttempts: 0,
    failedPasswordAttempts: 0,
    cardNumber: '4111111111111111',
    expiryDate: '12/24',
    cvv: '123',
    cardType: 'VISA',
    mustChangePassword: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    accountNumber: '9876543210',
    username: 'admin1',
    password: 'admin1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    pin: '5678',
    balance: 5000,
    role: 'ADMIN',
    isLocked: false,
    failedAttempts: 0,
    failedPasswordAttempts: 0,
    cardNumber: '5222222222222222',
    expiryDate: '01/25',
    cvv: '456',
    cardType: 'MASTERCARD',
    mustChangePassword: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    accountNumber: '5555555555',
    username: 'lockeduser',
    password: 'lockedpassword',
    name: 'Locked User',
    email: 'locked.user@example.com',
    pin: '9999',
    balance: 200,
    role: 'USER',
    isLocked: true,
    lockReason: 'Too many failed login attempts',
    lockDate: new Date().toISOString(),
    failedAttempts: 5,
    failedPasswordAttempts: 3,
    cardNumber: '4333333333333333',
    expiryDate: '03/26',
    cvv: '789',
    cardType: 'VISA',
    mustChangePassword: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    accountNumber: '1122334455',
    username: 'mustchangepassword',
    password: 'oldpassword',
    name: 'Change Password User',
    email: 'change.password@example.com',
    pin: '1111',
    balance: 1500,
    role: 'USER',
    isLocked: false,
    failedAttempts: 0,
    failedPasswordAttempts: 0,
    cardNumber: '5444444444444444',
    expiryDate: '05/27',
    cvv: '012',
    cardType: 'MASTERCARD',
    mustChangePassword: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    accountNumber: '6677889900',
    username: 'regularuser',
    password: 'regularpassword',
    name: 'Regular User',
    email: 'regular.user@example.com',
    pin: '2222',
    balance: 2500,
    role: 'USER',
    isLocked: false,
    failedAttempts: 0,
    failedPasswordAttempts: 0,
    cardNumber: '4555555555555555',
    expiryDate: '07/28',
    cvv: '345',
    cardType: 'VISA',
    mustChangePassword: false,
    createdAt: new Date().toISOString()
  },
];

let transactions: Transaction[] = [];
let loans: Loan[] = [];
let auditLogs: AuditLog[] = [];
let fraudAlerts: FraudAlert[] = [];

// Mock bills
let bills: Bill[] = [
  {
    id: 'bill1',
    type: 'UTILITY',
    name: 'Kenya Power Bill',
    amount: 2500,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString()
  },
  {
    id: 'bill2',
    type: 'SUBSCRIPTION',
    name: 'DSTV Subscription',
    amount: 1200,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString()
  },
  {
    id: 'bill3',
    type: 'UTILITY',
    name: 'Nairobi Water Bill',
    amount: 800,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() // Overdue
  },
  {
    id: 'bill4',
    type: 'SUBSCRIPTION',
    name: 'Safaricom PostPay',
    amount: 3000,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString()
  },
];

// Mock security settings
const securitySettings: SecuritySettings = {
  maxFailedAttempts: 3,
  lockoutDuration: 15, // minutes
  passwordExpiryDays: 90,
  sessionTimeout: 30, // minutes
};

// Mock password requirements
const passwordRequirements: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

class ATMService {
  currentUser: User | null = null;
  currentSession: ATMSession | null = null;

  constructor() {
    // Load data from localStorage if available
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      users = JSON.parse(storedUsers);
    }

    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      transactions = JSON.parse(storedTransactions);
    }

    const storedLoans = localStorage.getItem('loans');
    if (storedLoans) {
      loans = JSON.parse(storedLoans);
    }

    const storedAuditLogs = localStorage.getItem('auditLogs');
    if (storedAuditLogs) {
      auditLogs = JSON.parse(storedAuditLogs);
    }

    const storedFraudAlerts = localStorage.getItem('fraudAlerts');
    if (storedFraudAlerts) {
      fraudAlerts = JSON.parse(storedFraudAlerts);
    }
  }

  // Authentication methods
  authenticate = async (username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const user = users.find(u => u.username === username);

    if (!user) {
      this.addAuditLog('LOGIN_FAILED', `Login failed for username: ${username} - User not found`);
      return { success: false, message: 'Invalid credentials' };
    }

    const { isLocked, reason } = this.checkAccountLock(user);
    if (isLocked) {
      this.addAuditLog('LOGIN_FAILED', `Login failed for username: ${username} - Account locked: ${reason}`);
      return { success: false, message: `Account locked: ${reason}` };
    }

    if (user.password !== password) {
      this.updateFailedPasswordAttempts(user.id);
      const { isLocked, reason } = this.checkAccountLock(user);
      if (isLocked) {
        this.addAuditLog('LOGIN_FAILED', `Login failed for username: ${username} - Account locked: ${reason}`);
        return { success: false, message: `Account locked: ${reason}` };
      }
      this.addAuditLog('LOGIN_FAILED', `Login failed for username: ${username} - Incorrect password`);
      return { success: false, message: 'Invalid credentials' };
    }

    // Check if password needs to be changed
    if (user.mustChangePassword) {
      this.currentUser = user;
      this.addAuditLog('LOGIN_SUCCESS', `Login successful for username: ${username} - Must change password`);
      return { success: true, message: 'Must change password', user: user };
    }

    // Successful login
    user.failedPasswordAttempts = 0;
    user.lastPasswordAttempt = undefined;
    user.lastLogin = new Date().toISOString();
    this.currentUser = user;
    this.saveUsers();

    // Start ATM session
    this.startSession(user.id);

    this.addAuditLog('LOGIN_SUCCESS', `Login successful for username: ${username}`);
    return { success: true, message: 'Login successful', user: user };
  };

  verifyPin = async (pin: string): Promise<{ success: boolean; message: string }> => {
    if (!this.currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    if (this.currentUser.pin !== pin) {
      this.updateFailedPinAttempts(this.currentUser.id);
      return { success: false, message: 'Incorrect PIN' };
    }

    return { success: true, message: 'PIN verified successfully' };
  };

  logout = (): void => {
    if (this.currentSession) {
      this.endSession(this.currentSession.sessionId);
    }
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.addAuditLog('LOGOUT', 'User logged out');
  };

  // Transaction methods
  withdraw = async (amount: number): Promise<{ success: boolean; message: string; balance?: number }> => {
    if (!this.currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    if (amount <= 0) {
      return { success: false, message: 'Invalid withdrawal amount' };
    }

    if (amount > this.currentUser.balance) {
      return { success: false, message: 'Insufficient balance' };
    }

    this.currentUser.balance -= amount;
    this.saveUsers();

    this.addTransaction({
      type: 'WITHDRAWAL',
      amount: amount,
      description: `Withdrawal of KES ${amount.toLocaleString()}`
    });

    this.addAuditLog('WITHDRAWAL', `User withdrew KES ${amount.toLocaleString()}`);
    return { success: true, message: 'Withdrawal successful', balance: this.currentUser.balance };
  };

  deposit = async (amount: number): Promise<{ success: boolean; message: string; balance?: number }> => {
    if (!this.currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    if (amount <= 0) {
      return { success: false, message: 'Invalid deposit amount' };
    }

    this.currentUser.balance += amount;
    this.saveUsers();

    this.addTransaction({
      type: 'DEPOSIT',
      amount: amount,
      description: `Deposit of KES ${amount.toLocaleString()}`
    });

    this.addAuditLog('DEPOSIT', `User deposited KES ${amount.toLocaleString()}`);
    return { success: true, message: 'Deposit successful', balance: this.currentUser.balance };
  };

  getBalance = async (): Promise<{ success: boolean; message: string; balance?: number }> => {
    if (!this.currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    this.addTransaction({
      type: 'BALANCE_INQUIRY',
      amount: 0,
      description: 'Balance inquiry'
    });

    this.addAuditLog('BALANCE_INQUIRY', 'User checked their balance');
    return { success: true, message: 'Balance retrieved successfully', balance: this.currentUser.balance };
  };

  transfer = async (recipientAccount: string, amount: number): Promise<{ success: boolean; message: string; balance?: number }> => {
    if (!this.currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    if (amount <= 0) {
      return { success: false, message: 'Invalid transfer amount' };
    }

    if (amount > this.currentUser.balance) {
      return { success: false, message: 'Insufficient balance' };
    }

    const recipient = users.find(u => u.accountNumber === recipientAccount);
    if (!recipient) {
      return { success: false, message: 'Recipient account not found' };
    }

    this.currentUser.balance -= amount;
    recipient.balance += amount;
    this.saveUsers();

    this.addTransaction({
      type: 'TRANSFER',
      amount: amount,
      description: `Transfer of KES ${amount.toLocaleString()} to account ${recipientAccount}`,
      toAccount: recipientAccount,
      fromAccount: this.currentUser.accountNumber
    });

    this.addAuditLog('TRANSFER', `User transferred KES ${amount.toLocaleString()} to account ${recipientAccount}`);
    return { success: true, message: 'Transfer successful', balance: this.currentUser.balance };
  };

  // PIN management
  changePin = async (currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> => {
    if (!this.currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    if (this.currentUser.pin !== currentPin) {
      this.updateFailedPinAttempts(this.currentUser.id);
      return { success: false, message: 'Current PIN is incorrect' };
    }

    // Update PIN
    this.currentUser.pin = newPin;
    this.saveUsers();

    this.addTransaction({
      type: 'PIN_CHANGE',
      amount: 0,
      description: 'PIN changed successfully'
    });

    this.addAuditLog('PIN_CHANGE', 'User changed their PIN');

    return { success: true, message: 'PIN changed successfully' };
  };

  // Password management - Remove duplicate and fix
  changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!this.currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    if (this.currentUser.password !== currentPassword) {
      this.updateFailedPasswordAttempts(this.currentUser.id);
      return { success: false, message: 'Current password is incorrect' };
    }

    // Validate new password
    const validation = this.validatePassword(newPassword);
    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    // Update password
    this.currentUser.password = newPassword;
    this.currentUser.passwordLastChanged = new Date().toISOString();
    this.currentUser.mustChangePassword = false;
    this.saveUsers();

    this.addAuditLog('PASSWORD_CHANGE', 'User changed their password');

    return { success: true, message: 'Password changed successfully' };
  };

  // Bill payment
  payBill = async (billId: string, amount: number): Promise<{ success: boolean; message: string; balance?: number }> => {
    if (!this.currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    const bill = bills.find(b => b.id === billId);
    if (!bill) {
      return { success: false, message: 'Bill not found' };
    }

    if (amount <= 0) {
      return { success: false, message: 'Invalid payment amount' };
    }

    if (amount > this.currentUser.balance) {
      return { success: false, message: 'Insufficient balance' };
    }

    this.currentUser.balance -= amount;
    this.saveUsers();

    this.addTransaction({
      type: 'BILL_PAYMENT',
      amount: amount,
      description: `Payment of KES ${amount.toLocaleString()} for ${bill.name}`
    });

    this.addAuditLog('BILL_PAYMENT', `User paid KES ${amount.toLocaleString()} for bill ${bill.name}`);
    return { success: true, message: 'Bill payment successful', balance: this.currentUser.balance };
  };

  getAvailableBills = (): Bill[] => {
    return bills;
  };

  // Transaction history
  getTransactionHistory = (): Transaction[] => {
    if (!this.currentUser) {
      return [];
    }
    return transactions.filter(t => t.userId === this.currentUser!.id);
  };

  // Loan methods
  applyForLoan = async (
    type: Loan['type'],
    amount: number,
    termMonths: number,
    purpose: string,
    collateral?: string
  ): Promise<{ success: boolean; message: string; loan?: Loan }> => {
    if (!this.currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    if (amount <= 0) {
      return { success: false, message: 'Invalid loan amount' };
    }

    const interestRate = this.calculateInterestRate(type, this.currentUser.creditScore);
    const monthlyPayment = this.calculateMonthlyPayment(amount, interestRate, termMonths);
    const totalAmount = monthlyPayment * termMonths;

    const newLoan: Loan = {
      id: Math.random().toString(36).substring(2, 15),
      userId: this.currentUser.id,
      type: type,
      principal: amount,
      interestRate: interestRate,
      termMonths: termMonths,
      monthlyPayment: monthlyPayment,
      totalAmount: totalAmount,
      remainingBalance: totalAmount,
      status: 'PENDING',
      applicationDate: new Date().toISOString(),
      purpose: purpose,
      collateral: collateral
    };

    loans.push(newLoan);
    this.saveLoans();

    this.addAuditLog('LOAN_APPLICATION', `User applied for a ${type} loan of KES ${amount.toLocaleString()}`);
    return { success: true, message: 'Loan application submitted successfully', loan: newLoan };
  };

  getUserLoans = (): Loan[] => {
    if (!this.currentUser) {
      return [];
    }
    return loans.filter(loan => loan.userId === this.currentUser!.id);
  };

  makePayment = async (loanId: string, amount: number): Promise<{ success: boolean; message: string; balance?: number }> => {
    if (!this.currentUser) {
      return { success: false, message: 'No user logged in' };
    }

    const loan = loans.find(l => l.id === loanId && l.userId === this.currentUser!.id);
    if (!loan) {
      return { success: false, message: 'Loan not found' };
    }

    if (amount <= 0) {
      return { success: false, message: 'Invalid payment amount' };
    }

    if (amount > this.currentUser.balance) {
      return { success: false, message: 'Insufficient balance' };
    }

    if (amount > loan.remainingBalance) {
      return { success: false, message: 'Payment amount exceeds remaining balance' };
    }

    this.currentUser.balance -= amount;
    loan.remainingBalance -= amount;

    // For simplicity, assume the entire amount goes to principal
    // In a real-world scenario, you'd calculate principal and interest portions
    const payment: LoanPayment = {
      id: Math.random().toString(36).substring(2, 15),
      loanId: loan.id,
      amount: amount,
      paymentDate: new Date().toISOString(),
      principalPortion: amount,
      interestPortion: 0,
      remainingBalance: loan.remainingBalance,
      status: 'SUCCESS'
    };

    if (loan.remainingBalance === 0) {
      loan.status = 'COMPLETED';
    }

    this.saveUsers();
    this.saveLoans();

    this.addTransaction({
      type: 'LOAN_PAYMENT',
      amount: amount,
      description: `Loan payment of KES ${amount.toLocaleString()} for loan ID ${loanId}`,
      loanId: loanId
    });

    this.addAuditLog('LOAN_PAYMENT', `User made a loan payment of KES ${amount.toLocaleString()} for loan ID ${loanId}`);
    return { success: true, message: 'Loan payment successful', balance: this.currentUser.balance };
  };

  // Admin methods
  getAllUsers = (): User[] => {
    return users;
  };

  getAllTransactions = (): Transaction[] => {
    return transactions;
  };

  getAuditLogs = (): AuditLog[] => {
    return auditLogs;
  };

  getFraudAlerts = (): FraudAlert[] => {
    return fraudAlerts;
  };

  unlockAccount = (userId: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    user.isLocked = false;
    user.lockReason = undefined;
    user.lockDate = undefined;
    user.failedAttempts = 0;
    this.saveUsers();

    this.addAdminAction('UNLOCK_ACCOUNT', userId, 'Account unlocked by admin');
    return true;
  };

  resetUserPassword = (userId: string, newPassword: string): boolean => {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) return false;

    user.password = newPassword;
    user.passwordLastChanged = new Date().toISOString();
    user.mustChangePassword = true;
    user.failedPasswordAttempts = 0;
    user.lastPasswordAttempt = undefined;

    this.saveUsers();

    this.addAdminAction('RESET_PIN', userId, 'Password reset by admin', 'Admin reset user password');

    return true;
  };

  // Helper methods
  private validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < passwordRequirements.minLength) {
      return { isValid: false, message: `Password must be at least ${passwordRequirements.minLength} characters long` };
    }
    if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (passwordRequirements.requireNumbers && !/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (passwordRequirements.requireSpecialChars && !/[^a-zA-Z0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }
    return { isValid: true, message: '' };
  };

  private updateFailedAttempts = (userId: string): void => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    user.failedAttempts++;
    if (user.failedAttempts >= securitySettings.maxFailedAttempts) {
      user.isLocked = true;
      user.lockReason = 'Too many failed login attempts';
      user.lockDate = new Date().toISOString();
      this.addFraudAlert('MULTIPLE_ATTEMPTS', `Account locked due to multiple failed login attempts for user ${user.username}`, 'MEDIUM');
    }
    this.saveUsers();
  };

  private updateFailedPasswordAttempts = (userId: string): void => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    user.failedPasswordAttempts++;
    user.lastPasswordAttempt = new Date().toISOString();

    if (user.failedPasswordAttempts >= securitySettings.maxFailedAttempts) {
      user.isLocked = true;
      user.lockReason = 'Too many failed password attempts';
      user.lockDate = new Date().toISOString();
      this.addFraudAlert('MULTIPLE_ATTEMPTS', `Account locked due to multiple failed password attempts for user ${user.username}`, 'HIGH');
    }
    this.saveUsers();
  };

  private updateFailedPinAttempts = (userId: string): void => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    user.failedAttempts++; // General failed attempts counter
    if (user.failedAttempts >= securitySettings.maxFailedAttempts) {
      user.isLocked = true;
      user.lockReason = 'Too many failed PIN attempts';
      user.lockDate = new Date().toISOString();
      this.addFraudAlert('MULTIPLE_ATTEMPTS', `Account locked due to multiple failed PIN attempts for user ${user.username}`, 'HIGH');
    }
    this.saveUsers();
  };

  private checkAccountLock = (user: User): { isLocked: boolean; reason?: string } => {
    if (!user.isLocked) {
      return { isLocked: false };
    }

    if (!user.lockDate) {
      return { isLocked: true, reason: user.lockReason || 'Account is locked' };
    }

    const lockDate = new Date(user.lockDate);
    const now = new Date();
    const diff = now.getTime() - lockDate.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes >= securitySettings.lockoutDuration) {
      user.isLocked = false;
      user.lockReason = undefined;
      user.lockDate = undefined;
      user.failedAttempts = 0;
      this.saveUsers();
      return { isLocked: false };
    }

    return { isLocked: true, reason: user.lockReason || 'Account is locked' };
  };

  private addTransaction = (transaction: Omit<Transaction, 'id' | 'userId' | 'timestamp' | 'status'>): void => {
    if (!this.currentUser) return;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 15),
      userId: this.currentUser.id,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      ...transaction
    };
    transactions.push(newTransaction);
    this.saveTransactions();
  };

  private addAuditLog = (action: string, details: string): void => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(2, 15),
      userId: this.currentUser?.id,
      action: action,
      details: details,
      timestamp: new Date().toISOString()
    };
    auditLogs.push(newLog);
    localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
  };

  private addAdminAction = (
    action: AdminAction['action'],
    targetUserId: string | undefined,
    details: string,
    reason?: string
  ): void => {
    const newAction: AdminAction = {
      id: Math.random().toString(36).substring(2, 15),
      adminId: this.currentUser?.id || 'SYSTEM',
      action: action,
      targetUserId: targetUserId,
      details: details,
      timestamp: new Date().toISOString(),
      reason: reason
    };
    auditLogs.push(newAction);
    localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
  };

  private addFraudAlert = (type: FraudAlert['type'], description: string, severity: FraudAlert['severity']): void => {
    const newAlert: FraudAlert = {
      id: Math.random().toString(36).substring(2, 15),
      userId: this.currentUser?.id || 'SYSTEM',
      type: type,
      description: description,
      timestamp: new Date().toISOString(),
      severity: severity,
      resolved: false
    };
    fraudAlerts.push(newAlert);
    localStorage.setItem('fraudAlerts', JSON.stringify(fraudAlerts));
  };

  private getUsers = (): User[] => {
    return users;
  };

  private saveUsers = (): void => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  private getTransactions = (): Transaction[] => {
    return transactions;
  };

  private saveTransactions = (): void => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  };

  private getLoans = (): Loan[] => {
    return loans;
  };

  private saveLoans = (): void => {
    localStorage.setItem('loans', JSON.stringify(loans));
  };

  private calculateMonthlyPayment = (principal: number, rate: number, termMonths: number): number => {
    const monthlyRate = rate / 100 / 12;
    const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
    return payment;
  };

  private calculateInterestRate = (type: Loan['type'], creditScore?: number): number => {
    // Base rates
    let baseRate = 0.10; // 10%

    // Adjustments based on loan type
    switch (type) {
      case 'BUSINESS':
        baseRate += 0.02; // Add 2% for business loans
        break;
      case 'EMERGENCY':
        baseRate += 0.05; // Add 5% for emergency loans
        break;
      case 'EDUCATION':
        baseRate += 0.01; // Add 1% for education loans
        break;
      default:
        break;
    }

    // Adjustments based on credit score
    if (creditScore) {
      if (creditScore > 750) {
        baseRate -= 0.02; // Reduce by 2% for excellent credit
      } else if (creditScore > 650) {
        baseRate -= 0.01; // Reduce by 1% for good credit
      } else if (creditScore < 550) {
        baseRate += 0.05; // Add 5% for poor credit
      }
    }

    // Cap the rate between 5% and 20%
    baseRate = Math.max(0.05, Math.min(0.20, baseRate));

    return baseRate * 100; // Return as percentage
  };

  private startSession = (userId: string): void => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    this.currentSession = {
      sessionId: sessionId,
      userId: userId,
      startTime: new Date().toISOString(),
      isActive: true,
    };
    localStorage.setItem('currentSession', JSON.stringify(this.currentSession));
  };

  private endSession = (sessionId: string): void => {
    if (this.currentSession && this.currentSession.sessionId === sessionId) {
      this.currentSession.endTime = new Date().toISOString();
      this.currentSession.isActive = false;
      localStorage.setItem('currentSession', JSON.stringify(this.currentSession));
      this.currentSession = null;
    }
  };
}

export const atmService = new ATMService();
