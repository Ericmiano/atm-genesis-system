
export interface User {
  id: string;
  accountNumber: string;
  name: string;
  email: string;
  pin: string;
  balance: number;
  role: 'USER' | 'ADMIN';
  isLocked: boolean;
  failedAttempts: number;
  createdAt: string;
  lastLogin?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'WITHDRAWAL' | 'DEPOSIT' | 'TRANSFER' | 'BALANCE_INQUIRY' | 'BILL_PAYMENT' | 'PIN_CHANGE';
  amount: number;
  description: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  fromAccount?: string;
  toAccount?: string;
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
  type: 'SUSPICIOUS_AMOUNT' | 'MULTIPLE_ATTEMPTS' | 'UNUSUAL_PATTERN';
  description: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  resolved: boolean;
}
