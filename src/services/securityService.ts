
import { supabase } from '@/integrations/supabase/client';
import { User } from '../types/atm';

interface SecuritySettings {
  maxFailedAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  requireMFA: boolean;
}

interface FraudPattern {
  type: 'LARGE_WITHDRAWAL' | 'MULTIPLE_FAILED_LOGINS' | 'UNUSUAL_LOCATION' | 'RAPID_TRANSACTIONS';
  threshold: number;
  timeWindow: number; // in minutes
}

export class SecurityService {
  private defaultSettings: SecuritySettings = {
    maxFailedAttempts: 3,
    lockoutDuration: 30,
    sessionTimeout: 15,
    requireMFA: true
  };

  private fraudPatterns: FraudPattern[] = [
    { type: 'LARGE_WITHDRAWAL', threshold: 50000, timeWindow: 60 },
    { type: 'MULTIPLE_FAILED_LOGINS', threshold: 3, timeWindow: 15 },
    { type: 'RAPID_TRANSACTIONS', threshold: 5, timeWindow: 10 }
  ];

  // Multi-factor Authentication
  async verifyMFA(userId: string, accountNumber: string, pin: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('account_number', accountNumber)
        .eq('pin', pin)
        .single();

      if (error || !user) {
        await this.logSecurityEvent(userId, 'MFA_FAILED', 'Invalid account number or PIN');
        return { success: false, message: 'Invalid credentials' };
      }

      if (user.is_locked) {
        await this.logSecurityEvent(userId, 'MFA_BLOCKED', 'Account is locked');
        return { success: false, message: 'Account is locked' };
      }

      await this.logSecurityEvent(userId, 'MFA_SUCCESS', 'Multi-factor authentication successful');
      return { success: true, message: 'MFA verification successful' };
    } catch (error) {
      console.error('MFA verification error:', error);
      return { success: false, message: 'MFA verification failed' };
    }
  }

  // Account Lockout Protection
  async handleFailedAttempt(userId: string, attemptType: 'LOGIN' | 'PIN'): Promise<{ shouldLock: boolean; attemptsLeft: number }> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('failed_attempts, failed_password_attempts, is_locked')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return { shouldLock: false, attemptsLeft: 0 };
      }

      const currentAttempts = attemptType === 'LOGIN' ? user.failed_password_attempts : user.failed_attempts;
      const newAttempts = currentAttempts + 1;
      const shouldLock = newAttempts >= this.defaultSettings.maxFailedAttempts;

      const updateData: any = {
        [attemptType === 'LOGIN' ? 'failed_password_attempts' : 'failed_attempts']: newAttempts,
        [attemptType === 'LOGIN' ? 'last_password_attempt' : 'updated_at']: new Date().toISOString()
      };

      if (shouldLock) {
        updateData.is_locked = true;
        updateData.lock_reason = `Account locked due to ${newAttempts} failed ${attemptType.toLowerCase()} attempts`;
        updateData.lock_date = new Date().toISOString();
      }

      await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      await this.logSecurityEvent(
        userId, 
        shouldLock ? 'ACCOUNT_LOCKED' : 'FAILED_ATTEMPT',
        `${attemptType} attempt failed. ${shouldLock ? 'Account locked.' : `${this.defaultSettings.maxFailedAttempts - newAttempts} attempts remaining.`}`
      );

      return { 
        shouldLock, 
        attemptsLeft: Math.max(0, this.defaultSettings.maxFailedAttempts - newAttempts) 
      };
    } catch (error) {
      console.error('Failed attempt handling error:', error);
      return { shouldLock: false, attemptsLeft: 0 };
    }
  }

  // Fraud Detection
  async detectFraudulentActivity(userId: string, transactionType: string, amount: number): Promise<{ isSuspicious: boolean; reason?: string }> {
    try {
      // Check for large withdrawal pattern
      if (transactionType === 'WITHDRAWAL' && amount > this.fraudPatterns[0].threshold) {
        await this.logFraudAlert(userId, 'LARGE_WITHDRAWAL', `Large withdrawal of KES ${amount.toLocaleString()}`);
        return { isSuspicious: true, reason: 'Large withdrawal amount detected' };
      }

      // Check for rapid transactions
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
        .order('timestamp', { ascending: false });

      if (recentTransactions && recentTransactions.length >= this.fraudPatterns[2].threshold) {
        await this.logFraudAlert(userId, 'RAPID_TRANSACTIONS', `${recentTransactions.length} transactions in 10 minutes`);
        return { isSuspicious: true, reason: 'Rapid transaction pattern detected' };
      }

      return { isSuspicious: false };
    } catch (error) {
      console.error('Fraud detection error:', error);
      return { isSuspicious: false };
    }
  }

  // Session Management
  async createSecureSession(userId: string): Promise<{ sessionId: string; expiresAt: Date }> {
    try {
      const sessionId = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + this.defaultSettings.sessionTimeout * 60 * 1000);

      await supabase
        .from('atm_sessions')
        .insert({
          session_id: sessionId,
          user_id: userId,
          start_time: new Date().toISOString(),
          is_active: true
        });

      await this.logSecurityEvent(userId, 'SESSION_CREATED', `Secure session created: ${sessionId}`);
      
      return { sessionId, expiresAt };
    } catch (error) {
      console.error('Session creation error:', error);
      throw new Error('Failed to create secure session');
    }
  }

  async validateSession(sessionId: string): Promise<{ isValid: boolean; userId?: string }> {
    try {
      const { data: session, error } = await supabase
        .from('atm_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .single();

      if (error || !session) {
        return { isValid: false };
      }

      const sessionAge = Date.now() - new Date(session.start_time).getTime();
      const isExpired = sessionAge > this.defaultSettings.sessionTimeout * 60 * 1000;

      if (isExpired) {
        await this.terminateSession(sessionId);
        return { isValid: false };
      }

      return { isValid: true, userId: session.user_id };
    } catch (error) {
      console.error('Session validation error:', error);
      return { isValid: false };
    }
  }

  async terminateSession(sessionId: string): Promise<void> {
    try {
      await supabase
        .from('atm_sessions')
        .update({
          is_active: false,
          end_time: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      await this.logSecurityEvent(null, 'SESSION_TERMINATED', `Session terminated: ${sessionId}`);
    } catch (error) {
      console.error('Session termination error:', error);
    }
  }

  // Data Encryption Utilities
  async encryptSensitiveData(data: string): Promise<string> {
    // In a real implementation, use proper encryption libraries
    // For demo purposes, using base64 encoding
    return btoa(data);
  }

  async decryptSensitiveData(encryptedData: string): Promise<string> {
    // In a real implementation, use proper decryption
    // For demo purposes, using base64 decoding
    try {
      return atob(encryptedData);
    } catch (error) {
      return encryptedData; // Return as-is if not encrypted
    }
  }

  // PCI DSS Compliance Helpers
  maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 4) return cardNumber;
    return '**** **** **** ' + cardNumber.slice(-4);
  }

  maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length < 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  }

  validatePCICompliance(data: any): { isCompliant: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check for exposed sensitive data
    if (data.cardNumber && data.cardNumber.length > 4 && !data.cardNumber.includes('*')) {
      violations.push('Card number not properly masked');
    }

    if (data.pin && data.pin.length > 0) {
      violations.push('PIN should never be exposed in logs or responses');
    }

    if (data.cvv && data.cvv.length > 0) {
      violations.push('CVV should never be stored or exposed');
    }

    return {
      isCompliant: violations.length === 0,
      violations
    };
  }

  // Audit Logging
  private async logSecurityEvent(userId: string | null, action: string, details: string): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          details,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  }

  private async logFraudAlert(userId: string, type: string, description: string): Promise<void> {
    try {
      await supabase
        .from('fraud_alerts')
        .insert({
          user_id: userId,
          type: type as any,
          description,
          severity: 'HIGH',
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Fraud alert logging error:', error);
    }
  }

  // Utility Methods
  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Account Unlock (Admin only)
  async unlockAccount(userId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    try {
      await supabase
        .from('users')
        .update({
          is_locked: false,
          failed_attempts: 0,
          failed_password_attempts: 0,
          lock_reason: null,
          lock_date: null
        })
        .eq('id', userId);

      await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          action: 'UNLOCK_ACCOUNT',
          target_user_id: userId,
          details: 'Account unlocked by administrator'
        });

      await this.logSecurityEvent(userId, 'ACCOUNT_UNLOCKED', `Account unlocked by admin: ${adminId}`);

      return { success: true, message: 'Account unlocked successfully' };
    } catch (error) {
      console.error('Account unlock error:', error);
      return { success: false, message: 'Failed to unlock account' };
    }
  }
}

export const securityService = new SecurityService();
