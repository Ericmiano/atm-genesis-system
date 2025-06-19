
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { translations } from '../utils/translations';
import { supabaseATMService } from '../services/supabaseATMService';
import { ArrowLeft, PiggyBank, Banknote } from 'lucide-react';

interface DepositScreenProps {
  onBack: () => void;
}

const DepositScreen: React.FC<DepositScreenProps> = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { language, currentUser, refreshUser } = useSupabaseATM();
  const t = translations[language];

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

  const handleDeposit = async (depositAmount: number) => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await supabaseATMService.deposit(depositAmount);
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

  const handleCustomDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setMessage('Please enter a valid amount');
      setSuccess(false);
      return;
    }
    
    await handleDeposit(depositAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl animate-scale-in">
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
                <PiggyBank className="w-6 h-6 text-emerald-600" />
                <CardTitle className="text-xl">{t.cashDeposit}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700">
                <Banknote className="w-5 h-5" />
                <span className="text-sm font-medium">Current Balance: KES {currentUser?.balance.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t.quickAmounts}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    onClick={() => handleDeposit(quickAmount)}
                    disabled={loading}
                    className="h-16 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:scale-105 transform"
                  >
                    KES {quickAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">{t.customAmount}</h3>
              <form onSubmit={handleCustomDeposit} className="space-y-4">
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
                    className="text-lg transition-all duration-200 focus:scale-105"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !amount}
                  className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:scale-105 transform"
                >
                  {loading ? t.processing : t.deposit}
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

export default DepositScreen;
