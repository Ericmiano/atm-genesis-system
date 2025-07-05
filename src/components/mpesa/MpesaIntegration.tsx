
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, CreditCard, Smartphone, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MpesaService } from '@/services/mpesaService';
import { useSupabaseATM } from '@/contexts/SupabaseATMContext';
import { toast } from '@/hooks/use-toast';

interface MpesaIntegrationProps {
  onClose?: () => void;
}

const MpesaIntegration: React.FC<MpesaIntegrationProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('send');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSupabaseATM();

  // Form states
  const [sendMoneyForm, setSendMoneyForm] = useState({
    recipient: '',
    amount: ''
  });

  const [payBillForm, setPayBillForm] = useState({
    businessNumber: '',
    accountNumber: '',
    amount: ''
  });

  const [buyGoodsForm, setBuyGoodsForm] = useState({
    tillNumber: '',
    amount: ''
  });

  const [airtimeForm, setAirtimeForm] = useState({
    phoneNumber: '',
    amount: ''
  });

  const handleSendMoney = async () => {
    if (!currentUser || !sendMoneyForm.recipient || !sendMoneyForm.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await MpesaService.sendMoney(
        currentUser.id,
        sendMoneyForm.recipient,
        parseFloat(sendMoneyForm.amount)
      );

      toast({
        title: "Success",
        description: `Money sent successfully! Reference: ${result.reference}`,
      });

      setSendMoneyForm({ recipient: '', amount: '' });
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

  const handlePayBill = async () => {
    if (!currentUser || !payBillForm.businessNumber || !payBillForm.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await MpesaService.payBill(
        currentUser.id,
        payBillForm.businessNumber,
        parseFloat(payBillForm.amount)
      );

      toast({
        title: "Success",
        description: `Bill paid successfully! Reference: ${result.reference}`,
      });

      setPayBillForm({ businessNumber: '', accountNumber: '', amount: '' });
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

  const handleBuyGoods = async () => {
    if (!currentUser || !buyGoodsForm.tillNumber || !buyGoodsForm.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await MpesaService.buyGoods(
        currentUser.id,
        buyGoodsForm.tillNumber,
        parseFloat(buyGoodsForm.amount)
      );

      toast({
        title: "Success",
        description: `Purchase completed! Reference: ${result.reference}`,
      });

      setBuyGoodsForm({ tillNumber: '', amount: '' });
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

  const handleBuyAirtime = async () => {
    if (!currentUser || !airtimeForm.phoneNumber || !airtimeForm.amount) {
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
        airtimeForm.phoneNumber,
        parseFloat(airtimeForm.amount)
      );

      toast({
        title: "Success",
        description: `Airtime purchased successfully! Reference: ${result.reference}`,
      });

      setAirtimeForm({ phoneNumber: '', amount: '' });
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#00C853] to-[#4CAF50] rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">M-Pesa Services</h2>
              <p className="text-gray-600">Send money, pay bills, and more</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="send" className="text-xs">Send Money</TabsTrigger>
              <TabsTrigger value="paybill" className="text-xs">Pay Bill</TabsTrigger>
              <TabsTrigger value="buygoods" className="text-xs">Buy Goods</TabsTrigger>
              <TabsTrigger value="airtime" className="text-xs">Airtime</TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#00C853]" />
                    Send Money
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient Phone Number</Label>
                    <Input
                      id="recipient"
                      placeholder="254712345678"
                      value={sendMoneyForm.recipient}
                      onChange={(e) => setSendMoneyForm({ ...sendMoneyForm, recipient: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (KES)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="100"
                      value={sendMoneyForm.amount}
                      onChange={(e) => setSendMoneyForm({ ...sendMoneyForm, amount: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={handleSendMoney} 
                    disabled={loading}
                    className="w-full bg-[#00C853] hover:bg-[#4CAF50]"
                  >
                    {loading ? 'Processing...' : 'Send Money'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paybill" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#FF4081]" />
                    Pay Bill
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="businessNumber">Business Number</Label>
                    <Input
                      id="businessNumber"
                      placeholder="123456"
                      value={payBillForm.businessNumber}
                      onChange={(e) => setPayBillForm({ ...payBillForm, businessNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number (Optional)</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Account number"
                      value={payBillForm.accountNumber}
                      onChange={(e) => setPayBillForm({ ...payBillForm, accountNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billAmount">Amount (KES)</Label>
                    <Input
                      id="billAmount"
                      type="number"
                      placeholder="500"
                      value={payBillForm.amount}
                      onChange={(e) => setPayBillForm({ ...payBillForm, amount: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={handlePayBill} 
                    disabled={loading}
                    className="w-full bg-[#FF4081] hover:bg-[#CC3368]"
                  >
                    {loading ? 'Processing...' : 'Pay Bill'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buygoods" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#FFD600]" />
                    Buy Goods & Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tillNumber">Till Number</Label>
                    <Input
                      id="tillNumber"
                      placeholder="123456"
                      value={buyGoodsForm.tillNumber}
                      onChange={(e) => setBuyGoodsForm({ ...buyGoodsForm, tillNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goodsAmount">Amount (KES)</Label>
                    <Input
                      id="goodsAmount"
                      type="number"
                      placeholder="250"
                      value={buyGoodsForm.amount}
                      onChange={(e) => setBuyGoodsForm({ ...buyGoodsForm, amount: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={handleBuyGoods} 
                    disabled={loading}
                    className="w-full bg-[#FFD600] hover:bg-[#CCAD00] text-[#1A237E]"
                  >
                    {loading ? 'Processing...' : 'Buy Goods'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="airtime" className="mt-6">
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
                      value={airtimeForm.phoneNumber}
                      onChange={(e) => setAirtimeForm({ ...airtimeForm, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="airtimeAmount">Amount (KES)</Label>
                    <Input
                      id="airtimeAmount"
                      type="number"
                      placeholder="50"
                      value={airtimeForm.amount}
                      onChange={(e) => setAirtimeForm({ ...airtimeForm, amount: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setAirtimeForm({ ...airtimeForm, amount: '20' })}
                    >
                      KES 20
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setAirtimeForm({ ...airtimeForm, amount: '50' })}
                    >
                      KES 50
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setAirtimeForm({ ...airtimeForm, amount: '100' })}
                    >
                      KES 100
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setAirtimeForm({ ...airtimeForm, amount: '500' })}
                    >
                      KES 500
                    </Badge>
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
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default MpesaIntegration;
