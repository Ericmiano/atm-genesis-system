import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { translations } from '../utils/translations';
import { supabaseATMService } from '../services/supabaseATMService';
import { Bill } from '../types/atm';
import { ArrowLeft, FileText, Banknote, Calendar, Zap, Droplets, Phone, Tv, CreditCard, AlertTriangle } from 'lucide-react';

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
  const { language, currentUser, refreshUser } = useSupabaseATM();
  const t = translations[language];

  useEffect(() => {
    const availableBills = supabaseATMService.getAvailableBills();
    setBills(availableBills);
  }, []);

  const handlePayBill = async (bill: Bill, amount?: number) => {
    const paymentAmount = amount || bill.amount;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await supabaseATMService.payBill(bill.id, paymentAmount);
      setMessage(result.message);
      setSuccess(result.success);
      
      if (result.success) {
        await refreshUser(); // Refresh user data to get updated balance
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
        return <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
      case 'SUBSCRIPTION':
        return <Tv className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      default:
        return <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('Water')) return <Droplets className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    if (name.includes('Safaricom')) return <Phone className="w-5 h-5 text-green-500 dark:text-green-400" />;
    if (name.includes('Power')) return <Zap className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />;
    if (name.includes('DSTV')) return <Tv className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
    return <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300 p-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl animate-scale-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </Button>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                <CardTitle className="text-xl dark:text-white">{t.billPayment}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-xl border border-teal-200/50 dark:border-teal-700/50">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-200">
                <Banknote className="w-5 h-5" />
                <span className="text-sm font-medium">Available Balance: KES {currentUser?.balance.toLocaleString()}</span>
              </div>
            </div>

            {!selectedBill ? (
              <div>
                <h3 className="text-lg font-semibold mb-6 dark:text-white">Available Bills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bills.map((bill, index) => (
                    <Card 
                      key={bill.id} 
                      className="border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => setSelectedBill(bill)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getServiceIcon(bill.name)}
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-white text-lg">{bill.name}</h4>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={bill.type === 'UTILITY' ? 'default' : 'secondary'} className="text-xs">
                                  {bill.type}
                                </Badge>
                                {isOverdue(bill.dueDate) && (
                                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {getBillIcon(bill.type)}
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Amount:</span>
                            <span className="font-bold text-lg dark:text-white">KES {bill.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Due Date:</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-sm font-medium dark:text-white">{new Date(bill.dueDate).toLocaleDateString('en-KE')}</span>
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
                <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {getServiceIcon(selectedBill.name)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl dark:text-white">{selectedBill.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300">Bill Amount: KES {selectedBill.amount.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Due: {new Date(selectedBill.dueDate).toLocaleDateString('en-KE')}
                          </span>
                        </div>
                      </div>
                      <Badge variant={selectedBill.type === 'UTILITY' ? 'default' : 'secondary'}>
                        {selectedBill.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Button
                    onClick={() => handlePayBill(selectedBill)}
                    disabled={loading}
                    className="w-full text-lg py-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition-all duration-300 hover:scale-105 transform shadow-lg"
                  >
                    {loading ? t.processing : `Pay Full Amount (KES ${selectedBill.amount.toLocaleString()})`}
                  </Button>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-semibold mb-4 dark:text-white text-lg">Pay Custom Amount</h4>
                    <form onSubmit={handleCustomPayment} className="space-y-4">
                      <div>
                        <Label htmlFor="customAmount" className="text-gray-700 dark:text-gray-300">Enter Amount</Label>
                        <Input
                          id="customAmount"
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="0"
                          min="0"
                          step="1"
                          className="text-lg transition-all duration-200 focus:scale-105 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading || !customAmount}
                        variant="outline"
                        className="w-full text-lg py-6 transition-all duration-300 hover:scale-105 transform border-2"
                      >
                        {loading ? t.processing : 'Pay Custom Amount'}
                      </Button>
                    </form>
                  </div>

                  <Button
                    onClick={() => setSelectedBill(null)}
                    variant="ghost"
                    className="w-full transition-all duration-300 hover:scale-105 text-gray-600 dark:text-gray-300"
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
