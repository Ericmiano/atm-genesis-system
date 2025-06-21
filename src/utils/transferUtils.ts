import { supabaseATMService } from '../services/supabaseATMService';

export async function handleQuickTransfer(
  recipientAccount: string, 
  amount: number, 
  setMessage: (msg: string) => void, 
  setSuccess: (s: boolean) => void, 
  setLoading: (l: boolean) => void, 
  refreshUser: () => Promise<void>
) {
  if (!recipientAccount.trim()) {
    setMessage('Please enter recipient account number');
    setSuccess(false);
    return;
  }
  setLoading(true);
  setMessage('');
  try {
    const result = await supabaseATMService.transfer(recipientAccount, amount);
    setMessage(result.message);
    setSuccess(result.success);
    if (result.success) {
      await refreshUser();
    }
  } catch (error) {
    setMessage('An unexpected error occurred');
    setSuccess(false);
  } finally {
    setLoading(false);
  }
} 