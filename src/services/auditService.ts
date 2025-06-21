
import { supabase } from '@/integrations/supabase/client';
import { authService } from './authService';

export class AuditService {
  async logAuditTrail(action: string, details: string): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action,
          details
        });
    } catch (error) {
      console.error('Log audit trail error:', error);
    }
  }
}

export const auditService = new AuditService();
