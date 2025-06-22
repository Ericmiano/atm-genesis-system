import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { CreditCard, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ATMCardDetails: React.FC = () => {
  const { currentUser } = useSupabaseATM();
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!currentUser) return null;

  const handleCopyCardNumber = async () => {
    try {
      await navigator.clipboard.writeText(currentUser.cardNumber);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Card number copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy card number",
        variant: "destructive",
      });
    }
  };

  const formatCardNumber = (number: string) => {
    if (showCardNumber) {
      return number.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return '**** **** **** ' + number.slice(-4);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 text-white border-0 shadow-2xl animate-scale-in relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5"></div>
      </div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            <CardTitle className="text-lg">ATM Card</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75">Card Type</div>
            <Badge variant="outline" className="text-white border-white/30">
              {currentUser.cardType}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        {/* Card Number Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-75">Card Number</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCardNumber}
                className="p-1 hover:bg-white/10 text-white"
                title="Copy card number"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCardNumber(!showCardNumber)}
                className="p-1 hover:bg-white/10 text-white"
                title={showCardNumber ? "Hide card number" : "Show card number"}
              >
                {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="font-mono text-lg tracking-widest bg-white/10 p-3 rounded-lg backdrop-blur">
            {formatCardNumber(currentUser.cardNumber)}
          </div>
        </div>
        
        {/* Card Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs opacity-75">Valid Thru</div>
            <div className="font-mono text-lg bg-white/10 p-2 rounded backdrop-blur">
              {currentUser.expiryDate}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-75">CVV</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCVV(!showCVV)}
                className="p-1 hover:bg-white/10 text-white"
                title={showCVV ? "Hide CVV" : "Show CVV"}
              >
                {showCVV ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
            </div>
            <div className="font-mono text-lg bg-white/10 p-2 rounded backdrop-blur">
              {showCVV ? currentUser.cvv : '***'}
            </div>
          </div>
        </div>
        
        {/* Cardholder Name */}
        <div className="pt-2 border-t border-white/20">
          <div className="text-xs opacity-75">Cardholder Name</div>
          <div className="font-semibold uppercase tracking-wide bg-white/10 p-2 rounded backdrop-blur">
            {currentUser.name}
          </div>
        </div>
        
        {/* Current Balance */}
        <div className="pt-2">
          <div className="text-xs opacity-75">Current Balance</div>
          <div className="text-2xl font-bold bg-white/10 p-3 rounded-lg backdrop-blur">
            KES {currentUser.balance.toLocaleString()}
          </div>
        </div>

        {/* Account Status */}
        <div className="pt-2 border-t border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-75">Account Status</span>
            <Badge 
              variant={currentUser.isLocked ? "destructive" : "default"}
              className={currentUser.isLocked ? "bg-red-500 text-white" : "bg-green-500 text-white"}
            >
              {currentUser.isLocked ? 'Locked' : 'Active'}
            </Badge>
          </div>
          {currentUser.isLocked && currentUser.lockReason && (
            <div className="mt-2 text-xs opacity-75 bg-red-500/20 p-2 rounded">
              Reason: {currentUser.lockReason}
            </div>
          )}
        </div>

        {/* Security Features */}
        <div className="pt-2 border-t border-white/20">
          <div className="text-xs opacity-75 mb-2">Security Features</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Multi-Factor Authentication</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Real-time Fraud Detection</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Encrypted Transactions</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ATMCardDetails;
