
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useATM } from '../contexts/ATMContext';
import { translations } from '../utils/translations';
import { atmService } from '../services/atmService';
import { Bill } from '../types/atm';
import { ArrowLeft, FileText, Banknote, Calendar, Zap, Droplets, Phone, Tv } from 'lucide-react';

interface BillPaymentScreenProps {
  onBack: () => void;
}

const BillPaymentScreen: React.FC<BillPaymentScreenProps> = ({ onBack }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { language, currentUser, setCurrentUser } = useATM();
  const t = translations[language];

  useEffect(() => {
    const availableBills = atmService.getAvailableBills();
    setBills(availableBills);
  }, []);

  const handlePayBill = async (bill: Bill, amount?: number) => {
    const paymentAmount = amount || bill.amount;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await atmService.payBill(bill.id, paymentAmount);
      setMessage(result.message);
      setSuccess(result.success);
      
      if (result.success && currentUser) {
        setCurrentUser({ ...currentUser, balance: result.balance! });
        setSelectedBill(null);
        setCustomAmount('');
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount');
      setSuccess(false);
      return;
    }
    
    await handlePayBill(selectedBill, amount);
  };

  const getBillIcon = (type: Bill['type']) => {
    switch (type) {
      case 'UTILITY':
        return <Zap className="w-6 h-6 text-yellow-600" />;
      case 'SUBSCRIPTION':
        return <Tv className="w-6 h-6 text-purple-600" />;
      default:
        return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('Water')) return <Droplets className="w-5 h-5 text-blue-500" />;
    if (name.includes('Safaricom')) return <Phone className="w-5 h-5 text-green-500" />;
    if (name.includes('Power')) return <Zap className="w-5 h-5 text-yellow-500" />;
    if (name.includes('DSTV')) return <Tv className="w-5 h-5 text-orange-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
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
                <FileText className="w-6 h-6 text-teal-600" />
                <CardTitle className="text-xl">{t.billPayment}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-center gap-2 text-teal-700">
                <Banknote className="w-5 h-5" />
                <span className="text-sm font-medium">Available Balance: KES {currentUser?.balance.toLocaleString()}</span>
              </div>
            </div>

            {!selectedBill ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Bills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bills.map((bill, index) => (
                    <Card 
                      key={bill.id} 
                      className="border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => setSelectedBill(bill)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getServiceIcon(bill.name)}
                            <div>
                              <h4 className="font-semibold text-gray-800">{bill.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={bill.type === 'UTILITY' ? 'default' : 'secondary'}>
                                  {bill.type}
                                </Badge>
                                {isOverdue(bill.dueDate) && (
                                  <Badge variant="destructive">Overdue</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {getBillIcon(bill.type)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Amount:</span>
                            <span className="font-semibold">KES {bill.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Due Date:</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-sm font-medium">{new Date(bill.dueDate).toLocaleDateString('en-KE')}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  {getServiceIcon(selectedBill.name)}
                  <div>
                    <h3 className="font-semibold text-lg">{selectedBill.name}</h3>
                    <p className="text-gray-600">Bill Amount: KES {selectedBill.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => handlePayBill(selectedBill)}
                    disabled={loading}
                    className="w-full text-lg py-6 bg-teal-600 hover:bg-teal-700 transition-all duration-200 hover:scale-105 transform"
                  >
                    {loading ? t.processing : `Pay Full Amount (KES ${selectedBill.amount.toLocaleString()})`}
                  </Button>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Pay Custom Amount</h4>
                    <form onSubmit={handleCustomPayment} className="space-y-3">
                      <div>
                        <Label htmlFor="customAmount">Enter Amount</Label>
                        <Input
                          id="customAmount"
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="0"
                          min="0"
                          step="1"
                          className="text-lg transition-all duration-200 focus:scale-105"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading || !customAmount}
                        variant="outline"
                        className="w-full text-lg py-6 transition-all duration-200 hover:scale-105 transform"
                      >
                        {loading ? t.processing : 'Pay Custom Amount'}
                      </Button>
                    </form>
                  </div>

                  <Button
                    onClick={() => setSelectedBill(null)}
                    variant="ghost"
                    className="w-full transition-all duration-200 hover:scale-105"
                  >
                    Back to Bills
                  </Button>
                </div>
              </div>
            )}

            {message && (
              <Alert variant={success ? "default" : "destructive"} className="animate-slide-in-right">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillPaymentScreen;
