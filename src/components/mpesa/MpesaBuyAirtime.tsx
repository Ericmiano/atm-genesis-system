
import React, { useState } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MpesaService } from '@/services/mpesaService';
import { useSupabaseATM } from '@/contexts/SupabaseATMContext';
import { toast } from '@/hooks/use-toast';

interface MpesaBuyAirtimeProps {
  onClose?: () => void;
}

const MpesaBuyAirtime: React.FC<MpesaBuyAirtimeProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSupabaseATM();
  const [form, setForm] = useState({
    phoneNumber: '',
    amount: ''
  });

  const handleBuyAirtime = async () => {
    if (!currentUser || !form.phoneNumber || !form.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await MpesaService.buyAirtime(
        currentUser.id,
        form.phoneNumber,
        parseFloat(form.amount)
      );

      toast({
        title: "Success",
        description: `Airtime purchased successfully! Reference: ${result.reference}`,
      });

      setForm({ phoneNumber: '', amount: '' });
      if (onClose) onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to buy airtime",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = ['20', '50', '100', '500'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#2196F3]" />
          Buy Airtime
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="airtimePhone">Phone Number</Label>
          <Input
            id="airtimePhone"
            placeholder="254712345678"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="airtimeAmount">Amount (KES)</Label>
          <Input
            id="airtimeAmount"
            type="number"
            placeholder="50"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {quickAmounts.map((amount) => (
            <Badge 
              key={amount}
              variant="outline" 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => setForm({ ...form, amount })}
            >
              KES {amount}
            </Badge>
          ))}
        </div>
        <Button 
          onClick={handleBuyAirtime} 
          disabled={loading}
          className="w-full bg-[#2196F3] hover:bg-[#1976D2]"
        >
          {loading ? 'Processing...' : 'Buy Airtime'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default MpesaBuyAirtime;
