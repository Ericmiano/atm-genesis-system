
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
import { useATM } from '../contexts/ATMContext';
import { translations } from '../utils/translations';
import { atmService } from '../services/atmService';
import { Loan } from '../types/atm';
import { ArrowLeft, DollarSign, CreditCard, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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

  const { language } = useATM();
  const t = translations[language];
  const { toast } = useToast();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const userLoans = atmService.getUserLoans();
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
      const result = await atmService.applyForLoan(
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
      const result = await atmService.makePayment(paymentData.loanId, Number(paymentData.amount));

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
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-4 animate-fade-in">
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
                <CreditCard className="w-6 h-6 text-green-600" />
                <CardTitle className="text-xl">{t.loans}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="apply" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Apply for Loan
                </TabsTrigger>
                <TabsTrigger value="my-loans" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  My Loans
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Make Payment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="apply" className="space-y-4">
                <form onSubmit={handleLoanApplication} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loan-type">Loan Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                          <SelectItem value="BUSINESS">Business Loan</SelectItem>
                          <SelectItem value="EMERGENCY">Emergency Loan</SelectItem>
                          <SelectItem value="EDUCATION">Education Loan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Loan Amount (KES)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        min="1000"
                        max="500000"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="term">Loan Term (Months)</Label>
                      <Select value={formData.termMonths} onValueChange={(value) => setFormData({...formData, termMonths: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 Months</SelectItem>
                          <SelectItem value="12">12 Months</SelectItem>
                          <SelectItem value="18">18 Months</SelectItem>
                          <SelectItem value="24">24 Months</SelectItem>
                          <SelectItem value="36">36 Months</SelectItem>
                          <SelectItem value="48">48 Months</SelectItem>
                          <SelectItem value="60">60 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="collateral">Collateral (Optional)</Label>
                      <Input
                        id="collateral"
                        placeholder="Enter collateral details"
                        value={formData.collateral}
                        onChange={(e) => setFormData({...formData, collateral: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Purpose of Loan</Label>
                    <Textarea
                      id="purpose"
                      placeholder="Describe the purpose of your loan"
                      value={formData.purpose}
                      onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      required
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Interest rates range from 10-17% annually based on your credit score and loan type. 
                      Maximum loan amount is KES 500,000.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Apply for Loan'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="my-loans" className="space-y-4">
                {loans.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No loans found</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {loans.map((loan, index) => (
                      <Card 
                        key={loan.id} 
                        className="animate-fade-in transition-all duration-200 hover:scale-105"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">{loan.type} Loan</h3>
                                <Badge variant={getStatusColor(loan.status)} className="flex items-center gap-1">
                                  {getStatusIcon(loan.status)}
                                  {loan.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">Loan ID: {loan.id}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">
                                KES {loan.remainingBalance.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600">Remaining</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Principal</p>
                              <p className="font-semibold">KES {loan.principal.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Interest Rate</p>
                              <p className="font-semibold">{loan.interestRate}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Monthly Payment</p>
                              <p className="font-semibold">KES {loan.monthlyPayment.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Next Payment</p>
                              <p className="font-semibold">
                                {loan.nextPaymentDate ? formatDate(loan.nextPaymentDate) : 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-gray-600 mb-1">Purpose: {loan.purpose}</p>
                            <p className="text-sm text-gray-600">Applied: {formatDate(loan.applicationDate)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payments" className="space-y-4">
                <form onSubmit={handleLoanPayment} className="space-y-4">
                  <div>
                    <Label htmlFor="loan-select">Select Loan</Label>
                    <Select value={paymentData.loanId} onValueChange={(value) => setPaymentData({...paymentData, loanId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan to pay" />
                      </SelectTrigger>
                      <SelectContent>
                        {loans.filter(l => l.status === 'ACTIVE').map((loan) => (
                          <SelectItem key={loan.id} value={loan.id}>
                            {loan.type} Loan - KES {loan.remainingBalance.toLocaleString()} remaining
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payment-amount">Payment Amount (KES)</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      placeholder="Enter payment amount"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                      min="1"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !paymentData.loanId}
                  >
                    {loading ? 'Processing...' : 'Make Payment'}
                  </Button>
                </form>

                {loans.filter(l => l.status === 'ACTIVE').length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You have no active loans to make payments for.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoansScreen;
