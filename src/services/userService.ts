
import { supabase } from '@/integrations/supabase/client';
import { User } from '../types/atm';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(u => ({
        id: u.id,
        accountNumber: u.account_number,
        username: u.username,
        password: '', // Don't expose password
        name: u.name,
        email: u.email,
        pin: u.pin,
        balance: parseFloat(u.balance.toString()),
        role: u.role as 'USER' | 'ADMIN',
        isLocked: u.is_locked,
        lockReason: u.lock_reason,
        lockDate: u.lock_date,
        failedAttempts: u.failed_attempts,
        failedPasswordAttempts: u.failed_password_attempts,
        lastPasswordAttempt: u.last_password_attempt,
        createdAt: u.created_at,
        lastLogin: u.last_login,
        creditScore: u.credit_score,
        monthlyIncome: u.monthly_income ? parseFloat(u.monthly_income.toString()) : undefined,
        cardNumber: u.card_number,
        expiryDate: u.expiry_date,
        cvv: u.cvv,
        cardType: u.card_type as 'VISA' | 'MASTERCARD',
        passwordLastChanged: u.password_last_changed,
        mustChangePassword: u.must_change_password
      }));
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }
}

export const userService = new UserService();
