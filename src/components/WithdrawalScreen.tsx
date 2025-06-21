import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { translations } from '../utils/translations';
import { supabaseATMService } from '../services/supabaseATMService';
import { ArrowLeft, DollarSign, Banknote } from 'lucide-react';

interface WithdrawalScreenProps {
  onBack: () => void;
}

const WithdrawalScreen: React.FC<WithdrawalScreenProps> = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { language, currentUser, refreshUser } = useSupabaseATM();
  const t = translations[language];

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

  const handleWithdrawal = async (withdrawAmount: number) => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await supabaseATMService.withdraw(withdrawAmount);
      setMessage(result.message);
      setSuccess(result.success);
      
      if (result.success) {
        await refreshUser();
        setAmount('');
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setMessage('Please enter a valid amount');
      setSuccess(false);
      return;
    }
    
    await handleWithdrawal(withdrawAmount);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl animate-scale-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </Button>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-red-600" />
                <CardTitle className="text-xl dark:text-white">{t.cashWithdrawal}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-200">
                <Banknote className="w-5 h-5" />
                <span className="text-sm font-medium">Available Balance: KES {currentUser?.balance.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 dark:text-white">{t.quickAmounts}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    onClick={() => handleWithdrawal(quickAmount)}
                    disabled={loading}
                    className="h-16 text-lg font-semibold bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105 transform"
                  >
                    KES {quickAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">{t.customAmount}</h3>
              <form onSubmit={handleCustomWithdrawal} className="space-y-4">
                <div>
                  <Label htmlFor="amount">{t.enterAmount}</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="text-lg transition-all duration-200 focus:scale-105 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !amount}
                  className="w-full text-lg py-6 bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105 transform"
                >
                  {loading ? t.processing : t.withdraw}
                </Button>
              </form>
            </div>

            {message && (
              <Alert variant={success ? "default" : "destructive"} className="animate-slide-in-right">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WithdrawalScreen;
