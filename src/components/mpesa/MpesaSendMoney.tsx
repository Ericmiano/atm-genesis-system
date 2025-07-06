
import React, { useState } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseATM } from '@/contexts/SupabaseATMContext';
import { toast } from '@/hooks/use-toast';

interface MpesaSendMoneyProps {
  onClose?: () => void;
}

const MpesaSendMoney: React.FC<MpesaSendMoneyProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSupabaseATM();
  const [form, setForm] = useState({
    recipient: '',
    amount: '',
    recipientName: ''
  });

  const handleSendMoney = async () => {
    if (!currentUser || !form.recipient || !form.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Import the MpesaService dynamically to avoid import issues
      const { MpesaService } = await import('@/services/mpesaService');
      
      const result = await MpesaService.sendMoney(
        currentUser.id,
        form.recipient,
        parseFloat(form.amount)
      );

      toast({
        title: "Success",
        description: `Money sent successfully! Reference: ${result.reference}`,
      });

      setForm({ recipient: '', amount: '', recipientName: '' });
      if (onClose) onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send money",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Send Money
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div>
          <Label htmlFor="recipient" className="text-sm font-medium">Recipient Phone Number</Label>
          <Input
            id="recipient"
            placeholder="254712345678"
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="recipientName" className="text-sm font-medium">Recipient Name (Optional)</Label>
          <Input
            id="recipientName"
            placeholder="John Doe"
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="amount" className="text-sm font-medium">Amount (KES)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="100"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="mt-1"
          />
        </div>
        <Button 
          onClick={handleSendMoney} 
          disabled={loading}
          className="w-full bg-[#00C853] hover:bg-[#4CAF50] text-white font-medium py-3"
        >
          {loading ? 'Processing...' : 'Send Money'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default MpesaSendMoney;
