import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { securityService } from '../services/securityService';
import { useSupabaseATM } from './SupabaseATMContext';

interface SecurityContextType {
  sessionId: string | null;
  isSessionValid: boolean;
  fraudAlert: { isSuspicious: boolean; reason?: string } | null;
  securityHealth: {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    metrics: {
      totalThreats: number;
      averageRiskScore: number;
      securityEvents: number;
      activeSessions: number;
    };
  } | null;
  biometricStatus: {
    isEnabled: boolean;
    methods: string[];
  };
  deviceStatus: {
    isTrusted: boolean;
    riskScore: number;
    fingerprint: string | null;
  };
  behavioralStatus: {
    isAnalyzing: boolean;
    anomalyDetected: boolean;
    confidence: number;
  };
  geoFencingStatus: {
    isEnabled: boolean;
    isAllowed: boolean;
    distance: number;
  };
  timeRestrictionsStatus: {
    isEnabled: boolean;
    isAllowed: boolean;
    reason?: string;
  };
  realTimeThreats: {
    threats: string[];
    riskScore: number;
    recommendations: string[];
  } | null;
  
  // Core security functions
  checkFraudulentActivity: (transactionType: string, amount: number) => Promise<void>;
  createSecureSession: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  terminateSession: () => Promise<void>;
  
  // Biometric functions
  setupBiometric: (biometricType: 'fingerprint' | 'face' | 'voice', biometricData: string) => Promise<{ success: boolean; message: string }>;
  verifyBiometric: (biometricType: 'fingerprint' | 'face' | 'voice', biometricData: string) => Promise<{ success: boolean; message: string }>;
  
  // Device fingerprinting functions
  createDeviceFingerprint: (deviceInfo: any) => Promise<string>;
  validateDeviceFingerprint: (currentFingerprint: string) => Promise<{ isTrusted: boolean; riskScore: number }>;
  
  // Behavioral analysis functions
  recordBehavioralPattern: (pattern: any) => Promise<void>;
  analyzeBehavioralAnomaly: (currentPattern: any) => Promise<{ isAnomaly: boolean; confidence: number }>;
  
  // Geo-fencing functions
  setupGeoFencing: (allowedLocations: Array<{ lat: number; lng: number; radius: number }>) => Promise<{ success: boolean; message: string }>;
  validateGeoLocation: (currentLocation: { lat: number; lng: number }) => Promise<{ isAllowed: boolean; distance: number }>;
  
  // Time restrictions functions
  setupTimeRestrictions: (restrictions: Array<{ day: number; startHour: number; endHour: number }>) => Promise<{ success: boolean; message: string }>;
  validateTimeRestrictions: () => Promise<{ isAllowed: boolean; reason?: string }>;
  
  // Real-time threat detection
  detectRealTimeThreats: (action: string, context: any) => Promise<{ threats: string[]; riskScore: number; recommendations: string[] }>;
  
  // Security health check
  performSecurityHealthCheck: () => Promise<void>;
  
  // Utility functions
  getDeviceInfo: () => any;
  getCurrentLocation: () => Promise<{ lat: number; lng: number } | null>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [fraudAlert, setFraudAlert] = useState<{ isSuspicious: boolean; reason?: string } | null>(null);
  const [securityHealth, setSecurityHealth] = useState<SecurityContextType['securityHealth']>(null);
  const [biometricStatus, setBiometricStatus] = useState<SecurityContextType['biometricStatus']>({
    isEnabled: false,
    methods: []
  });
  const [deviceStatus, setDeviceStatus] = useState<SecurityContextType['deviceStatus']>({
    isTrusted: false,
    riskScore: 0,
    fingerprint: null
  });
  const [behavioralStatus, setBehavioralStatus] = useState<SecurityContextType['behavioralStatus']>({
    isAnalyzing: false,
    anomalyDetected: false,
    confidence: 0
  });
  const [geoFencingStatus, setGeoFencingStatus] = useState<SecurityContextType['geoFencingStatus']>({
    isEnabled: false,
    isAllowed: true,
    distance: 0
  });
  const [timeRestrictionsStatus, setTimeRestrictionsStatus] = useState<SecurityContextType['timeRestrictionsStatus']>({
    isEnabled: false,
    isAllowed: true
  });
  const [realTimeThreats, setRealTimeThreats] = useState<SecurityContextType['realTimeThreats']>(null);
  
