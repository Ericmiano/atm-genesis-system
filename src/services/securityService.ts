import { supabase } from '@/integrations/supabase/client';
import { User } from '../types/atm';

// Security configuration
const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL_CHARS: true,
  
  // Session management
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 100,
  
  // Input validation
  MAX_INPUT_LENGTH: 1000,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

  // Biometric settings
  BIOMETRIC_ENABLED: true,
  BIOMETRIC_TIMEOUT: 5 * 60 * 1000, // 5 minutes

  // Device fingerprinting
  DEVICE_FINGERPRINT_ENABLED: true,
  TRUSTED_DEVICE_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Behavioral analysis
  BEHAVIORAL_ANALYSIS_ENABLED: true,
  TYPING_PATTERN_SAMPLES: 10,
  MOUSE_PATTERN_SAMPLES: 20,

  // Encryption
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  KEY_ROTATION_INTERVAL: 90 * 24 * 60 * 60 * 1000, // 90 days
};

// Security event types
export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_EXPORT = 'DATA_EXPORT',
  ADMIN_ACTION = 'ADMIN_ACTION',
  BIOMETRIC_AUTH = 'BIOMETRIC_AUTH',
  DEVICE_FINGERPRINT = 'DEVICE_FINGERPRINT',
  BEHAVIORAL_ANALYSIS = 'BEHAVIORAL_ANALYSIS',
  ENCRYPTION_KEY_ROTATION = 'ENCRYPTION_KEY_ROTATION',
  THREAT_DETECTED = 'THREAT_DETECTED',
  GEO_FENCING_VIOLATION = 'GEO_FENCING_VIOLATION',
  TIME_BASED_RESTRICTION = 'TIME_BASED_RESTRICTION',
}

// Security event interface
interface SecurityEvent {
  id: string;
  userId?: string;
  eventType: SecurityEventType;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  deviceFingerprint?: string;
  location?: { lat: number; lng: number; country: string; city: string };
  riskScore?: number;
}

// Device fingerprint interface
interface DeviceFingerprint {
  id: string;
  userId: string;
  fingerprint: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  isTrusted: boolean;
  lastUsed: Date;
  createdAt: Date;
}

// Behavioral pattern interface
interface BehavioralPattern {
  userId: string;
  typingPattern: number[];
  mousePattern: number[];
  sessionDuration: number;
  actionsPerMinute: number;
  lastUpdated: Date;
}

// Biometric data interface
interface BiometricData {
  userId: string;
  biometricType: 'fingerprint' | 'face' | 'voice';
  biometricHash: string;
  isEnabled: boolean;
  lastUsed: Date;
}

// Threat intelligence interface
interface ThreatIntelligence {
  ipAddress: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  threatType: string[];
  lastSeen: Date;
  source: string;
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Login attempts store
const loginAttemptsStore = new Map<string, { attempts: number; lockoutUntil?: number }>();

// Device fingerprint store
const deviceFingerprintStore = new Map<string, DeviceFingerprint>();

// Behavioral patterns store
const behavioralPatternsStore = new Map<string, BehavioralPattern>();

// Threat intelligence store
const threatIntelligenceStore = new Map<string, ThreatIntelligence>();

interface SecuritySettings {
  maxFailedAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  requireMFA: boolean;
  requireBiometric: boolean;
  enableDeviceFingerprinting: boolean;
  enableBehavioralAnalysis: boolean;
  enableGeoFencing: boolean;
  enableTimeRestrictions: boolean;
  encryptionLevel: 'standard' | 'enhanced' | 'military';
}

interface FraudPattern {
  type: 'LARGE_WITHDRAWAL' | 'MULTIPLE_FAILED_LOGINS' | 'UNUSUAL_LOCATION' | 'RAPID_TRANSACTIONS' | 'BEHAVIORAL_ANOMALY' | 'DEVICE_MISMATCH';
  threshold: number;
  timeWindow: number; // in minutes
  riskScore: number;
}

export class SecurityService {
  private defaultSettings: SecuritySettings = {
    maxFailedAttempts: 3,
    lockoutDuration: 30,
    sessionTimeout: 15,
    requireMFA: true,
    requireBiometric: false,
    enableDeviceFingerprinting: true,
    enableBehavioralAnalysis: true,
    enableGeoFencing: false,
    enableTimeRestrictions: false,
    encryptionLevel: 'enhanced'
  };

