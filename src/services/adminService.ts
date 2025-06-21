
import { supabase } from '@/integrations/supabase/client';

export class AdminService {
  async createUser(email: string, password: string, name: string, initialBalance: number = 0): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      const { data, error } = await supabase.rpc('create_user_account', {
        user_email: email,
        user_password: password,
        user_name: name,
        initial_balance: initialBalance
      });

      if (error) {
        console.error('Create user error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'User created successfully', userId: data };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, message: 'Failed to create user' };
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('delete_user_account', {
        target_user_id: userId
      });

      if (error) {
        console.error('Delete user error:', error);
        return { success: false, message: error.message };
      }

      if (!data) {
        return { success: false, message: 'Failed to delete user account' };
      }

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, message: 'Failed to delete user' };
    }
  }
}

export const adminService = new AdminService();
