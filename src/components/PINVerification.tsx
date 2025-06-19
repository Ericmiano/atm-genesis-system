
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabaseATMService } from '../services/supabaseATMService';
import { translations } from '../utils/translations';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { Shield, ArrowLeft } from 'lucide-react';

interface PINVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
  transactionType: string;
  amount?: number;
}

const PINVerification: React.FC<PINVerificationProps> = ({
  onVerified,
  onCancel,
  transactionType,
  amount
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { language } = useSupabaseATM();
  const t = translations[language];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await supabaseATMService.verifyPin(pin);
      if (result.success) {
        onVerified();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {t.verifyPin}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t.enterPinToAuthorize} {transactionType.toLowerCase()}
            {amount && ` of KES ${amount.toLocaleString()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                required
                className="text-2xl text-center tracking-widest transition-all duration-200 focus:scale-105"
                autoFocus
              />
            </div>
            {error && (
              <Alert variant="destructive" className="animate-fade-in">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 transition-all duration-200 hover:scale-105"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.cancel}
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-amber-500 hover:bg-amber-600 transition-all duration-200 hover:scale-105"
                disabled={loading || pin.length !== 4}
              >
                {loading ? t.verifying : t.verify}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PINVerification;
