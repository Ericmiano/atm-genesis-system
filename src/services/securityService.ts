import { supabase } from '@/integrations/supabase/client';
import { User } from '../types/atm';

export class SecurityService {
  // Multi-Factor Authentication
  async setupMFA(userId: string, accountNumber: string, pin: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verify account number and PIN combination
      const { data: userData } = await supabase
        .from('users')
        .select('account_number, pin')
        .eq('id', userId)
        .single();

      if (!userData || userData.account_number !== accountNumber || userData.pin !== pin) {
        return { success: false, message: 'Invalid account number or PIN' };
      }

      // Log MFA setup using audit_logs
      await this.logSecurityEvent(userId, 'MFA_SETUP', 'Multi-factor authentication enabled');
      
      return { success: true, message: 'MFA setup successful' };
    } catch (error) {
      console.error('MFA setup failed:', error);
      return { success: false, message: 'MFA setup failed' };
    }
  }

  async verifyMFA(userId: string, accountNumber: string, pin: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('account_number, pin, is_locked')
        .eq('id', userId)
        .single();

      if (!userData) {
        return { success: false, message: 'User not found' };
      }

      if (userData.is_locked) {
        return { success: false, message: 'Account is locked' };
      }

      if (userData.account_number !== accountNumber || userData.pin !== pin) {
        await this.handleFailedAttempt(userId, 'MFA');
        return { success: false, message: 'Invalid account number or PIN' };
      }

      await this.logSecurityEvent(userId, 'MFA_SUCCESS', 'Multi-factor authentication successful');
      return { success: true, message: 'MFA verification successful' };
    } catch (error) {
      console.error('MFA verification failed:', error);
      return { success: false, message: 'MFA verification failed' };
    }
  }

  // Session Management
  async createSecureSession(userId: string): Promise<{ sessionId: string; expiresAt: Date }> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    try {
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
      console.error('Session creation failed:', error);
      throw new Error('Failed to create secure session');
    }
  }

  async validateSession(sessionId: string): Promise<{ isValid: boolean; userId?: string }> {
    try {
      const { data: session } = await supabase
        .from('atm_sessions')
        .select('user_id, start_time, is_active')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .single();

      if (!session) {
        return { isValid: false };
      }

      // Check if session has expired (30 minutes)
      const sessionStart = new Date(session.start_time);
      const now = new Date();
      const thirtyMinutes = 30 * 60 * 1000;

      if (now.getTime() - sessionStart.getTime() > thirtyMinutes) {
        await this.terminateSession(sessionId);
        return { isValid: false };
      }

      return { isValid: true, userId: session.user_id };
    } catch (error) {
      console.error('Session validation failed:', error);
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
    } catch (error) {
      console.error('Session termination failed:', error);
    }
  }

  // Fraud Detection
  async detectFraudulentActivity(userId: string, transactionType: string, amount: number): Promise<{ isSuspicious: boolean; reason?: string }> {
    try {
      // Check for rapid transactions
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
        .order('timestamp', { ascending: false });

      if (recentTransactions && recentTransactions.length > 5) {
        await this.createFraudAlert(userId, 'UNUSUAL_PATTERN', 'Multiple rapid transactions detected', 'HIGH');
        return { isSuspicious: true, reason: 'Multiple rapid transactions detected' };
      }

      // Check for large withdrawal amounts
      if (transactionType === 'WITHDRAWAL' && amount > 50000) {
        await this.createFraudAlert(userId, 'SUSPICIOUS_AMOUNT', `Large withdrawal attempt: KES ${amount}`, 'MEDIUM');
        return { isSuspicious: true, reason: 'Large withdrawal amount detected' };
      }

      // Check for unusual patterns
      const { data: userTransactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (userTransactions && userTransactions.length > 0) {
        const avgAmount = userTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / userTransactions.length;
        
        if (amount > avgAmount * 5) {
          await this.createFraudAlert(userId, 'UNUSUAL_PATTERN', `Transaction amount significantly higher than usual`, 'MEDIUM');
          return { isSuspicious: true, reason: 'Transaction amount significantly higher than usual' };
        }
      }

      return { isSuspicious: false };
    } catch (error) {
      console.error('Fraud detection failed:', error);
      return { isSuspicious: false };
    }
  }

  async createFraudAlert(userId: string, type: 'SUSPICIOUS_AMOUNT' | 'MULTIPLE_ATTEMPTS' | 'UNUSUAL_PATTERN' | 'LARGE_LOAN_REQUEST', description: string, severity: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<void> {
    try {
      await supabase
        .from('fraud_alerts')
        .insert({
          user_id: userId,
          type,
          description,
          severity,
          resolved: false
        });

      await this.logSecurityEvent(userId, 'FRAUD_ALERT', `${severity} fraud alert: ${description}`);
    } catch (error) {
      console.error('Failed to create fraud alert:', error);
    }
  }

  // Failed Attempt Management
  async handleFailedAttempt(userId: string, attemptType: 'LOGIN' | 'PIN' | 'MFA'): Promise<{ shouldLock: boolean; attemptsLeft: number }> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('failed_attempts, failed_password_attempts, is_locked')
        .eq('id', userId)
        .single();

      if (!user) {
        return { shouldLock: false, attemptsLeft: 0 };
      }

      const maxAttempts = attemptType === 'LOGIN' ? 5 : 3;
      const currentAttempts = attemptType === 'LOGIN' ? user.failed_password_attempts : user.failed_attempts;
      const newAttempts = currentAttempts + 1;

      const updateData: any = {
        [`failed_${attemptType === 'LOGIN' ? 'password_' : ''}attempts`]: newAttempts
      };

      if (newAttempts >= maxAttempts) {
        updateData.is_locked = true;
        updateData.lock_reason = `Account locked due to ${maxAttempts} failed ${attemptType.toLowerCase()} attempts`;
        updateData.lock_date = new Date().toISOString();
      }

      await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      await this.logSecurityEvent(userId, 'FAILED_ATTEMPT', `Failed ${attemptType} attempt ${newAttempts}/${maxAttempts}`);

      return {
        shouldLock: newAttempts >= maxAttempts,
        attemptsLeft: Math.max(0, maxAttempts - newAttempts)
      };
    } catch (error) {
      console.error('Failed to handle failed attempt:', error);
      return { shouldLock: false, attemptsLeft: 0 };
    }
  }

  // Security Event Logging (using audit_logs table)
  async logSecurityEvent(userId: string, eventType: string, description: string, ipAddress?: string): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: eventType,
          details: description,
          ip_address: ipAddress,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Encryption utilities
  async encryptSensitiveData(data: string): Promise<string> {
    // In production, use proper encryption
    return btoa(data); // Simple base64 encoding for demo
  }

  async decryptSensitiveData(encryptedData: string): Promise<string> {
    // In production, use proper decryption
    return atob(encryptedData); // Simple base64 decoding for demo
  }

  // Card Number Masking
  maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) return cardNumber;
    return '**** **** **** ' + cardNumber.slice(-4);
  }

  // Biometric Authentication (mock implementation using localStorage)
  async setupBiometric(userId: string, biometricType: 'fingerprint' | 'face' | 'voice', biometricData: string): Promise<{ success: boolean; message: string }> {
    try {
      const encryptedBiometric = await this.encryptSensitiveData(biometricData);
      
      // Store in localStorage for demo purposes
      const biometricStore = JSON.parse(localStorage.getItem('biometric_data') || '{}');
      biometricStore[userId] = {
        [biometricType]: {
          hash: encryptedBiometric,
          enabled: true,
          created_at: new Date().toISOString()
        }
      };
      localStorage.setItem('biometric_data', JSON.stringify(biometricStore));

      await this.logSecurityEvent(userId, 'BIOMETRIC_SETUP', `${biometricType} authentication enabled`);
      
      return { success: true, message: `${biometricType} authentication setup successful` };
    } catch (error) {
      console.error('Biometric setup failed:', error);
      return { success: false, message: 'Biometric setup failed' };
    }
  }

  async verifyBiometric(userId: string, biometricType: 'fingerprint' | 'face' | 'voice', biometricData: string): Promise<{ success: boolean; message: string }> {
    try {
      const biometricStore = JSON.parse(localStorage.getItem('biometric_data') || '{}');
      const userBiometrics = biometricStore[userId];

      if (!userBiometrics || !userBiometrics[biometricType] || !userBiometrics[biometricType].enabled) {
        return { success: false, message: 'Biometric authentication not set up' };
      }

      const storedBiometric = await this.decryptSensitiveData(userBiometrics[biometricType].hash);
      
      // In production, use proper biometric matching algorithms
      if (storedBiometric === biometricData) {
        await this.logSecurityEvent(userId, 'BIOMETRIC_SUCCESS', `${biometricType} authentication successful`);
        return { success: true, message: 'Biometric verification successful' };
      } else {
        await this.logSecurityEvent(userId, 'BIOMETRIC_FAILED', `${biometricType} authentication failed`);
        return { success: false, message: 'Biometric verification failed' };
      }
    } catch (error) {
      console.error('Biometric verification failed:', error);
      return { success: false, message: 'Biometric verification failed' };
    }
  }

  // Device Fingerprinting (mock implementation)
  async createDeviceFingerprint(userId: string, deviceInfo: any): Promise<string> {
    const fingerprint = btoa(JSON.stringify(deviceInfo));
    
    try {
      // Store in localStorage for demo
      const deviceStore = JSON.parse(localStorage.getItem('device_fingerprints') || '{}');
      deviceStore[fingerprint] = {
        user_id: userId,
        user_agent: deviceInfo.userAgent,
        screen_resolution: deviceInfo.screenResolution,
        timezone: deviceInfo.timezone,
        language: deviceInfo.language,
        platform: deviceInfo.platform,
        is_trusted: false,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('device_fingerprints', JSON.stringify(deviceStore));

      return fingerprint;
    } catch (error) {
      console.error('Device fingerprint creation failed:', error);
      throw error;
    }
  }

  async validateDeviceFingerprint(userId: string, currentFingerprint: string): Promise<{ isTrusted: boolean; riskScore: number }> {
    try {
      const deviceStore = JSON.parse(localStorage.getItem('device_fingerprints') || '{}');
      const device = deviceStore[currentFingerprint];

      if (!device || device.user_id !== userId) {
        return { isTrusted: false, riskScore: 0.8 };
      }

      // Device is trusted if it's been used before and marked as trusted
      if (device.is_trusted) {
        return { isTrusted: true, riskScore: 0.1 };
      }

      // Calculate risk score based on device age
      const deviceAge = Date.now() - new Date(device.created_at).getTime();
      const daysSinceFirst = deviceAge / (1000 * 60 * 60 * 24);
      
      let riskScore = 0.5;
      if (daysSinceFirst > 7) riskScore = 0.3;
      if (daysSinceFirst > 30) riskScore = 0.2;

      return { isTrusted: daysSinceFirst > 7, riskScore };
    } catch (error) {
      console.error('Device fingerprint validation failed:', error);
      return { isTrusted: false, riskScore: 0.9 };
    }
  }

  // Behavioral Analysis (mock implementation)
  async recordBehavioralPattern(userId: string, pattern: any): Promise<void> {
    try {
      const behavioralStore = JSON.parse(localStorage.getItem('behavioral_patterns') || '{}');
      if (!behavioralStore[userId]) {
        behavioralStore[userId] = [];
      }
      
      behavioralStore[userId].push({
        ...pattern,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 patterns
      behavioralStore[userId] = behavioralStore[userId].slice(-50);
      localStorage.setItem('behavioral_patterns', JSON.stringify(behavioralStore));
    } catch (error) {
      console.error('Failed to record behavioral pattern:', error);
    }
  }

  async analyzeBehavioralAnomaly(userId: string, currentPattern: any): Promise<{ isAnomaly: boolean; confidence: number }> {
    try {
      const behavioralStore = JSON.parse(localStorage.getItem('behavioral_patterns') || '{}');
      const userPatterns = behavioralStore[userId] || [];
      
      if (userPatterns.length < 5) {
        return { isAnomaly: false, confidence: 0.1 };
      }
      
      // Simple anomaly detection based on typing pattern
      const avgTypingSpeed = userPatterns.reduce((sum: number, p: any) => sum + (p.typingPattern?.length || 0), 0) / userPatterns.length;
      const currentTypingSpeed = currentPattern.typingPattern?.length || 0;
      
      const deviation = Math.abs(currentTypingSpeed - avgTypingSpeed) / avgTypingSpeed;
      const isAnomaly = deviation > 0.5; // 50% deviation threshold
      
      return { isAnomaly, confidence: Math.min(deviation, 1.0) };
    } catch (error) {
      console.error('Behavioral anomaly analysis failed:', error);
      return { isAnomaly: false, confidence: 0 };
    }
  }

  // Geo-fencing (mock implementation)
  async setupGeoFencing(userId: string, allowedLocations: Array<{ lat: number; lng: number; radius: number }>): Promise<{ success: boolean; message: string }> {
    try {
      const geoStore = JSON.parse(localStorage.getItem('geo_fencing') || '{}');
      geoStore[userId] = {
        allowedLocations,
        enabled: true,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('geo_fencing', JSON.stringify(geoStore));
      
      await this.logSecurityEvent(userId, 'GEO_FENCING_SETUP', `Geo-fencing enabled with ${allowedLocations.length} locations`);
      return { success: true, message: 'Geo-fencing setup successful' };
    } catch (error) {
      console.error('Geo-fencing setup failed:', error);
      return { success: false, message: 'Geo-fencing setup failed' };
    }
  }

  async validateGeoLocation(userId: string, currentLocation: { lat: number; lng: number }): Promise<{ isAllowed: boolean; distance: number }> {
    try {
      const geoStore = JSON.parse(localStorage.getItem('geo_fencing') || '{}');
      const userGeoSettings = geoStore[userId];
      
      if (!userGeoSettings || !userGeoSettings.enabled) {
        return { isAllowed: true, distance: 0 };
      }
      
      let minDistance = Infinity;
      let isAllowed = false;
      
      for (const location of userGeoSettings.allowedLocations) {
        const distance = this.calculateDistance(currentLocation, location);
        minDistance = Math.min(minDistance, distance);
        
        if (distance <= location.radius) {
          isAllowed = true;
          break;
        }
      }
      
      return { isAllowed, distance: minDistance };
    } catch (error) {
      console.error('Geo-location validation failed:', error);
      return { isAllowed: false, distance: Infinity };
    }
  }

  // Time Restrictions (mock implementation)
  async setupTimeRestrictions(userId: string, restrictions: Array<{ day: number; startHour: number; endHour: number }>): Promise<{ success: boolean; message: string }> {
    try {
      const timeStore = JSON.parse(localStorage.getItem('time_restrictions') || '{}');
      timeStore[userId] = {
        restrictions,
        enabled: true,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('time_restrictions', JSON.stringify(timeStore));
      
      await this.logSecurityEvent(userId, 'TIME_RESTRICTIONS_SETUP', `Time restrictions enabled`);
      return { success: true, message: 'Time restrictions setup successful' };
    } catch (error) {
      console.error('Time restrictions setup failed:', error);
      return { success: false, message: 'Time restrictions setup failed' };
    }
  }

  async validateTimeRestrictions(userId: string): Promise<{ isAllowed: boolean; reason?: string }> {
    try {
      const timeStore = JSON.parse(localStorage.getItem('time_restrictions') || '{}');
      const userTimeSettings = timeStore[userId];
      
      if (!userTimeSettings || !userTimeSettings.enabled) {
        return { isAllowed: true };
      }
      
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      
      for (const restriction of userTimeSettings.restrictions) {
        if (restriction.day === currentDay) {
          if (currentHour >= restriction.startHour && currentHour < restriction.endHour) {
            return { isAllowed: true };
          }
        }
      }
      
      return { isAllowed: false, reason: 'Access denied: Outside allowed time window' };
    } catch (error) {
      console.error('Time restrictions validation failed:', error);
      return { isAllowed: false, reason: 'Time validation failed' };
    }
  }

  // Real-time Threat Detection (mock implementation)
  async detectRealTimeThreats(userId: string, action: string, context: any): Promise<{ threats: string[]; riskScore: number; recommendations: string[] }> {
    try {
      const threats: string[] = [];
      const recommendations: string[] = [];
      let riskScore = 0;
      
      // Check for suspicious patterns
      if (action === 'WITHDRAWAL' && context.amount > 100000) {
        threats.push('Large withdrawal amount');
        riskScore += 0.4;
        recommendations.push('Verify identity with additional authentication');
      }
      
      if (action === 'LOGIN' && context.deviceInfo?.platform !== 'Win32') {
        threats.push('Login from unusual device');
        riskScore += 0.2;
        recommendations.push('Monitor device for suspicious activity');
      }
      
      // Check behavioral patterns
      const behavioralStore = JSON.parse(localStorage.getItem('behavioral_patterns') || '{}');
      const userPatterns = behavioralStore[userId] || [];
      
      if (userPatterns.length > 0) {
        const recentActivity = userPatterns.slice(-5);
        const avgInterval = recentActivity.reduce((sum: number, p: any, i: number) => {
          if (i === 0) return sum;
          return sum + (new Date(p.timestamp).getTime() - new Date(recentActivity[i-1].timestamp).getTime());
        }, 0) / Math.max(recentActivity.length - 1, 1);
        
        if (avgInterval < 30000) { // Less than 30 seconds between actions
          threats.push('Rapid sequential actions detected');
          riskScore += 0.3;
          recommendations.push('Implement rate limiting');
        }
      }
      
      return { threats, riskScore: Math.min(riskScore, 1.0), recommendations };
    } catch (error) {
      console.error('Real-time threat detection failed:', error);
      return { threats: [], riskScore: 0, recommendations: [] };
    }
  }

  // Advanced Security Health Check
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
      // Get security metrics
      const { data: fraudAlerts } = await supabase
        .from('fraud_alerts')
        .select('severity')
        .eq('resolved', false);

      const { data: securityEvents } = await supabase
        .from('audit_logs')
        .select('action')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: activeSessions } = await supabase
        .from('atm_sessions')
        .select('session_id')
        .eq('is_active', true);

      const totalThreats = fraudAlerts?.length || 0;
      const securityEventsCount = securityEvents?.length || 0;
      const activeSessionsCount = activeSessions?.length || 0;

      // Calculate average risk score
      const highRiskAlerts = fraudAlerts?.filter(alert => alert.severity === 'HIGH').length || 0;
      const mediumRiskAlerts = fraudAlerts?.filter(alert => alert.severity === 'MEDIUM').length || 0;
      const averageRiskScore = totalThreats > 0 ? 
        ((highRiskAlerts * 0.9) + (mediumRiskAlerts * 0.6)) / totalThreats : 0;

      // Determine status and issues
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      const issues: string[] = [];
      const recommendations: string[] = [];

      if (highRiskAlerts > 0) {
        status = 'critical';
        issues.push(`${highRiskAlerts} high-risk fraud alerts detected`);
        recommendations.push('Review and resolve high-risk fraud alerts immediately');
      }

      if (mediumRiskAlerts > 3) {
        status = status === 'critical' ? 'critical' : 'warning';
        issues.push(`${mediumRiskAlerts} medium-risk fraud alerts detected`);
        recommendations.push('Investigate medium-risk fraud alerts');
      }

      if (securityEventsCount > 100) {
        status = status === 'critical' ? 'critical' : 'warning';
        issues.push('High number of security events in the last 24 hours');
        recommendations.push('Review security event logs for patterns');
      }

      if (activeSessionsCount > 50) {
        status = status === 'critical' ? 'critical' : 'warning';
        issues.push('High number of active sessions');
        recommendations.push('Monitor active sessions for anomalies');
      }

      return {
        status,
        issues,
        recommendations,
        metrics: {
          totalThreats,
          averageRiskScore,
          securityEvents: securityEventsCount,
          activeSessions: activeSessionsCount
        }
      };
    } catch (error) {
      console.error('Security health check failed:', error);
      return {
        status: 'critical',
        issues: ['Security health check failed'],
        recommendations: ['Check system connectivity and database access'],
        metrics: {
          totalThreats: 0,
          averageRiskScore: 0,
          securityEvents: 0,
          activeSessions: 0
        }
      };
    }
  }

  // Calculate distance between two coordinates (for geo-fencing)
  private calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLng = this.deg2rad(coord2.lng - coord1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const securityService = new SecurityService();