  private fraudPatterns: FraudPattern[] = [
    { type: 'LARGE_WITHDRAWAL', threshold: 50000, timeWindow: 60, riskScore: 0.7 },
    { type: 'MULTIPLE_FAILED_LOGINS', threshold: 3, timeWindow: 15, riskScore: 0.8 },
    { type: 'RAPID_TRANSACTIONS', threshold: 5, timeWindow: 10, riskScore: 0.6 },
    { type: 'BEHAVIORAL_ANOMALY', threshold: 0.8, timeWindow: 30, riskScore: 0.9 },
    { type: 'DEVICE_MISMATCH', threshold: 1, timeWindow: 60, riskScore: 0.7 }
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
  async encryptSensitiveData(data: string, encryptionLevel: 'standard' | 'enhanced' | 'military' = 'enhanced'): Promise<string> {
    try {
      const algorithm = encryptionLevel === 'military' ? 'AES-256-GCM' : 
                       encryptionLevel === 'enhanced' ? 'AES-256-CBC' : 'AES-128-CBC';
      
      // In a real implementation, you would use a proper encryption library
      // This is a simplified version for demonstration
      const key = await this.getEncryptionKey(encryptionLevel);
      const encrypted = btoa(data + key); // Simplified encryption
      
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  async decryptSensitiveData(encryptedData: string, encryptionLevel: 'standard' | 'enhanced' | 'military' = 'enhanced'): Promise<string> {
    try {
      const key = await this.getEncryptionKey(encryptionLevel);
      const decrypted = atob(encryptedData).replace(key, ''); // Simplified decryption
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
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

  // Password validation
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, SECURITY_CONFIG.MAX_INPUT_LENGTH);
  }

  // XSS prevention
  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // SQL injection prevention (for dynamic queries)
  escapeSqlIdentifier(identifier: string): string {
    return identifier.replace(/[^a-zA-Z0-9_]/g, '');
  }

  // Rate limiting
  checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
      });
      return {
        allowed: true,
        remaining: SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW - 1,
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
      };
    }

    if (record.count >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW - record.count,
      resetTime: record.resetTime,
    };
  }

  // Login attempt tracking
  checkLoginAttempts(email: string): { allowed: boolean; remainingAttempts: number; lockoutUntil?: number } {
    const record = loginAttemptsStore.get(email);
    const now = Date.now();

    if (!record) {
      return { allowed: true, remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS };
    }

    if (record.lockoutUntil && now < record.lockoutUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutUntil: record.lockoutUntil,
      };
    }

    if (record.lockoutUntil && now >= record.lockoutUntil) {
      // Reset lockout
      loginAttemptsStore.set(email, { attempts: 0 });
      return { allowed: true, remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS };
    }