  const { currentUser } = useSupabaseATM();

  // Core security functions
  const createSecureSession = async () => {
    if (currentUser) {
      try {
        const session = await securityService.createSecureSession(currentUser.id);
        setSessionId(session.sessionId);
        setIsSessionValid(true);
        
        // Initialize device fingerprinting
        const deviceInfo = getDeviceInfo();
        const fingerprint = await securityService.createDeviceFingerprint(currentUser.id, deviceInfo);
        const deviceValidation = await securityService.validateDeviceFingerprint(currentUser.id, fingerprint);
        
        setDeviceStatus({
          isTrusted: deviceValidation.isTrusted,
          riskScore: deviceValidation.riskScore,
          fingerprint
        });
        
        // Validate geo-location if available
        const location = await getCurrentLocation();
        if (location) {
          const geoValidation = await securityService.validateGeoLocation(currentUser.id, location);
          setGeoFencingStatus({
            isEnabled: geoValidation.distance !== 0,
            isAllowed: geoValidation.isAllowed,
            distance: geoValidation.distance
          });
        }
        
        // Validate time restrictions
        const timeValidation = await securityService.validateTimeRestrictions(currentUser.id);
        setTimeRestrictionsStatus({
          isEnabled: !timeValidation.isAllowed,
          isAllowed: timeValidation.isAllowed,
          reason: timeValidation.reason
        });
        
      } catch (error) {
        console.error('Failed to create secure session:', error);
      }
    }
  };

  const validateSession = async () => {
    if (sessionId) {
      const result = await securityService.validateSession(sessionId);
      setIsSessionValid(result.isValid);
      return result.isValid;
    }
    return false;
  };

  const terminateSession = async () => {
    if (sessionId) {
      await securityService.terminateSession(sessionId);
      setSessionId(null);
      setIsSessionValid(false);
    }
  };

  const checkFraudulentActivity = async (transactionType: string, amount: number) => {
    if (currentUser) {
      const result = await securityService.detectFraudulentActivity(currentUser.id, transactionType, amount);
      setFraudAlert(result);
    }
  };

  // Biometric functions
  const setupBiometric = async (biometricType: 'fingerprint' | 'face' | 'voice', biometricData: string) => {
    if (currentUser) {
      const result = await securityService.setupBiometric(currentUser.id, biometricType, biometricData);
      if (result.success) {
        setBiometricStatus(prev => ({
          ...prev,
          isEnabled: true,
          methods: [...prev.methods, biometricType]
        }));
      }
      return result;
    }
    return { success: false, message: 'User not authenticated' };
  };

  const verifyBiometric = async (biometricType: 'fingerprint' | 'face' | 'voice', biometricData: string) => {
    if (currentUser) {
      return await securityService.verifyBiometric(currentUser.id, biometricType, biometricData);
    }
    return { success: false, message: 'User not authenticated' };
  };

  // Device fingerprinting functions
  const createDeviceFingerprint = async (deviceInfo: any) => {
    if (currentUser) {
      return await securityService.createDeviceFingerprint(currentUser.id, deviceInfo);
    }
    throw new Error('User not authenticated');
  };

  const validateDeviceFingerprint = async (currentFingerprint: string) => {
    if (currentUser) {
      return await securityService.validateDeviceFingerprint(currentUser.id, currentFingerprint);
    }
    return { isTrusted: false, riskScore: 1.0 };
  };

  // Behavioral analysis functions
  const recordBehavioralPattern = async (pattern: any) => {
    if (currentUser) {
      await securityService.recordBehavioralPattern(currentUser.id, pattern);
    }
  };

  const analyzeBehavioralAnomaly = async (currentPattern: any) => {
    if (currentUser) {
      const result = await securityService.analyzeBehavioralAnomaly(currentUser.id, currentPattern);
      setBehavioralStatus({
        isAnalyzing: false,
        anomalyDetected: result.isAnomaly,
        confidence: result.confidence
      });
      return result;
    }
    return { isAnomaly: false, confidence: 0 };
  };

