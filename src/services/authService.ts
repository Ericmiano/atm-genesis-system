
import { supabase } from '@/integrations/supabase/client';
import { User } from '../types/atm';

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
      cardNumber: data.card_number,
      expiryDate: data.expiry_date,
      cvv: data.cvv,
      cardType: data.card_type as 'VISA' | 'MASTERCARD',
      passwordLastChanged: data.password_last_changed,
      mustChangePassword: data.must_change_password
    };
  }

  async authenticate(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Check if account is locked
        const { data: userData } = await supabase
          .from('users')
          .select('is_locked, lock_reason, failed_password_attempts')
          .eq('email', email)
          .single();

        if (userData?.is_locked) {
          return { success: false, message: userData.lock_reason || 'Account is locked' };
        }

        // Increment failed attempts
        if (userData) {
          await supabase
            .from('users')
            .update({ 
              failed_password_attempts: userData.failed_password_attempts + 1,
              last_password_attempt: new Date().toISOString()
            })
            .eq('email', email);
        }

        return { success: false, message: 'Invalid credentials' };
      }

      if (data.user) {
        // Update last login and reset failed attempts
        await supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            failed_password_attempts: 0
          })
          .eq('id', data.user.id);

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

      if (user.pin === pin) {
        return { success: true, message: 'PIN verified' };
      } else {
        // Increment failed PIN attempts
        await supabase
          .from('users')
          .update({ failed_attempts: user.failedAttempts + 1 })
          .eq('id', user.id);

        return { success: false, message: 'Invalid PIN' };
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }
}

export const authService = new AuthService();
