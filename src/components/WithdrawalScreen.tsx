
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useATM } from '../contexts/ATMContext';
import { translations } from '../utils/translations';
import { atmService } from '../services/atmService';
import { ArrowLeft, DollarSign } from 'lucide-react';

interface WithdrawalScreenProps {
  onBack: () => void;
}

const WithdrawalScreen: React.FC<WithdrawalScreenProps> = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { language } = useATM();
  const t = translations[language];

  const quickAmounts = [20, 40, 60, 80, 100, 200];

  const handleWithdrawal = async (withdrawAmount: number) => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await atmService.withdraw(withdrawAmount);
      setMessage(result.message);
      setSuccess(result.success);
      
      if (result.success) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </Button>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                <CardTitle className="text-xl">{t.cashWithdrawal}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.quickAmounts}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    onClick={() => handleWithdrawal(quickAmount)}
                    disabled={loading}
                    className="h-16 text-lg font-semibold bg-green-600 hover:bg-green-700"
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">{t.customAmount}</h3>
              <form onSubmit={handleCustomWithdrawal} className="space-y-4">
                <div>
                  <Label htmlFor="amount">{t.enterAmount}</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="text-lg"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !amount}
                  className="w-full text-lg py-6 bg-green-600 hover:bg-green-700"
                >
                  {loading ? t.processing : t.withdraw}
                </Button>
              </form>
            </div>

            {message && (
              <Alert variant={success ? "default" : "destructive"}>
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
