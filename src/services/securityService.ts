
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

      // Log MFA setup
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

  async createFraudAlert(userId: string, type: string, description: string, severity: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<void> {
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

  // Security Event Logging
  async logSecurityEvent(userId: string, eventType: string, description: string, ipAddress?: string): Promise<void> {
    try {
      await supabase
        .from('security_events')
        .insert({
          user_id: userId,
          event_type: eventType,
          description,
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

  // Biometric Authentication
  async setupBiometric(userId: string, biometricType: 'fingerprint' | 'face' | 'voice', biometricData: string): Promise<{ success: boolean; message: string }> {
    try {
      const encryptedBiometric = await this.encryptSensitiveData(biometricData);
      
      await supabase
        .from('biometric_data')
        .upsert({
          user_id: userId,
          biometric_type: biometricType,
          biometric_hash: encryptedBiometric,
          is_enabled: true
        });

      await this.logSecurityEvent(userId, 'BIOMETRIC_SETUP', `${biometricType} authentication enabled`);
      
      return { success: true, message: `${biometricType} authentication setup successful` };
    } catch (error) {
      console.error('Biometric setup failed:', error);
      return { success: false, message: 'Biometric setup failed' };
    }
  }

  async verifyBiometric(userId: string, biometricType: 'fingerprint' | 'face' | 'voice', biometricData: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: biometric } = await supabase
        .from('biometric_data')
        .select('biometric_hash')
        .eq('user_id', userId)
        .eq('biometric_type', biometricType)
        .eq('is_enabled', true)
        .single();

      if (!biometric) {
        return { success: false, message: 'Biometric authentication not set up' };
      }

      const storedBiometric = await this.decryptSensitiveData(biometric.biometric_hash);
      
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

  // Device Fingerprinting
  async createDeviceFingerprint(userId: string, deviceInfo: any): Promise<string> {
    const fingerprint = btoa(JSON.stringify(deviceInfo));
    
    try {
      await supabase
        .from('device_fingerprints')
        .upsert({
          user_id: userId,
          fingerprint,
          user_agent: deviceInfo.userAgent,
          screen_resolution: deviceInfo.screenResolution,
          timezone: deviceInfo.timezone,
          language: deviceInfo.language,
          platform: deviceInfo.platform,
          is_trusted: false
        });

      return fingerprint;
    } catch (error) {
      console.error('Device fingerprint creation failed:', error);
      throw error;
    }
  }

  async validateDeviceFingerprint(userId: string, currentFingerprint: string): Promise<{ isTrusted: boolean; riskScore: number }> {
    try {
      const { data: device } = await supabase
        .from('device_fingerprints')
        .select('is_trusted, created_at')
        .eq('user_id', userId)
        .eq('fingerprint', currentFingerprint)
        .single();

      if (!device) {
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
        .from('security_events')
        .select('event_type')
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

  // Behavioral Analysis
  async recordBehavioralPattern(userId: string, pattern: {
    typingPattern: number[];
    mousePattern: number[];
    sessionDuration: number;
    actionsPerMinute: number;
  }): Promise<void> {
    try {
      await supabase
        .from('behavioral_patterns')
        .upsert({
          user_id: userId,
          typing_pattern: pattern.typingPattern,
          mouse_pattern: pattern.mousePattern,
          session_duration: pattern.sessionDuration,
          actions_per_minute: pattern.actionsPerMinute,
          last_updated: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to record behavioral pattern:', error);
    }
  }

  async analyzeBehavioralAnomaly(userId: string, currentPattern: any): Promise<{ isAnomaly: boolean; confidence: number }> {
    try {
      const { data: storedPattern } = await supabase
        .from('behavioral_patterns')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!storedPattern) {
        return { isAnomaly: false, confidence: 0 };
      }

      // Simple anomaly detection based on session duration and actions per minute
      const durationDiff = Math.abs(currentPattern.sessionDuration - storedPattern.session_duration);
      const actionsDiff = Math.abs(currentPattern.actionsPerMinute - storedPattern.actions_per_minute);

      const durationThreshold = storedPattern.session_duration * 0.5;
      const actionsThreshold = storedPattern.actions_per_minute * 0.5;

      const isAnomaly = durationDiff > durationThreshold || actionsDiff > actionsThreshold;
      const confidence = Math.min((durationDiff / durationThreshold + actionsDiff / actionsThreshold) / 2, 1);

      if (isAnomaly) {
        await this.logSecurityEvent(userId, 'BEHAVIORAL_ANOMALY', `Behavioral anomaly detected with confidence: ${confidence.toFixed(2)}`);
      }

      return { isAnomaly, confidence };
    } catch (error) {
      console.error('Behavioral analysis failed:', error);
      return { isAnomaly: false, confidence: 0 };
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
          updated_at: new Date().toISOString()
        });

      await this.logSecurityEvent(userId, 'GEO_FENCING_SETUP', `Geo-fencing enabled with ${allowedLocations.length} locations`);
      
      return { success: true, message: 'Geo-fencing setup successful' };
    } catch (error) {
      console.error('Geo-fencing setup failed:', error);
      return { success: false, message: 'Geo-fencing setup failed' };
    }
  }

  async validateGeoLocation(userId: string, currentLocation: { lat: number; lng: number }): Promise<{ isAllowed: boolean; distance: number }> {
    try {
      const { data: geoFencing } = await supabase
        .from('geo_fencing')
        .select('allowed_locations, is_enabled')
        .eq('user_id', userId)
        .single();

      if (!geoFencing || !geoFencing.is_enabled) {
        return { isAllowed: true, distance: 0 };
      }

      const allowedLocations = geoFencing.allowed_locations as Array<{ lat: number; lng: number; radius: number }>;
      
      for (const location of allowedLocations) {
        const distance = this.calculateDistance(currentLocation, location);
        if (distance <= location.radius) {
          return { isAllowed: true, distance };
        }
      }

      // Find minimum distance to any allowed location
      const minDistance = Math.min(...allowedLocations.map(loc => 
        this.calculateDistance(currentLocation, loc)
      ));

      await this.logSecurityEvent(userId, 'GEO_VIOLATION', `Location access from unauthorized area. Distance: ${minDistance.toFixed(2)}km`);
      
      return { isAllowed: false, distance: minDistance };
    } catch (error) {
      console.error('Geo-location validation failed:', error);
      return { isAllowed: true, distance: 0 };
    }
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Time Restrictions
  async setupTimeRestrictions(userId: string, restrictions: Array<{ day: number; startHour: number; endHour: number }>): Promise<{ success: boolean; message: string }> {
    try {
      await supabase
        .from('time_restrictions')
        .upsert({
          user_id: userId,
          restrictions: restrictions,
          is_enabled: true,
          updated_at: new Date().toISOString()
        });

      await this.logSecurityEvent(userId, 'TIME_RESTRICTIONS_SETUP', `Time restrictions enabled with ${restrictions.length} rules`);
      
      return { success: true, message: 'Time restrictions setup successful' };
    } catch (error) {
      console.error('Time restrictions setup failed:', error);
      return { success: false, message: 'Time restrictions setup failed' };
    }
  }

  async validateTimeRestrictions(userId: string): Promise<{ isAllowed: boolean; reason?: string }> {
    try {
      const { data: timeRestrictions } = await supabase
        .from('time_restrictions')
        .select('restrictions, is_enabled')
        .eq('user_id', userId)
        .single();

      if (!timeRestrictions || !timeRestrictions.is_enabled) {
        return { isAllowed: true };
      }

      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
      const currentHour = now.getHours();

      const restrictions = timeRestrictions.restrictions as Array<{ day: number; startHour: number; endHour: number }>;
      
      for (const restriction of restrictions) {
        if (restriction.day === currentDay) {
          if (currentHour >= restriction.startHour && currentHour <= restriction.endHour) {
            return { isAllowed: true };
          }
        }
      }

      await this.logSecurityEvent(userId, 'TIME_RESTRICTION_VIOLATION', `Access attempt outside allowed hours`);
      
      return { 
        isAllowed: false, 
        reason: `Access not allowed at this time. Current time: ${currentHour}:00` 
      };
    } catch (error) {
      console.error('Time restrictions validation failed:', error);
      return { isAllowed: true };
    }
  }

  // Real-time Threat Detection
  async detectRealTimeThreats(userId: string, action: string, context: any): Promise<{ threats: string[]; riskScore: number; recommendations: string[] }> {
    const threats: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;

    try {
      // Check for rapid successive actions
      if (context.rapidActions && context.rapidActions > 10) {
        threats.push('Rapid successive actions detected');
        recommendations.push('Implement rate limiting');
        riskScore += 0.3;
      }

      // Check for unusual IP address
      if (context.ipAddress && context.ipAddress !== context.lastKnownIp) {
        threats.push('Access from new IP address');
        recommendations.push('Verify user identity');
        riskScore += 0.2;
      }

      // Check for unusual user agent
      if (context.userAgent && context.userAgent !== context.lastKnownUserAgent) {
        threats.push('Access from new device/browser');
        recommendations.push('Device verification required');
        riskScore += 0.2;
      }

      // Check for suspicious transaction patterns
      if (action === 'TRANSACTION' && context.amount > context.averageTransaction * 3) {
        threats.push('Transaction amount significantly higher than usual');
        recommendations.push('Additional verification required');
        riskScore += 0.4;
      }

      // Cap risk score at 1.0
      riskScore = Math.min(riskScore, 1.0);

      // Log threats if any detected
      if (threats.length > 0) {
        await this.logSecurityEvent(userId, 'REAL_TIME_THREAT', `Threats detected: ${threats.join(', ')}. Risk score: ${riskScore}`);
      }

      return { threats, riskScore, recommendations };
    } catch (error) {
      console.error('Real-time threat detection failed:', error);
      return { threats: [], riskScore: 0, recommendations: [] };
    }
  }

  // Card number masking utility
  maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 16) return cardNumber;
    return cardNumber.slice(0, 4) + '****' + '****' + cardNumber.slice(-4);
  }
}

export const securityService = new SecurityService();
