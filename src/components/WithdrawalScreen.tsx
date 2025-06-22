
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { useSecurity } from '../contexts/SecurityContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabaseATMService } from '../services/supabaseATMService';
import PINVerification from './PINVerification';
import { ArrowLeft, CreditCard, DollarSign, Shield, AlertTriangle } from 'lucide-react';

interface WithdrawalScreenProps {
  onBack: () => void;
}

const WithdrawalScreen: React.FC<WithdrawalScreenProps> = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { currentUser, refreshUser } = useSupabaseATM();
  const { checkFraudulentActivity, fraudAlert } = useSecurity();
  const { isDarkMode } = useTheme();

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      setMessage('Please enter a valid amount');
      setSuccess(false);
      return;
    }

    if (currentUser && withdrawAmount > currentUser.balance) {
      setMessage('Insufficient funds');
      setSuccess(false);
      return;
    }

    // Check for fraudulent activity
    await checkFraudulentActivity('WITHDRAWAL', withdrawAmount);
    
    setShowPinVerification(true);
  };

  const handlePinVerified = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const withdrawAmount = parseFloat(amount);
      const result = await supabaseATMService.withdraw(withdrawAmount);
      
      setMessage(result.message);
      setSuccess(result.success);
      
      if (result.success) {
        await refreshUser();
        setAmount('');
        setTimeout(() => {
          onBack();
        }, 2000);
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
      setSuccess(false);
    } finally {
      setLoading(false);
      setShowPinVerification(false);
    }
  };

  const handlePinCancelled = () => {
    setShowPinVerification(false);
  };

  if (showPinVerification) {
    return (
      <PINVerification
        onVerified={handlePinVerified}
        onCancel={handlePinCancelled}
        transactionType="Withdrawal"
        amount={parseFloat(amount)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-all duration-300">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-2xl animate-scale-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-red-600" />
                <CardTitle className="text-xl text-gray-800 dark:text-white">Cash Withdrawal</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Alert */}
            {fraudAlert?.isSuspicious && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  Security Notice: {fraudAlert.reason}
                </AlertDescription>
              </Alert>
            )}

            {/* Current Balance */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">Available Balance</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                    KES {currentUser?.balance.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Amount Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Quick Amounts</h3>
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="h-12 text-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
                    disabled={loading}
                  >
                    {quickAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Enter Custom Amount</h3>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg font-semibold">
                  KES
                </span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="pl-16 text-2xl h-14 text-center font-mono transition-all duration-200 focus:scale-105"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                This transaction is protected by multi-factor authentication
              </span>
            </div>

            {message && (
              <Alert variant={success ? "default" : "destructive"} className="animate-fade-in">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleWithdraw}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 hover:scale-105"
            >
              {loading ? 'Processing...' : 'Withdraw Cash'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WithdrawalScreen;
