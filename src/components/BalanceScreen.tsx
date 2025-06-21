import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { translations } from '../utils/translations';
import { supabaseATMService } from '../services/supabaseATMService';
import { ArrowLeft, Eye, Banknote, Calendar, User, TrendingUp, Shield } from 'lucide-react';

interface BalanceScreenProps {
  onBack: () => void;
}

const BalanceScreen: React.FC<BalanceScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { language, currentUser } = useSupabaseATM();
  const t = translations[language];

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true);
      try {
        const result = await supabaseATMService.getBalance();
        if (result.success) {
          setBalance(result.balance!);
          setSuccess(true);
        } else {
          setMessage(result.message);
          setSuccess(false);
        }
      } catch (error) {
        setMessage('An unexpected error occurred');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-KE') + ' ' + date.toLocaleTimeString('en-KE');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl animate-scale-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </Button>
              <div className="flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-xl dark:text-white">{t.balanceInquiry}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">{t.processing}</p>
              </div>
            ) : (
              <>
                {success && balance !== null ? (
                  <div className="space-y-8">
                    {/* Main Balance Display */}
                    <div className="text-center p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/50 dark:via-indigo-900/50 dark:to-purple-900/50 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 animate-fade-in shadow-lg">
                      <div className="relative">
                        <Banknote className="w-20 h-20 text-blue-600 dark:text-blue-400 mx-auto mb-6 animate-pulse" />
                        <div className="absolute -top-2 -right-2">
                          <Shield className="w-8 h-8 text-green-500" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{t.currentBalance}</h2>
                      <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent animate-pulse">
                        KES {balance.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-4 text-green-600 dark:text-green-400">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm font-medium">Account Active</span>
                      </div>
                    </div>

                    {/* Account Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200 mb-3">
                            <User className="w-6 h-6" />
                            <span className="font-semibold text-lg">Account Holder</span>
                          </div>
                          <p className="text-xl font-bold text-gray-800 dark:text-white">{currentUser?.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Primary Account</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200 mb-3">
                            <Calendar className="w-6 h-6" />
                            <span className="font-semibold text-lg">Last Updated</span>
                          </div>
                          <p className="text-xl font-bold text-gray-800 dark:text-white">{formatDateTime(new Date())}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time balance</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Additional Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-0 shadow-lg">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">KES {(balance * 0.1).toLocaleString()}</div>
                          <p className="text-sm text-green-700 dark:text-green-300">Available for Withdrawal</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-0 shadow-lg">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">KES {(balance * 0.05).toLocaleString()}</div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">Daily Limit</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 border-0 shadow-lg">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">KES {(balance * 0.2).toLocaleString()}</div>
                          <p className="text-sm text-purple-700 dark:text-purple-300">Transfer Limit</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Status Message */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                      <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                        This balance reflects all transactions up to {formatDateTime(new Date())}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive" className="animate-slide-in-right">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalanceScreen;
