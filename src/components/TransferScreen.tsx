
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useATM } from '../contexts/ATMContext';
import { translations } from '../utils/translations';
import { atmService } from '../services/atmService';
import { ArrowLeft, ArrowRight, Banknote, User } from 'lucide-react';

interface TransferScreenProps {
  onBack: () => void;
}

const TransferScreen: React.FC<TransferScreenProps> = ({ onBack }) => {
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { language, currentUser, setCurrentUser } = useATM();
  const t = translations[language];

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleTransfer = async (transferAmount: number) => {
    if (!recipientAccount.trim()) {
      setMessage('Please enter recipient account number');
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const result = await atmService.transfer(recipientAccount, transferAmount);
      setMessage(result.message);
      setSuccess(result.success);
      
      if (result.success && currentUser) {
        setCurrentUser({ ...currentUser, balance: result.balance! });
        setAmount('');
        setRecipientAccount('');
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const transferAmount = parseFloat(amount);
    
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setMessage('Please enter a valid amount');
      setSuccess(false);
      return;
    }
    
    await handleTransfer(transferAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-4 animate-fade-in">
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
                <ArrowRight className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-xl">{t.fundsTransfer}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 text-purple-700">
                <Banknote className="w-5 h-5" />
                <span className="text-sm font-medium">Available Balance: KES {currentUser?.balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="recipientAccount" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t.recipientAccount}
                </Label>
                <Input
                  id="recipientAccount"
                  type="text"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  placeholder="Enter account number"
                  className="text-lg transition-all duration-200 focus:scale-105"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">{t.quickAmounts}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      onClick={() => handleTransfer(quickAmount)}
                      disabled={loading || !recipientAccount.trim()}
                      className="h-16 text-lg font-semibold bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105 transform disabled:opacity-50"
                    >
                      KES {quickAmount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">{t.customAmount}</h3>
                <form onSubmit={handleCustomTransfer} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">{t.transferAmount}</Label>
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
                    disabled={loading || !amount || !recipientAccount.trim()}
                    className="w-full text-lg py-6 bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105 transform"
                  >
                    {loading ? t.processing : t.transfer}
                  </Button>
                </form>
              </div>
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

export default TransferScreen;
