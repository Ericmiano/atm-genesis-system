import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { translations } from '../utils/translations';
import { handleQuickTransfer } from '../utils/transferUtils';
import { ArrowLeft, ArrowRight, Banknote, User } from 'lucide-react';

interface TransferScreenProps {
  onBack: () => void;
}

const TransferScreen: React.FC<TransferScreenProps> = ({ onBack }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { language, currentUser, refreshUser } = useSupabaseATM();
  const t = translations[language];

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleQuickTransferAmount = async (transferAmount: number) => {
    await handleQuickTransfer(recipient, transferAmount, setMessage, setSuccess, setLoading, refreshUser);
    if (success) {
      setAmount('');
      setRecipient('');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const transferAmount = parseFloat(amount);
    
    if (!recipient.trim()) {
      setMessage('Please enter a recipient account number');
      setSuccess(false);
      return;
    }
    
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setMessage('Please enter a valid amount');
      setSuccess(false);
      return;
    }
    
    await handleQuickTransfer(recipient, transferAmount, setMessage, setSuccess, setLoading, refreshUser);
    if (success) {
      setRecipient('');
      setAmount('');
    }
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
                <ArrowRight className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-xl dark:text-white">{t.fundsTransfer}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-200">
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
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter account number"
                  className="text-lg transition-all duration-200 focus:scale-105 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white">{t.quickAmounts}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      onClick={() => handleQuickTransferAmount(quickAmount)}
                      disabled={loading || !recipient.trim()}
                      className="h-16 text-lg font-semibold bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105 transform disabled:opacity-50"
                    >
                      KES {quickAmount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">{t.customAmount}</h3>
                <form onSubmit={handleTransfer} className="space-y-4">
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
                      className="text-lg transition-all duration-200 focus:scale-105 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !amount || !recipient.trim()}
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
