
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useATM } from '../contexts/ATMContext';
import { translations } from '../utils/translations';
import { atmService } from '../services/atmService';
import { ArrowLeft, Eye, Banknote, Calendar, User } from 'lucide-react';

interface BalanceScreenProps {
  onBack: () => void;
}

const BalanceScreen: React.FC<BalanceScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { language, currentUser } = useATM();
  const t = translations[language];

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true);
      try {
        const result = await atmService.getBalance();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4 animate-fade-in">
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
                <Eye className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-xl">{t.balanceInquiry}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t.processing}</p>
              </div>
            ) : (
              <>
                {success && balance !== null ? (
                  <div className="space-y-6">
                    <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 animate-fade-in">
                      <Banknote className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.currentBalance}</h2>
                      <div className="text-5xl font-bold text-blue-600 animate-pulse">
                        KES {balance.toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <User className="w-5 h-5" />
                          <span className="font-medium">Account Holder</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">{currentUser?.name}</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <Calendar className="w-5 h-5" />
                          <span className="font-medium">Last Updated</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">{formatDateTime(new Date())}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 text-center">
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
