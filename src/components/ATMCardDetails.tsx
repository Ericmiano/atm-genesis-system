
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const ATMCardDetails: React.FC = () => {
  const { currentUser } = useSupabaseATM();
  const [showCardNumber, setShowCardNumber] = useState(false);

  if (!currentUser) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 text-white border-0 shadow-2xl animate-scale-in relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/10"></div>
      </div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            <CardTitle className="text-lg">ATM Card</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75">Card Type</div>
            <div className="font-bold">{currentUser.cardType}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-75">Card Number</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="p-1 hover:bg-white/10"
            >
              {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <div className="font-mono text-lg tracking-widest">
            {showCardNumber ? currentUser.cardNumber : '**** **** **** ' + currentUser.cardNumber.slice(-4)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs opacity-75">Valid Thru</div>
            <div className="font-mono text-lg">{currentUser.expiryDate}</div>
          </div>
          <div>
            <div className="text-xs opacity-75">CVV</div>
            <div className="font-mono text-lg">***</div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-white/20">
          <div className="text-xs opacity-75">Cardholder Name</div>
          <div className="font-semibold uppercase tracking-wide">{currentUser.name}</div>
        </div>
        
        <div className="pt-2">
          <div className="text-xs opacity-75">Current Balance</div>
          <div className="text-2xl font-bold">
            KES {currentUser.balance.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ATMCardDetails;
