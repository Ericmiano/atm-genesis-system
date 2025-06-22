
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { securityService } from '../services/securityService';
import { useSupabaseATM } from './SupabaseATMContext';

interface SecurityContextType {
  sessionId: string | null;
  isSessionValid: boolean;
  fraudAlert: { isSuspicious: boolean; reason?: string } | null;
  checkFraudulentActivity: (transactionType: string, amount: number) => Promise<void>;
  createSecureSession: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  terminateSession: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [fraudAlert, setFraudAlert] = useState<{ isSuspicious: boolean; reason?: string } | null>(null);
  const { currentUser } = useSupabaseATM();

  const createSecureSession = async () => {
    if (currentUser) {
      try {
        const session = await securityService.createSecureSession(currentUser.id);
        setSessionId(session.sessionId);
        setIsSessionValid(true);
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

  return (
    <SecurityContext.Provider value={{
      sessionId,
      isSessionValid,
      fraudAlert,
      checkFraudulentActivity,
      createSecureSession,
      validateSession,
      terminateSession
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
