
import React, { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseATM } from '@/contexts/SupabaseATMContext';
import { toast } from '@/hooks/use-toast';

interface MpesaBuyGoodsProps {
  onClose?: () => void;
}

const MpesaBuyGoods: React.FC<MpesaBuyGoodsProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSupabaseATM();
  const [form, setForm] = useState({
    tillNumber: '',
    amount: ''
  });

  const handleBuyGoods = async () => {
    if (!currentUser || !form.tillNumber || !form.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { MpesaService } = await import('@/services/mpesaService');
      
      const result = await MpesaService.buyGoods(
        currentUser.id,
        form.tillNumber,
        parseFloat(form.amount)
      );

      toast({
        title: "Success",
        description: `Purchase completed! Reference: ${result.reference}`,
      });

      setForm({ tillNumber: '', amount: '' });
      if (onClose) onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete purchase",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Buy Goods & Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div>
          <Label htmlFor="tillNumber" className="text-sm font-medium">Till Number</Label>
          <Input
            id="tillNumber"
            placeholder="123456"
            value={form.tillNumber}
            onChange={(e) => setForm({ ...form, tillNumber: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="goodsAmount" className="text-sm font-medium">Amount (KES)</Label>
          <Input
            id="goodsAmount"
            type="number"
            placeholder="250"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="mt-1"
          />
        </div>
        <Button 
          onClick={handleBuyGoods} 
          disabled={loading}
          className="w-full bg-[#FFD600] hover:bg-[#CCAD00] text-[#1A237E] font-medium py-3"
        >
          {loading ? 'Processing...' : 'Buy Goods'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default MpesaBuyGoods;