  // Geo-fencing functions
  const setupGeoFencing = async (allowedLocations: Array<{ lat: number; lng: number; radius: number }>) => {
    if (currentUser) {
      const result = await securityService.setupGeoFencing(currentUser.id, allowedLocations);
      if (result.success) {
        setGeoFencingStatus(prev => ({ ...prev, isEnabled: true }));
      }
      return result;
    }
    return { success: false, message: 'User not authenticated' };
  };

  const validateGeoLocation = async (currentLocation: { lat: number; lng: number }) => {
    if (currentUser) {
      return await securityService.validateGeoLocation(currentUser.id, currentLocation);
    }
    return { isAllowed: false, distance: Infinity };
  };

  // Time restrictions functions
  const setupTimeRestrictions = async (restrictions: Array<{ day: number; startHour: number; endHour: number }>) => {
    if (currentUser) {
      const result = await securityService.setupTimeRestrictions(currentUser.id, restrictions);
      if (result.success) {
        setTimeRestrictionsStatus(prev => ({ ...prev, isEnabled: true }));
      }
      return result;
    }
    return { success: false, message: 'User not authenticated' };
  };

  const validateTimeRestrictions = async () => {
    if (currentUser) {
      return await securityService.validateTimeRestrictions(currentUser.id);
    }
    return { isAllowed: false, reason: 'User not authenticated' };
  };

  // Real-time threat detection
  const detectRealTimeThreats = async (action: string, context: any) => {
    if (currentUser) {
      const result = await securityService.detectRealTimeThreats(currentUser.id, action, context);
      setRealTimeThreats(result);
      return result;
    }
    return { threats: [], riskScore: 0, recommendations: [] };
  };

  // Security health check
  const performSecurityHealthCheck = async () => {
    try {
      const health = await securityService.performAdvancedSecurityHealthCheck();
      setSecurityHealth(health);
    } catch (error) {
      console.error('Security health check failed:', error);
    }
  };

  // Utility functions
  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform
    };
  };

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        
        return {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
    return null;
  };

  // Behavioral analysis monitoring
  useEffect(() => {
    if (currentUser && isSessionValid) {
      setBehavioralStatus(prev => ({ ...prev, isAnalyzing: true }));
      
      // Record initial behavioral pattern
      const initialPattern = {
        sessionDuration: 0,
        actionsPerMinute: 0,
        typingPattern: [],
        mousePattern: []
      };
      
      recordBehavioralPattern(initialPattern);
      
      // Set up periodic behavioral analysis
      const interval = setInterval(async () => {
        const currentPattern = {
          sessionDuration: Date.now() - (sessionId ? parseInt(sessionId) : Date.now()),
          actionsPerMinute: Math.random() * 10 + 5, // Simulated data
          typingPattern: Array.from({ length: 10 }, () => Math.random() * 100),
          mousePattern: Array.from({ length: 20 }, () => Math.random() * 100)
        };
        
        await recordBehavioralPattern(currentPattern);
        await analyzeBehavioralAnomaly(currentPattern);
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [currentUser, isSessionValid, sessionId]);

  // Validate session periodically
  useEffect(() => {
    if (sessionId) {
      const interval = setInterval(validateSession, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  // Create session when user logs in
  useEffect(() => {
    if (currentUser && !sessionId) {
      createSecureSession();
    }
  }, [currentUser]);

  // Perform initial security health check
  useEffect(() => {
    if (currentUser) {
      performSecurityHealthCheck();
    }
  }, [currentUser]);

  return (
    <SecurityContext.Provider value={{
      sessionId,
      isSessionValid,
      fraudAlert,
      securityHealth,
      biometricStatus,
      deviceStatus,
      behavioralStatus,
      geoFencingStatus,
      timeRestrictionsStatus,
      realTimeThreats,
      checkFraudulentActivity,
      createSecureSession,
      validateSession,
      terminateSession,
      setupBiometric,
      verifyBiometric,
      createDeviceFingerprint,
      validateDeviceFingerprint,
      recordBehavioralPattern,
      analyzeBehavioralAnomaly,
      setupGeoFencing,
      validateGeoLocation,
      setupTimeRestrictions,
      validateTimeRestrictions,
      detectRealTimeThreats,
      performSecurityHealthCheck,
      getDeviceInfo,
      getCurrentLocation
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
