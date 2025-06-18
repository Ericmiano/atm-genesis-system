export interface User {
  id: string;
  accountNumber: string;
  username: string;
  password: string;
  name: string;
  email: string;
  pin: string;
  balance: number;
  role: 'USER' | 'ADMIN';
  isLocked: boolean;
  lockReason?: string;
  lockDate?: string;
  failedAttempts: number;
  failedPasswordAttempts: number;
  lastPasswordAttempt?: string;
  createdAt: string;
  lastLogin?: string;
  creditScore?: number;
  monthlyIncome?: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardType: 'VISA' | 'MASTERCARD';
  passwordLastChanged?: string;
  mustChangePassword: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'WITHDRAWAL' | 'DEPOSIT' | 'TRANSFER' | 'BALANCE_INQUIRY' | 'BILL_PAYMENT' | 'PIN_CHANGE' | 'LOAN_DISBURSEMENT' | 'LOAN_PAYMENT';
  amount: number;
  description: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  fromAccount?: string;
  toAccount?: string;
  loanId?: string;
}

export interface Loan {
  id: string;
  userId: string;
  type: 'PERSONAL' | 'BUSINESS' | 'EMERGENCY' | 'EDUCATION';
  principal: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalAmount: number;
  remainingBalance: number;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'REJECTED';
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  nextPaymentDate?: string;
  collateral?: string;
  purpose: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  principalPortion: number;
  interestPortion: number;
  remainingBalance: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Bill {
  id: string;
  type: 'UTILITY' | 'SUBSCRIPTION' | 'CREDIT_CARD' | 'LOAN';
  name: string;
  amount: number;
  dueDate: string;
}

export interface ATMSession {
  sessionId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  isActive: boolean;
}

export type Language = 'en' | 'es' | 'fr';

export interface FraudAlert {
  id: string;
  userId: string;
  type: 'SUSPICIOUS_AMOUNT' | 'MULTIPLE_ATTEMPTS' | 'UNUSUAL_PATTERN' | 'LARGE_LOAN_REQUEST';
  description: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  resolved: boolean;
}

export interface AdminAction {
  id: string;
  adminId: string;
  action: 'UNLOCK_ACCOUNT' | 'RESET_PIN' | 'RESET_PASSWORD' | 'APPROVE_LOAN' | 'REJECT_LOAN' | 'SUSPEND_USER' | 'ACTIVATE_USER' | 'ADJUST_BALANCE' | 'RESOLVE_FRAUD_ALERT';
  targetUserId?: string;
  targetLoanId?: string;
  details: string;
  timestamp: string;
  reason?: string;
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface SecuritySettings {
  maxFailedAttempts: number;
  lockoutDuration: number; // in minutes
  passwordExpiryDays: number;
  sessionTimeout: number; // in minutes
}