    return {
      allowed: record.attempts < SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
      remainingAttempts: Math.max(0, SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - record.attempts),
    };
  }

  // Record failed login attempt
  recordFailedLogin(email: string): void {
    const record = loginAttemptsStore.get(email) || { attempts: 0 };
    record.attempts++;

    if (record.attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      record.lockoutUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
    }

    loginAttemptsStore.set(email, record);
  }

  // Reset login attempts
  resetLoginAttempts(email: string): void {
    loginAttemptsStore.delete(email);
  }

  // Session management
  createSession(userId: string): { sessionId: string; expiresAt: Date } {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT);

    // Store session in localStorage (in production, use secure HTTP-only cookies)
    localStorage.setItem(`session_${sessionId}`, JSON.stringify({
      userId,
      expiresAt: expiresAt.toISOString(),
    }));

    return { sessionId, expiresAt };
  }

  // Validate session
  validateSession(sessionId: string): { valid: boolean; userId?: string } {
    const sessionData = localStorage.getItem(`session_${sessionId}`);
    if (!sessionData) {
      return { valid: false };
    }

    try {
      const session = JSON.parse(sessionData);
      const expiresAt = new Date(session.expiresAt);

      if (Date.now() > expiresAt.getTime()) {
        this.destroySession(sessionId);
        return { valid: false };
      }

      return { valid: true, userId: session.userId };
    } catch {
      return { valid: false };
    }
  }

  // Destroy session
  destroySession(sessionId: string): void {
    localStorage.removeItem(`session_${sessionId}`);
  }

  // File upload validation
  validateFileUpload(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push('File type not allowed');
    }

    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Generate secure token
  generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash sensitive data (for client-side storage)
  async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Log security event
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event,
    };

    try {
      // Store in Supabase
      const { error } = await supabase
        .from('security_events')
        .insert({
          id: securityEvent.id,
          user_id: securityEvent.userId,
          event_type: securityEvent.eventType,
          description: securityEvent.description,
          ip_address: securityEvent.ipAddress,
          user_agent: securityEvent.userAgent,
          timestamp: securityEvent.timestamp.toISOString(),
          metadata: securityEvent.metadata,
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Detect suspicious activity
  detectSuspiciousActivity(userId: string, action: string, context: any): boolean {
    // Implement suspicious activity detection logic
    const suspiciousPatterns = [
      // Multiple failed login attempts
      { pattern: 'login_failed', threshold: 3, timeWindow: 5 * 60 * 1000 },
      // Unusual transaction amounts
      { pattern: 'large_transaction', threshold: 1000000, timeWindow: 24 * 60 * 60 * 1000 },
      // Unusual login locations
      { pattern: 'location_change', threshold: 1, timeWindow: 60 * 60 * 1000 },
    ];

    // This is a simplified implementation
    // In production, use machine learning models and more sophisticated detection
    return false;
  }

  // Get client information
  getClientInfo(): { ipAddress?: string; userAgent: string; timestamp: Date } {
    return {
      userAgent: navigator.userAgent,
      timestamp: new Date(),
    };
  }

  // Validate CSRF token
  validateCSRFToken(token: string): boolean {
    const storedToken = localStorage.getItem('csrf_token');
    return token === storedToken;
  }

  // Generate CSRF token
  generateCSRFToken(): string {
    const token = this.generateSecureToken();
    localStorage.setItem('csrf_token', token);
    return token;
  }

  // Content Security Policy validation
  validateCSP(script: string): boolean {
    // Basic CSP validation - in production, use a proper CSP parser
    const dangerousPatterns = [
      'eval(',
      'Function(',
      'setTimeout(',
      'setInterval(',
      'innerHTML',
      'outerHTML',
    ];

    return !dangerousPatterns.some(pattern => script.includes(pattern));
  }

  // Audit trail
  async createAuditTrail(action: string, userId: string, details: any): Promise<void> {
    await this.logSecurityEvent({
      userId,
      eventType: SecurityEventType.ADMIN_ACTION,
      description: `Audit: ${action}`,
      metadata: details,
    });
  }

  // Security health check
  async performSecurityHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if HTTPS is being used
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push('Not using HTTPS');
      recommendations.push('Enable HTTPS for all connections');
    }

    // Check for secure headers (basic check)
    if (!window.location.href.includes('localhost')) {
      recommendations.push('Implement security headers (HSTS, CSP, etc.)');
    }

    // Check session timeout
    if (SECURITY_CONFIG.SESSION_TIMEOUT > 60 * 60 * 1000) {
      issues.push('Session timeout is too long');
      recommendations.push('Reduce session timeout to 30 minutes or less');
    }

    // Check password requirements
    if (!SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL_CHARS) {
      recommendations.push('Enable special character requirement for passwords');
    }

    const status = issues.length === 0 ? 'healthy' : issues.length <= 2 ? 'warning' : 'critical';

    return {
      status,
      issues,
      recommendations,
    };
  }

  // Biometric Authentication
  async setupBiometric(userId: string, biometricType: 'fingerprint' | 'face' | 'voice', biometricData: string): Promise<{ success: boolean; message: string }> {
    try {
      const biometricHash = await this.hashData(biometricData);
      
      await supabase
        .from('biometric_data')
        .upsert({
          user_id: userId,
          biometric_type: biometricType,
          biometric_hash: biometricHash,
          is_enabled: true,
          last_used: new Date().toISOString()
        });

      await this.logSecurityEvent({
        userId,
        eventType: SecurityEventType.BIOMETRIC_AUTH,
        description: `Biometric ${biometricType} setup completed`,
        metadata: { biometricType }
      });

      return { success: true, message: 'Biometric authentication setup successful' };
    } catch (error) {
      console.error('Biometric setup error:', error);
      return { success: false, message: 'Biometric setup failed' };
    }
  }

  async verifyBiometric(userId: string, biometricType: 'fingerprint' | 'face' | 'voice', biometricData: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: storedBiometric } = await supabase
        .from('biometric_data')
        .select('*')
        .eq('user_id', userId)
        .eq('biometric_type', biometricType)
        .eq('is_enabled', true)
        .single();

      if (!storedBiometric) {
        return { success: false, message: 'Biometric not configured' };
      }

      const inputHash = await this.hashData(biometricData);
      const isMatch = inputHash === storedBiometric.biometric_hash;

      if (isMatch) {
        await supabase
          .from('biometric_data')
          .update({ last_used: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('biometric_type', biometricType);

        await this.logSecurityEvent({
          userId,
          eventType: SecurityEventType.BIOMETRIC_AUTH,
          description: `Biometric ${biometricType} verification successful`,
          metadata: { biometricType }
        });
      }

      return { 
        success: isMatch, 
        message: isMatch ? 'Biometric verification successful' : 'Biometric verification failed' 
      };
    } catch (error) {
      console.error('Biometric verification error:', error);
      return { success: false, message: 'Biometric verification failed' };
    }
  }

  // Device Fingerprinting
  async createDeviceFingerprint(userId: string, deviceInfo: any): Promise<string> {
    try {
      const fingerprint = await this.generateDeviceFingerprint(deviceInfo);
      
      await supabase
        .from('device_fingerprints')
        .upsert({
          user_id: userId,
          fingerprint: fingerprint,
          user_agent: deviceInfo.userAgent,
          screen_resolution: deviceInfo.screenResolution,
          timezone: deviceInfo.timezone,
          language: deviceInfo.language,
          platform: deviceInfo.platform,
          is_trusted: false,
          last_used: new Date().toISOString()
        });

      await this.logSecurityEvent({
        userId,
        eventType: SecurityEventType.DEVICE_FINGERPRINT,
        description: 'Device fingerprint created',
        metadata: { deviceInfo }
      });

      return fingerprint;
    } catch (error) {
      console.error('Device fingerprint creation error:', error);
      throw error;
    }
  }

  async validateDeviceFingerprint(userId: string, currentFingerprint: string): Promise<{ isTrusted: boolean; riskScore: number }> {
    try {
      const { data: storedFingerprints } = await supabase
        .from('device_fingerprints')
        .select('*')
        .eq('user_id', userId);

      if (!storedFingerprints || storedFingerprints.length === 0) {
        return { isTrusted: false, riskScore: 0.8 };
      }

      const trustedDevices = storedFingerprints.filter(d => d.is_trusted);
      const isKnownDevice = trustedDevices.some(d => d.fingerprint === currentFingerprint);
      
      let riskScore = 0.5;
      if (!isKnownDevice) {
        riskScore = 0.8;
        await this.logSecurityEvent({
          userId,
          eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
          description: 'Unknown device detected',
          metadata: { currentFingerprint },
          riskScore
        });
      }

      return { isTrusted: isKnownDevice, riskScore };
    } catch (error) {
      console.error('Device fingerprint validation error:', error);
      return { isTrusted: false, riskScore: 0.9 };
    }
  }

  // Behavioral Analysis
  async recordBehavioralPattern(userId: string, pattern: Partial<BehavioralPattern>): Promise<void> {
    try {
      const existingPattern = behavioralPatternsStore.get(userId);
      const updatedPattern: BehavioralPattern = {
        userId,
        typingPattern: pattern.typingPattern || existingPattern?.typingPattern || [],
        mousePattern: pattern.mousePattern || existingPattern?.mousePattern || [],
        sessionDuration: pattern.sessionDuration || existingPattern?.sessionDuration || 0,
        actionsPerMinute: pattern.actionsPerMinute || existingPattern?.actionsPerMinute || 0,
        lastUpdated: new Date()
      };

      behavioralPatternsStore.set(userId, updatedPattern);

      await supabase
        .from('behavioral_patterns')
        .upsert({
          user_id: userId,
          typing_pattern: updatedPattern.typingPattern,
          mouse_pattern: updatedPattern.mousePattern,
          session_duration: updatedPattern.sessionDuration,
          actions_per_minute: updatedPattern.actionsPerMinute,
          last_updated: updatedPattern.lastUpdated.toISOString()
        });

      await this.logSecurityEvent({
        userId,
        eventType: SecurityEventType.BEHAVIORAL_ANALYSIS,
        description: 'Behavioral pattern recorded',
        metadata: { patternType: Object.keys(pattern) }
      });
    } catch (error) {
      console.error('Behavioral pattern recording error:', error);
    }
  }

  async analyzeBehavioralAnomaly(userId: string, currentPattern: Partial<BehavioralPattern>): Promise<{ isAnomaly: boolean; confidence: number }> {
    try {
      const storedPattern = behavioralPatternsStore.get(userId);
      if (!storedPattern) {
        return { isAnomaly: false, confidence: 0 };
      }

      let anomalyScore = 0;
      let totalChecks = 0;

      // Compare typing patterns
      if (currentPattern.typingPattern && storedPattern.typingPattern.length > 0) {
        const typingSimilarity = this.calculatePatternSimilarity(currentPattern.typingPattern, storedPattern.typingPattern);
        anomalyScore += (1 - typingSimilarity);
        totalChecks++;
      }

      // Compare mouse patterns
      if (currentPattern.mousePattern && storedPattern.mousePattern.length > 0) {
        const mouseSimilarity = this.calculatePatternSimilarity(currentPattern.mousePattern, storedPattern.mousePattern);
        anomalyScore += (1 - mouseSimilarity);
        totalChecks++;
      }

      // Compare session behavior
      if (currentPattern.actionsPerMinute && storedPattern.actionsPerMinute > 0) {
        const actionDeviation = Math.abs(currentPattern.actionsPerMinute - storedPattern.actionsPerMinute) / storedPattern.actionsPerMinute;
        anomalyScore += Math.min(actionDeviation, 1);
        totalChecks++;
      }

      const averageAnomalyScore = totalChecks > 0 ? anomalyScore / totalChecks : 0;
      const isAnomaly = averageAnomalyScore > 0.3;
      const confidence = Math.min(averageAnomalyScore, 1);

      if (isAnomaly) {
        await this.logSecurityEvent({
          userId,
          eventType: SecurityEventType.BEHAVIORAL_ANALYSIS,
          description: 'Behavioral anomaly detected',
          metadata: { anomalyScore: averageAnomalyScore, confidence },
          riskScore: confidence
        });
      }

      return { isAnomaly, confidence };
    } catch (error) {
      console.error('Behavioral analysis error:', error);
      return { isAnomaly: false, confidence: 0 };
    }
  }

  // Real-time Threat Detection
  async detectRealTimeThreats(userId: string, action: string, context: any): Promise<{ threats: string[]; riskScore: number; recommendations: string[] }> {
    try {
      const threats: string[] = [];
      let riskScore = 0;
      const recommendations: string[] = [];

      // Check IP reputation
      const clientInfo = this.getClientInfo();
      if (clientInfo.ipAddress) {
        const ipThreat = threatIntelligenceStore.get(clientInfo.ipAddress);
        if (ipThreat && ipThreat.threatLevel === 'high') {
          threats.push('Suspicious IP address detected');
          riskScore += 0.4;
          recommendations.push('Consider blocking this IP address');
        }
      }

      // Check for unusual activity patterns
      const { data: recentEvents } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('timestamp', { ascending: false });

      if (recentEvents && recentEvents.length > 50) {
        threats.push('Unusual activity volume detected');
        riskScore += 0.3;
        recommendations.push('Review recent account activity');
      }

      // Check for concurrent sessions
      const { data: activeSessions } = await supabase
        .from('atm_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (activeSessions && activeSessions.length > 3) {
        threats.push('Multiple concurrent sessions detected');
        riskScore += 0.5;
        recommendations.push('Terminate other sessions');
      }

      // Check for time-based anomalies
      const currentHour = new Date().getHours();
      if (currentHour < 6 || currentHour > 23) {
        threats.push('Unusual access time detected');
        riskScore += 0.2;
        recommendations.push('Verify this is legitimate access');
      }

      if (threats.length > 0) {
        await this.logSecurityEvent({
          userId,
          eventType: SecurityEventType.THREAT_DETECTED,
          description: `Real-time threats detected: ${threats.join(', ')}`,
          metadata: { threats, riskScore, context },
          riskScore
        });
      }

      return { threats, riskScore: Math.min(riskScore, 1), recommendations };
    } catch (error) {
      console.error('Real-time threat detection error:', error);
      return { threats: [], riskScore: 0, recommendations: [] };
    }
  }

  // Geo-fencing
  async setupGeoFencing(userId: string, allowedLocations: Array<{ lat: number; lng: number; radius: number }>): Promise<{ success: boolean; message: string }> {
    try {
      await supabase
        .from('geo_fencing')
        .upsert({
          user_id: userId,
          allowed_locations: allowedLocations,
          is_enabled: true,
          created_at: new Date().toISOString()
        });

      await this.logSecurityEvent({
        userId,
        eventType: SecurityEventType.GEO_FENCING_VIOLATION,
        description: 'Geo-fencing setup completed',
        metadata: { allowedLocations }
      });

      return { success: true, message: 'Geo-fencing setup successful' };
    } catch (error) {
      console.error('Geo-fencing setup error:', error);
      return { success: false, message: 'Geo-fencing setup failed' };
    }
  }

  async validateGeoLocation(userId: string, currentLocation: { lat: number; lng: number }): Promise<{ isAllowed: boolean; distance: number }> {
    try {
      const { data: geoFencing } = await supabase
        .from('geo_fencing')
        .select('*')
        .eq('user_id', userId)
        .eq('is_enabled', true)
        .single();

      if (!geoFencing) {
        return { isAllowed: true, distance: 0 };
      }

      const allowedLocations = geoFencing.allowed_locations;
      let minDistance = Infinity;
      let isAllowed = false;

      for (const location of allowedLocations) {
        const distance = this.calculateDistance(
          currentLocation.lat, currentLocation.lng,
          location.lat, location.lng
        );

        if (distance <= location.radius) {
          isAllowed = true;
          minDistance = Math.min(minDistance, distance);
        }
      }

      if (!isAllowed) {
        await this.logSecurityEvent({
          userId,
          eventType: SecurityEventType.GEO_FENCING_VIOLATION,
          description: 'Geo-fencing violation detected',
          metadata: { currentLocation, allowedLocations },
          riskScore: 0.8
        });
      }

      return { isAllowed, distance: minDistance };
    } catch (error) {
      console.error('Geo-location validation error:', error);
      return { isAllowed: false, distance: Infinity };
    }
  }

  // Time-based Restrictions
  async setupTimeRestrictions(userId: string, restrictions: Array<{ day: number; startHour: number; endHour: number }>): Promise<{ success: boolean; message: string }> {
    try {
      await supabase
        .from('time_restrictions')
        .upsert({
          user_id: userId,
          restrictions: restrictions,
          is_enabled: true,
          created_at: new Date().toISOString()
        });

      await this.logSecurityEvent({
        userId,
        eventType: SecurityEventType.TIME_BASED_RESTRICTION,
        description: 'Time restrictions setup completed',
        metadata: { restrictions }
      });

      return { success: true, message: 'Time restrictions setup successful' };
    } catch (error) {
      console.error('Time restrictions setup error:', error);
      return { success: false, message: 'Time restrictions setup failed' };
    }
  }

  async validateTimeRestrictions(userId: string): Promise<{ isAllowed: boolean; reason?: string }> {
    try {
      const { data: timeRestrictions } = await supabase
        .from('time_restrictions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_enabled', true)
        .single();

      if (!timeRestrictions) {
        return { isAllowed: true };
      }

      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();

      const restrictions = timeRestrictions.restrictions;
      const currentRestriction = restrictions.find(r => r.day === currentDay);

      if (currentRestriction) {
        const isAllowed = currentHour >= currentRestriction.startHour && currentHour <= currentRestriction.endHour;
        
        if (!isAllowed) {
          await this.logSecurityEvent({
            userId,
            eventType: SecurityEventType.TIME_BASED_RESTRICTION,
            description: 'Time restriction violation detected',
            metadata: { currentDay, currentHour, restriction: currentRestriction },
            riskScore: 0.6
          });

          return { 
            isAllowed: false, 
            reason: `Access not allowed between ${currentRestriction.startHour}:00 and ${currentRestriction.endHour}:00 on this day` 
          };
        }
      }

      return { isAllowed: true };
    } catch (error) {
      console.error('Time restrictions validation error:', error);
      return { isAllowed: false, reason: 'Time validation failed' };
    }
  }

  // Enhanced Security Health Check
  async performAdvancedSecurityHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    metrics: {
      totalThreats: number;
      averageRiskScore: number;
      securityEvents: number;
      activeSessions: number;
    };
  }> {
    try {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';

      // Check for recent security events
      const { data: recentEvents } = await supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      const highRiskEvents = recentEvents?.filter(e => e.risk_score > 0.7) || [];
      if (highRiskEvents.length > 10) {
        issues.push('High number of high-risk security events detected');
        status = 'critical';
        recommendations.push('Review security policies and implement additional controls');
      }

      // Check for locked accounts
      const { data: lockedAccounts } = await supabase
        .from('users')
        .select('*')
        .eq('is_locked', true);

      if (lockedAccounts && lockedAccounts.length > 5) {
        issues.push('Multiple accounts are locked');
        status = status === 'healthy' ? 'warning' : status;
        recommendations.push('Review account lockout policies');
      }

      // Check for suspicious IP addresses
      const { data: suspiciousIPs } = await supabase
        .from('security_events')
        .select('ip_address')
        .eq('event_type', SecurityEventType.SUSPICIOUS_ACTIVITY)
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

      const uniqueSuspiciousIPs = new Set(suspiciousIPs?.map(e => e.ip_address) || []);
      if (uniqueSuspiciousIPs.size > 5) {
        issues.push('Multiple suspicious IP addresses detected');
        status = status === 'healthy' ? 'warning' : status;
        recommendations.push('Consider implementing IP-based blocking');
      }

      // Calculate metrics
      const totalThreats = highRiskEvents.length;
      const averageRiskScore = recentEvents?.reduce((sum, e) => sum + (e.risk_score || 0), 0) / (recentEvents?.length || 1);
      const securityEvents = recentEvents?.length || 0;

      const { data: activeSessions } = await supabase
        .from('atm_sessions')
        .select('*')
        .eq('is_active', true);
      const activeSessionsCount = activeSessions?.length || 0;

      return {
        status,
        issues,
        recommendations,
        metrics: {
          totalThreats,
          averageRiskScore,
          securityEvents,
          activeSessions: activeSessionsCount
        }
      };
    } catch (error) {
      console.error('Advanced security health check error:', error);
      return {
        status: 'critical',
        issues: ['Security health check failed'],
        recommendations: ['Investigate system security status'],
        metrics: { totalThreats: 0, averageRiskScore: 0, securityEvents: 0, activeSessions: 0 }
      };
    }
  }

  // Helper methods
  private async generateDeviceFingerprint(deviceInfo: any): Promise<string> {
    const fingerprintData = [
      deviceInfo.userAgent,
      deviceInfo.screenResolution,
      deviceInfo.timezone,
      deviceInfo.language,
      deviceInfo.platform
    ].join('|');
    
    return await this.hashData(fingerprintData);
  }

  private calculatePatternSimilarity(pattern1: number[], pattern2: number[]): number {
    if (pattern1.length !== pattern2.length) return 0;
    
    const differences = pattern1.map((val, index) => Math.abs(val - pattern2[index]));
    const averageDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    
    return Math.max(0, 1 - averageDifference / 100);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private async getEncryptionKey(level: 'standard' | 'enhanced' | 'military'): Promise<string> {
    // In a real implementation, this would fetch from a secure key management system
    const keys = {
      standard: 'standard-key-128',
      enhanced: 'enhanced-key-256',
      military: 'military-key-256-gcm'
    };
    return keys[level];
  }
}

export const securityService = new SecurityService();

// Security middleware for API calls
export const withSecurity = <T extends (...args: any[]) => any>(
  fn: T,
  options: {
    requireAuth?: boolean;
    rateLimit?: boolean;
    validateInput?: boolean;
    logEvent?: boolean;
    eventType?: SecurityEventType;
  } = {}
): T => {
  return ((...args: any[]) => {
    const {
      requireAuth = true,
      rateLimit = true,
      validateInput = true,
      logEvent = false,
      eventType = SecurityEventType.ADMIN_ACTION,
    } = options;

    // Rate limiting
    if (rateLimit) {
      const rateLimitResult = securityService.checkRateLimit('api_call');
      if (!rateLimitResult.allowed) {
        throw new Error('Rate limit exceeded');
      }
    }

    // Input validation
    if (validateInput) {
      args.forEach((arg, index) => {
        if (typeof arg === 'string') {
          args[index] = securityService.sanitizeInput(arg);
        }
      });
    }

    // Execute function
    const result = fn(...args);

    // Log event
    if (logEvent) {
      securityService.logSecurityEvent({
        eventType,
        description: `Function ${fn.name} executed`,
        metadata: { args, result },
      });
    }

    return result;
  }) as T;
};
