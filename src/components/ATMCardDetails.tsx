
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useATM } from '../contexts/ATMContext';
import { translations } from '../utils/translations';
import { Eye, EyeOff, CreditCard, Calendar, Lock } from 'lucide-react';

const ATMCardDetails: React.FC = () => {
  const { currentUser, language } = useATM();
  const t = translations[language];
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

  if (!currentUser) return null;

  const maskCardNumber = (cardNumber: string) => {
    if (showCardNumber) return cardNumber;
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (showAccountNumber) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  const maskCVV = (cvv: string) => {
    if (showCVV) return cvv;
    return '*'.repeat(cvv.length);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0 shadow-xl animate-scale-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">{currentUser.name}</CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {currentUser.cardType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Card Number */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium opacity-80">{t.cardNumber}</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <div className="font-mono text-lg tracking-wider">
            {maskCardNumber(currentUser.cardNumber)}
          </div>
        </div>

        {/* Account Number */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium opacity-80">{t.accountNumber}</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAccountNumber(!showAccountNumber)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <div className="font-mono text-lg">
            {maskAccountNumber(currentUser.accountNumber)}
          </div>
        </div>

        {/* Expiry Date and CVV */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Calendar className="h-4 w-4" />
              {t.expiryDate}
            </div>
            <div className="font-mono text-lg">{currentUser.expiryDate}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <label className="text-sm font-medium opacity-80">CVV</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCVV(!showCVV)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {showCVV ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            <div className="font-mono text-lg text-right">
              {maskCVV(currentUser.cvv)}
            </div>
          </div>
        </div>

        {/* Card Icon */}
        <div className="flex justify-between items-center pt-2">
          <CreditCard className="h-8 w-8 opacity-80" />
          <div className="text-right">
            <div className="text-sm opacity-80">{t.balance}</div>
            <div className="text-lg font-bold">KES {currentUser.balance.toLocaleString()}</div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-xs opacity-60 pt-2 border-t border-white/20">
          <Lock className="h-3 w-3" />
          <span>{t.keepCardSecure}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ATMCardDetails;
