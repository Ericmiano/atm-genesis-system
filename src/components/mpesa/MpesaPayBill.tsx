
import React, { useState } from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseATM } from '@/contexts/SupabaseATMContext';
import { toast } from '@/hooks/use-toast';

interface MpesaPayBillProps {
  onClose?: () => void;
}

const MpesaPayBill: React.FC<MpesaPayBillProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSupabaseATM();
  const [form, setForm] = useState({
    businessNumber: '',
    accountNumber: '',
    amount: ''
  });

  const handlePayBill = async () => {
    if (!currentUser || !form.businessNumber || !form.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { MpesaService } = await import('@/services/mpesaService');
      
      const result = await MpesaService.payBill(
        currentUser.id,
        form.businessNumber,
        parseFloat(form.amount)
      );

      toast({
        title: "Success",
        description: `Bill paid successfully! Reference: ${result.reference}`,
      });

      setForm({ businessNumber: '', accountNumber: '', amount: '' });
      if (onClose) onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to pay bill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pay Bill
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div>
          <Label htmlFor="businessNumber" className="text-sm font-medium">Business Number</Label>
          <Input
            id="businessNumber"
            placeholder="123456"
            value={form.businessNumber}
            onChange={(e) => setForm({ ...form, businessNumber: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="accountNumber" className="text-sm font-medium">Account Number (Optional)</Label>
          <Input
            id="accountNumber"
            placeholder="Account number"
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="billAmount" className="text-sm font-medium">Amount (KES)</Label>
          <Input
            id="billAmount"
            type="number"
            placeholder="500"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="mt-1"
          />
        </div>
        <Button 
          onClick={handlePayBill} 
          disabled={loading}
          className="w-full bg-[#FF4081] hover:bg-[#CC3368] text-white font-medium py-3"
        >
          {loading ? 'Processing...' : 'Pay Bill'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default MpesaPayBill;
