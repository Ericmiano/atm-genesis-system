import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { translations } from '../utils/translations';
import { supabaseATMService } from '../services/supabaseATMService';
import { Loan } from '../types/atm';
import { ArrowLeft, DollarSign, CreditCard, Calendar, CheckCircle, Clock, AlertCircle, TrendingUp, Shield, Calculator } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface LoansScreenProps {
  onBack: () => void;
}

const LoansScreen: React.FC<LoansScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('apply');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    termMonths: '',
    purpose: '',
    collateral: ''
  });
  const [paymentData, setPaymentData] = useState({
    loanId: '',
    amount: ''
  });

  const { language } = useSupabaseATM();
  const t = translations[language];
  const { toast } = useToast();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const userLoans = await supabaseATMService.getUserLoans();
      setLoans(userLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await supabaseATMService.applyForLoan(
        formData.type as Loan['type'],
        Number(formData.amount),
        Number(formData.termMonths),
        formData.purpose,
        formData.collateral || undefined
      );

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setFormData({
          type: '',
          amount: '',
          termMonths: '',
          purpose: '',
          collateral: ''
        });
        fetchLoans();
        setActiveTab('my-loans');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoanPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await supabaseATMService.makePayment(paymentData.loanId, Number(paymentData.amount));

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setPaymentData({ loanId: '', amount: '' });
        fetchLoans();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Loan['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: Loan['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'COMPLETED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300 p-4 animate-fade-in">
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
                <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                <CardTitle className="text-xl dark:text-white">{t.loans}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="apply" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  <DollarSign className="w-4 h-4" />
                  Apply for Loan
                </TabsTrigger>
                <TabsTrigger value="my-loans" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  <CreditCard className="w-4 h-4" />
                  My Loans
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  <Calendar className="w-4 h-4" />
                  Make Payment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="apply" className="space-y-6">
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold dark:text-white">Loan Application</h3>
                    </div>
                    <form onSubmit={handleLoanApplication} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="loan-type" className="text-gray-700 dark:text-gray-300">Loan Type</Label>
                          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                            <SelectTrigger className="dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600">
                              <SelectValue placeholder="Select loan type" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:text-white">
                              <SelectItem value="PERSONAL" className="dark:bg-gray-800 dark:text-white">Personal Loan</SelectItem>
                              <SelectItem value="BUSINESS" className="dark:bg-gray-800 dark:text-white">Business Loan</SelectItem>
                              <SelectItem value="EMERGENCY" className="dark:bg-gray-800 dark:text-white">Emergency Loan</SelectItem>
                              <SelectItem value="EDUCATION" className="dark:bg-gray-800 dark:text-white">Education Loan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300">Loan Amount (KES)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            min="1000"
                            max="500000"
                            required
                            className="dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="term" className="text-gray-700 dark:text-gray-300">Loan Term (Months)</Label>
                          <Select value={formData.termMonths} onValueChange={(value) => setFormData({...formData, termMonths: value})}>
                            <SelectTrigger className="dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600">
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:text-white">
                              <SelectItem value="6" className="dark:bg-gray-800 dark:text-white">6 Months</SelectItem>
                              <SelectItem value="12" className="dark:bg-gray-800 dark:text-white">12 Months</SelectItem>
                              <SelectItem value="18" className="dark:bg-gray-800 dark:text-white">18 Months</SelectItem>
                              <SelectItem value="24" className="dark:bg-gray-800 dark:text-white">24 Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="purpose" className="text-gray-700 dark:text-gray-300">Purpose</Label>
                          <Input
                            id="purpose"
                            type="text"
                            placeholder="Purpose of loan"
                            value={formData.purpose}
                            onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                            className="dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="collateral" className="text-gray-700 dark:text-gray-300">Collateral (optional)</Label>
                        <Input
                          id="collateral"
                          type="text"
                          placeholder="Collateral details"
                          value={formData.collateral}
                          onChange={(e) => setFormData({...formData, collateral: e.target.value})}
                          className="dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                          Interest rates range from 10-17% annually based on your credit score and loan type. 
                          Maximum loan amount is KES 500,000.
                        </AlertDescription>
                      </Alert>

                      <Button 
                        type="submit" 
                        className="w-full text-lg py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:scale-105 transform shadow-lg"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Apply for Loan'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="my-loans" className="space-y-6">
                {loans.length === 0 ? (
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
                      <p className="text-gray-600 dark:text-gray-300 text-lg">No loans found</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Apply for your first loan to get started</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {loans.map((loan, index) => (
                      <Card 
                        key={loan.id} 
                        className="animate-fade-in transition-all duration-300 hover:scale-105 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-semibold dark:text-white">{loan.type} Loan</h3>
                                <Badge variant={getStatusColor(loan.status)} className="flex items-center gap-1">
                                  {getStatusIcon(loan.status)}
                                  {loan.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Loan ID: {loan.id}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                KES {loan.remainingBalance.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Remaining</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-gray-600 dark:text-gray-300 mb-1">Principal</p>
                              <p className="font-semibold dark:text-white">KES {loan.principal.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-gray-600 dark:text-gray-300 mb-1">Interest Rate</p>
                              <p className="font-semibold dark:text-white">{loan.interestRate}%</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-gray-600 dark:text-gray-300 mb-1">Monthly Payment</p>
                              <p className="font-semibold dark:text-white">KES {loan.monthlyPayment.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <p className="text-gray-600 dark:text-gray-300 mb-1">Next Payment</p>
                              <p className="font-semibold dark:text-white">
                                {loan.nextPaymentDate ? formatDate(loan.nextPaymentDate) : 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Purpose: {loan.purpose}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Applied: {formatDate(loan.applicationDate)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold dark:text-white">Make Loan Payment</h3>
                    </div>
                    <form onSubmit={handleLoanPayment} className="space-y-6">
                      <div>
                        <Label htmlFor="loan-select" className="text-gray-700 dark:text-gray-300">Select Loan</Label>
                        <Select value={paymentData.loanId} onValueChange={(value) => setPaymentData({...paymentData, loanId: value})}>
                          <SelectTrigger className="dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder="Select loan to pay" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:text-white">
                            {loans.filter(l => l.status === 'ACTIVE').map((loan) => (
                              <SelectItem key={loan.id} value={loan.id}>
                                {loan.type} Loan - KES {loan.remainingBalance.toLocaleString()} remaining
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="payment-amount" className="text-gray-700 dark:text-gray-300">Payment Amount (KES)</Label>
                        <Input
                          id="payment-amount"
                          type="number"
                          placeholder="Enter payment amount"
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                          min="1"
                          required
                          className="dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:scale-105 transform shadow-lg" 
                        disabled={loading || !paymentData.loanId}
                      >
                        {loading ? 'Processing...' : 'Make Payment'}
                      </Button>
                    </form>

                    {loans.filter(l => l.status === 'ACTIVE').length === 0 && (
                      <Alert className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                          You have no active loans to make payments for.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoansScreen;
