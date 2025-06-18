import { User, Transaction, AuditLog, ATMSession, FraudAlert, Bill, Loan, LoanPayment, AdminAction, PasswordRequirements, SecuritySettings } from '../types/atm';

class ATMService {
  private users: User[] = [];
  private transactions: Transaction[] = [];
  private auditLogs: AuditLog[] = [];
  private sessions: ATMSession[] = [];
  private fraudAlerts: FraudAlert[] = [];
  private loans: Loan[] = [];
  private loanPayments: LoanPayment[] = [];
  private adminActions: AdminAction[] = [];
  private currentSession: ATMSession | null = null;
  private passwordRequirements: PasswordRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  };
  private securitySettings: SecuritySettings = {
    maxFailedAttempts: 3,
    lockoutDuration: 30,
    passwordExpiryDays: 90,
    sessionTimeout: 15,
  };

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample users with KES amounts, usernames, passwords, and card details
    this.users = [
      {
        id: '1',
        accountNumber: '1234567890',
        username: 'john.kimani',
        password: 'SecurePass123!',
        name: 'John Kimani',
        email: 'john@example.com',
        pin: '1234',
        balance: 125000,
        role: 'USER',
        isLocked: false,
        failedAttempts: 0,
        failedPasswordAttempts: 0,
        createdAt: new Date().toISOString(),
        creditScore: 750,
        monthlyIncome: 85000,
        cardNumber: '4532 1234 5678 9012',
        expiryDate: '12/27',
        cvv: '123',
        cardType: 'VISA',
        mustChangePassword: false,
      },
      {
        id: '2',
        accountNumber: '0987654321',
        username: 'grace.wanjiku',
        password: 'MyPassword456@',
        name: 'Grace Wanjiku',
        email: 'grace@example.com',
        pin: '5678',
        balance: 87500,
        role: 'USER',
        isLocked: false,
        failedAttempts: 0,
        failedPasswordAttempts: 0,
        createdAt: new Date().toISOString(),
        creditScore: 680,
        monthlyIncome: 65000,
        cardNumber: '5555 4444 3333 2222',
        expiryDate: '09/26',
        cvv: '456',
        cardType: 'MASTERCARD',
        mustChangePassword: false,
      },
      {
        id: 'admin',
        accountNumber: 'ADMIN001',
        username: 'admin',
        password: 'AdminPass999!',
        name: 'ATM Administrator',
        email: 'admin@atm.com',
        pin: '0000',
        balance: 0,
        role: 'ADMIN',
        isLocked: false,
        failedAttempts: 0,
        failedPasswordAttempts: 0,
        createdAt: new Date().toISOString(),
        cardNumber: '0000 0000 0000 0000',
        expiryDate: '12/99',
        cvv: '000',
        cardType: 'VISA',
        mustChangePassword: false,
      }
    ];

    // Sample loans
    this.loans = [
      {
        id: 'loan_1',
        userId: '1',
        type: 'PERSONAL',
        principal: 50000,
        interestRate: 12.5,
        termMonths: 12,
        monthlyPayment: 4500,
        totalAmount: 54000,
        remainingBalance: 45000,
        status: 'ACTIVE',
        applicationDate: new Date(Date.now() - 2592000000).toISOString(),
        approvalDate: new Date(Date.now() - 2419200000).toISOString(),
        disbursementDate: new Date(Date.now() - 2419200000).toISOString(),
        nextPaymentDate: new Date(Date.now() + 604800000).toISOString(),
        purpose: 'Business expansion',
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
        type: 'LOAN_DISBURSEMENT',
        amount: 50000,
        description: 'Personal loan disbursement',
        timestamp: new Date(Date.now() - 2419200000).toISOString(),
        status: 'SUCCESS',
        loanId: 'loan_1'
      }
    ];
  }

  // Enhanced Authentication with username/password
  async authenticate(username: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
    const user = this.users.find(u => u.username === username);
    
    if (!user) {
      this.logAudit('LOGIN_FAILED', `Failed login attempt for username: ${username}`);
      return { success: false, message: 'Invalid username or password' };
    }

    if (user.isLocked) {
      this.logAudit('LOGIN_BLOCKED', `Login attempt for locked account: ${username}`, user.id);
      return { 
        success: false, 
        message: `Account is locked${user.lockReason ? ': ' + user.lockReason : ''}. Please contact customer service.` 
      };
    }

    // Check for lockout due to failed password attempts
    if (this.isAccountTemporarilyLocked(user)) {
      return { 
        success: false, 
        message: `Account temporarily locked due to multiple failed attempts. Try again later.` 
      };
    }

    if (user.password !== password) {
      user.failedPasswordAttempts++;
      user.lastPasswordAttempt = new Date().toISOString();
      
      if (user.failedPasswordAttempts >= this.securitySettings.maxFailedAttempts) {
        user.isLocked = true;
        user.lockReason = 'Multiple failed password attempts';
        user.lockDate = new Date().toISOString();
        this.logAudit('ACCOUNT_LOCKED', `Account locked due to multiple failed password attempts`, user.id);
        return { success: false, message: 'Account locked due to multiple failed password attempts' };
      }
      
      this.logAudit('LOGIN_FAILED', `Invalid password for username: ${username}`, user.id);
      return { 
        success: false, 
        message: `Invalid username or password. ${this.securitySettings.maxFailedAttempts - user.failedPasswordAttempts} attempts remaining.` 
      };
    }

    // Reset failed attempts on successful login
    user.failedPasswordAttempts = 0;
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

  // PIN verification for transactions
  async verifyPin(pin: string): Promise<{ success: boolean; message: string }> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return { success: false, message: 'No active session' };
    }

    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'User not found' };

    if (user.pin !== pin) {
      user.failedAttempts++;
      if (user.failedAttempts >= 3) {
        user.isLocked = true;
        user.lockReason = 'Multiple failed PIN attempts';
        user.lockDate = new Date().toISOString();
        this.logAudit('ACCOUNT_LOCKED', `Account locked due to multiple failed PIN attempts`, user.id);
        return { success: false, message: 'Account locked due to multiple failed PIN attempts' };
      }
      this.logAudit('PIN_VERIFICATION_FAILED', `Invalid PIN attempt`, user.id);
      return { success: false, message: `Invalid PIN. ${3 - user.failedAttempts} attempts remaining.` };
    }

    user.failedAttempts = 0;
    return { success: true, message: 'PIN verified successfully' };
  }

  // Password validation
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const req = this.passwordRequirements;

    if (password.length < req.minLength) {
      errors.push(`Password must be at least ${req.minLength} characters long`);
    }

    if (req.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (req.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (req.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (req.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return { success: false, message: 'No active session' };
    }

    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'User not found' };

    if (user.password !== currentPassword) {
      return { success: false, message: 'Current password is incorrect' };
    }

    const validation = this.validatePassword(newPassword);
    if (!validation.valid) {
      return { success: false, message: validation.errors.join('. ') };
    }

    user.password = newPassword;
    user.passwordLastChanged = new Date().toISOString();
    user.mustChangePassword = false;
    
    this.logAudit('PASSWORD_CHANGED', 'Password changed successfully', user.id);
    return { success: true, message: 'Password changed successfully' };
  }

  // Check if account is temporarily locked
  private isAccountTemporarilyLocked(user: User): boolean {
    if (!user.lastPasswordAttempt || user.failedPasswordAttempts < this.securitySettings.maxFailedAttempts) {
      return false;
    }

    const lockoutTime = new Date(user.lastPasswordAttempt).getTime() + (this.securitySettings.lockoutDuration * 60 * 1000);
    return Date.now() < lockoutTime;
  }

  // Enhanced Admin Functions
  lockAccount(userId: string, reason: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user && user.role !== 'ADMIN') {
      user.isLocked = true;
      user.lockReason = reason;
      user.lockDate = new Date().toISOString();
      this.logAdminAction('SUSPEND_USER', userId, undefined, `Account locked: ${reason}`, reason);
      this.logAudit('ACCOUNT_LOCKED', `Account locked by admin: ${reason}`, userId);
      return true;
    }
    return false;
  }

  unlockAccount(userId: string, reason?: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isLocked = false;
      user.failedAttempts = 0;
      user.failedPasswordAttempts = 0;
      user.lockReason = undefined;
      user.lockDate = undefined;
      this.logAdminAction('UNLOCK_ACCOUNT', userId, undefined, `Account unlocked`, reason);
      this.logAudit('ACCOUNT_UNLOCKED', `Account unlocked by admin`, userId);
      return true;
    }
    return false;
  }

  resetUserPassword(userId: string, newPassword: string, reason?: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const validation = this.validatePassword(newPassword);
      if (!validation.valid) return false;

      user.password = newPassword;
      user.passwordLastChanged = new Date().toISOString();
      user.mustChangePassword = true;
      user.failedPasswordAttempts = 0;
      this.logAdminAction('RESET_PASSWORD', userId, undefined, `Password reset`, reason);
      this.logAudit('PASSWORD_RESET', `Password reset by admin`, userId);
      return true;
    }
    return false;
  }

  // Get password requirements
  getPasswordRequirements(): PasswordRequirements {
    return this.passwordRequirements;
  }

  // Get security settings
  getSecuritySettings(): SecuritySettings {
    return this.securitySettings;
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

  // Loan Application
  async applyForLoan(
    type: Loan['type'],
    amount: number,
    termMonths: number,
    purpose: string,
    collateral?: string
  ): Promise<{ success: boolean; message: string; loanId?: string }> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return { success: false, message: 'No active session' };
    }

    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'User not found' };

    if (amount <= 0 || amount > 500000) {
      return { success: false, message: 'Invalid loan amount. Maximum loan is KES 500,000' };
    }

    if (termMonths < 1 || termMonths > 60) {
      return { success: false, message: 'Loan term must be between 1 and 60 months' };
    }

    if (!user.creditScore || user.creditScore < 600) {
      return { success: false, message: 'Credit score too low for loan approval' };
    }

    if (!user.monthlyIncome || (amount / termMonths) > (user.monthlyIncome * 0.4)) {
      return { success: false, message: 'Loan amount exceeds affordable payment capacity' };
    }

    if (amount > 200000) {
      this.createFraudAlert(user.id, 'LARGE_LOAN_REQUEST', `Large loan application: KES ${amount.toLocaleString()}`);
    }

    const interestRate = this.calculateInterestRate(user.creditScore, type);
    const monthlyPayment = this.calculateMonthlyPayment(amount, interestRate, termMonths);
    const totalAmount = monthlyPayment * termMonths;

    const loan: Loan = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type,
      principal: amount,
      interestRate,
      termMonths,
      monthlyPayment,
      totalAmount,
      remainingBalance: totalAmount,
      status: 'PENDING',
      applicationDate: new Date().toISOString(),
      purpose,
      collateral
    };

    this.loans.push(loan);
    this.logAudit('LOAN_APPLICATION', `Applied for ${type} loan of KES ${amount.toLocaleString()}`, user.id);

    return {
      success: true,
      message: `Loan application submitted successfully. Application ID: ${loan.id}`,
      loanId: loan.id
    };
  }

  // Loan Payment
  async makePayment(loanId: string, amount: number): Promise<{ success: boolean; message: string; remainingBalance?: number }> {
    if (!this.currentSession || !this.currentSession.isActive) {
      return { success: false, message: 'No active session' };
    }

    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'User not found' };

    const loan = this.loans.find(l => l.id === loanId && l.userId === user.id);
    if (!loan) return { success: false, message: 'Loan not found' };

    if (loan.status !== 'ACTIVE') {
      return { success: false, message: 'Loan is not active' };
    }

    if (amount <= 0) return { success: false, message: 'Invalid payment amount' };
    if (amount > user.balance) return { success: false, message: 'Insufficient funds' };

    const monthlyInterest = (loan.remainingBalance * loan.interestRate / 100) / 12;
    const principalPortion = Math.min(amount - monthlyInterest, loan.remainingBalance - monthlyInterest);
    const interestPortion = amount - principalPortion;

    loan.remainingBalance -= principalPortion;
    user.balance -= amount;

    if (loan.remainingBalance <= 0) {
      loan.status = 'COMPLETED';
      loan.remainingBalance = 0;
    }

    const payment: LoanPayment = {
      id: Math.random().toString(36).substr(2, 9),
      loanId,
      amount,
      paymentDate: new Date().toISOString(),
      principalPortion,
      interestPortion,
      remainingBalance: loan.remainingBalance,
      status: 'SUCCESS'
    };

    this.loanPayments.push(payment);
    this.logTransaction(user.id, 'LOAN_PAYMENT', amount, `Loan payment for ${loanId}`, 'SUCCESS', undefined, undefined, loanId);
    this.logAudit('LOAN_PAYMENT', `Made payment of KES ${amount.toLocaleString()} for loan ${loanId}`, user.id);

    return {
      success: true,
      message: `Payment of KES ${amount.toLocaleString()} processed successfully`,
      remainingBalance: loan.remainingBalance
    };
  }

  // Get user loans
  getUserLoans(): Loan[] {
    if (!this.currentSession || !this.currentSession.isActive) {
      return [];
    }

    return this.loans.filter(l => l.userId === this.currentSession!.userId);
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

  getAllLoans(): Loan[] {
    return this.loans;
  }

  getAllLoanPayments(): LoanPayment[] {
    return this.loanPayments;
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getFraudAlerts(): FraudAlert[] {
    return this.fraudAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getAdminActions(): AdminAction[] {
    return this.adminActions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Enhanced Admin Actions
  unlockAccount(userId: string, reason?: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isLocked = false;
      user.failedAttempts = 0;
      this.logAdminAction('UNLOCK_ACCOUNT', userId, undefined, `Account unlocked`, reason);
      this.logAudit('ACCOUNT_UNLOCKED', `Account unlocked by admin`, userId);
      return true;
    }
    return false;
  }

  suspendUser(userId: string, reason: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user && user.role !== 'ADMIN') {
      user.isLocked = true;
      this.logAdminAction('SUSPEND_USER', userId, undefined, `User suspended`, reason);
      this.logAudit('USER_SUSPENDED', `User suspended by admin: ${reason}`, userId);
      return true;
    }
    return false;
  }

  resetUserPin(userId: string, newPin: string, reason?: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user && /^\d{4}$/.test(newPin)) {
      user.pin = newPin;
      user.failedAttempts = 0;
      this.logAdminAction('RESET_PIN', userId, undefined, `PIN reset`, reason);
      this.logAudit('PIN_RESET', `PIN reset by admin`, userId);
      return true;
    }
    return false;
  }

  adjustUserBalance(userId: string, amount: number, reason: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const oldBalance = user.balance;
      user.balance += amount;
      this.logAdminAction('ADJUST_BALANCE', userId, undefined, 
        `Balance adjusted from KES ${oldBalance.toLocaleString()} to KES ${user.balance.toLocaleString()}`, reason);
      this.logAudit('BALANCE_ADJUSTED', 
        `Balance adjusted by KES ${amount.toLocaleString()} - Reason: ${reason}`, userId);
      return true;
    }
    return false;
  }

  approveLoan(loanId: string, reason?: string): boolean {
    const loan = this.loans.find(l => l.id === loanId);
    if (loan && loan.status === 'PENDING') {
      loan.status = 'APPROVED';
      loan.approvalDate = new Date().toISOString();
      
      const user = this.users.find(u => u.id === loan.userId);
      if (user) {
        user.balance += loan.principal;
        loan.status = 'ACTIVE';
        loan.disbursementDate = new Date().toISOString();
        
        const nextPayment = new Date();
        nextPayment.setMonth(nextPayment.getMonth() + 1);
        loan.nextPaymentDate = nextPayment.toISOString();

        this.logTransaction(loan.userId, 'LOAN_DISBURSEMENT', loan.principal, 
          `${loan.type} loan disbursement`, 'SUCCESS', undefined, undefined, loanId);
      }

      this.logAdminAction('APPROVE_LOAN', loan.userId, loanId, 
        `Loan approved and disbursed: KES ${loan.principal.toLocaleString()}`, reason);
      this.logAudit('LOAN_APPROVED', `Loan ${loanId} approved and disbursed`, loan.userId);
      return true;
    }
    return false;
  }

  rejectLoan(loanId: string, reason: string): boolean {
    const loan = this.loans.find(l => l.id === loanId);
    if (loan && loan.status === 'PENDING') {
      loan.status = 'REJECTED';
      this.logAdminAction('REJECT_LOAN', loan.userId, loanId, `Loan rejected`, reason);
      this.logAudit('LOAN_REJECTED', `Loan ${loanId} rejected - Reason: ${reason}`, loan.userId);
      return true;
    }
    return false;
  }

  resolveFraudAlert(alertId: string, resolution: string): boolean {
    const alert = this.fraudAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.logAdminAction('RESOLVE_FRAUD_ALERT', alert.userId, undefined, 
        `Fraud alert resolved: ${resolution}`, resolution);
      this.logAudit('FRAUD_ALERT_RESOLVED', `Fraud alert ${alertId} resolved`, alert.userId);
      return true;
    }
    return false;
  }

  // Private helper methods
  private getCurrentUser(): User | undefined {
    if (!this.currentSession) return undefined;
    return this.users.find(u => u.id === this.currentSession!.userId);
  }

  private logTransaction(userId: string, type: Transaction['type'], amount: number, description: string, status: Transaction['status'], fromAccount?: string, toAccount?: string, loanId?: string): void {
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      type,
      amount,
      description,
      timestamp: new Date().toISOString(),
      status,
      fromAccount,
      toAccount,
      loanId
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

  private logAdminAction(action: AdminAction['action'], targetUserId?: string, 
                        targetLoanId?: string, details?: string, reason?: string): void {
    if (!this.currentSession) return;
    
    const adminAction: AdminAction = {
      id: Math.random().toString(36).substr(2, 9),
      adminId: this.currentSession.userId,
      action,
      targetUserId,
      targetLoanId,
      details: details || '',
      timestamp: new Date().toISOString(),
      reason
    };
    this.adminActions.push(adminAction);
  }

  private detectFraud(userId: string, type: string, amount: number): boolean {
    if (amount > 50000) return true;
    
    const recentTransactions = this.transactions.filter(
      t => t.userId === userId && 
      new Date(t.timestamp).getTime() > Date.now() - 3600000
    );
    
    if (recentTransactions.length > 5) return true;

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

  private calculateInterestRate(creditScore: number, loanType: Loan['type']): number {
    let baseRate = 15;
    
    if (creditScore >= 750) baseRate -= 3;
    else if (creditScore >= 700) baseRate -= 2;
    else if (creditScore >= 650) baseRate -= 1;
    
    switch (loanType) {
      case 'PERSONAL': return baseRate;
      case 'BUSINESS': return baseRate - 1;
      case 'EMERGENCY': return baseRate + 2;
      case 'EDUCATION': return baseRate - 2;
      default: return baseRate;
    }
  }

  private calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  }
}

export const atmService = new ATMService();
