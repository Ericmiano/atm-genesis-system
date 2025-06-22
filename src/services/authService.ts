
import { supabase } from '@/integrations/supabase/client';
import { User } from '../types/atm';
import { securityService } from './securityService';

export class AuthService {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      accountNumber: data.account_number,
      username: data.username,
      password: '', // Don't expose password
      name: data.name,
      email: data.email,
      pin: data.pin,
      balance: parseFloat(data.balance.toString()),
      role: data.role as 'USER' | 'ADMIN',
      isLocked: data.is_locked,
      lockReason: data.lock_reason,
      lockDate: data.lock_date,
      failedAttempts: data.failed_attempts,
      failedPasswordAttempts: data.failed_password_attempts,
      lastPasswordAttempt: data.last_password_attempt,
      createdAt: data.created_at,
      lastLogin: data.last_login,
      creditScore: data.credit_score,
      monthlyIncome: data.monthly_income ? parseFloat(data.monthly_income.toString()) : undefined,
      cardNumber: securityService.maskCardNumber(data.card_number),
      expiryDate: data.expiry_date,
      cvv: data.cvv,
      cardType: data.card_type as 'VISA' | 'MASTERCARD',
      passwordLastChanged: data.password_last_changed,
      mustChangePassword: data.must_change_password
    };
  }

  async authenticate(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // First check if user exists and is not locked
      const { data: userData } = await supabase
        .from('users')
        .select('id, is_locked, lock_reason, failed_password_attempts')
        .eq('email', email)
        .single();

      if (userData?.is_locked) {
        await securityService.handleFailedAttempt(userData.id, 'LOGIN');
        return { success: false, message: userData.lock_reason || 'Account is locked' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (userData) {
          const { shouldLock, attemptsLeft } = await securityService.handleFailedAttempt(userData.id, 'LOGIN');
          if (shouldLock) {
            return { success: false, message: 'Account locked due to multiple failed attempts' };
          }
          return { success: false, message: `Invalid credentials. ${attemptsLeft} attempts remaining.` };
        }
        return { success: false, message: 'Invalid credentials' };
      }

      if (data.user) {
        // Reset failed attempts on successful login
        await supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            failed_password_attempts: 0
          })
          .eq('id', data.user.id);

        // Create secure session
        await securityService.createSecureSession(data.user.id);

        const user = await this.getCurrentUser();
        if (user) {
          return { success: true, message: 'Login successful', user };
        }
      }

      return { success: false, message: 'Authentication failed' };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  }

  async verifyPin(pin: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (user.isLocked) {
        return { success: false, message: user.lockReason || 'Account is locked' };
      }

      // Get actual PIN from database (not masked)
      const { data: userData } = await supabase
        .from('users')
        .select('pin, account_number')
        .eq('id', user.id)
        .single();

      if (!userData) {
        return { success: false, message: 'User data not found' };
      }

      // Perform MFA verification
      const mfaResult = await securityService.verifyMFA(user.id, userData.account_number, pin);
      
      if (mfaResult.success) {
        // Reset failed PIN attempts
        await supabase
          .from('users')
          .update({ failed_attempts: 0 })
          .eq('id', user.id);

        return { success: true, message: 'PIN verified successfully' };
      } else {
        const { shouldLock, attemptsLeft } = await securityService.handleFailedAttempt(user.id, 'PIN');
        if (shouldLock) {
          return { success: false, message: 'Account locked due to multiple failed PIN attempts' };
        }
        return { success: false, message: `Invalid PIN. ${attemptsLeft} attempts remaining.` };
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      return { success: false, message: 'PIN verification failed' };
    }
  }

  async logout(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Terminate all active sessions for the user
      await supabase
        .from('atm_sessions')
        .update({
          is_active: false,
          end_time: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);
    }
    
    await supabase.auth.signOut();
  }
}

export const authService = new AuthService();
