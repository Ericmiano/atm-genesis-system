import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    CreditCard, 
    PlusCircle, 
    TrendingUp, 
    Clock, 
    CheckCircle, 
    AlertTriangle,
    DollarSign,
    Calendar,
    Target,
    AlertCircle,
    Plus,
    Eye,
    EyeOff
} from 'lucide-react';
import { AutomatedPaymentService } from '../../services/automatedPaymentService';
import { CreditScoreService } from '../../services/creditScoreService';

const LoanCard = ({ loan, onSetupAutomated, onApplyNew }) => {
    const progressPercentage = ((loan.originalAmount - loan.remainingBalance) / loan.originalAmount) * 100;
    const isOverdue = loan.dueDate && new Date(loan.dueDate) < new Date() && loan.status !== 'paid';
    const isDueSoon = loan.dueDate && new Date(loan.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && loan.status !== 'paid';
    
    const getStatusColor = () => {
        if (loan.status === 'paid') return 'bg-green-600/20 text-green-400';
        if (loan.status === 'active') return 'bg-blue-600/20 text-blue-400';
        if (isOverdue) return 'bg-red-600/20 text-red-400';
        if (isDueSoon) return 'bg-yellow-600/20 text-yellow-400';
        return 'bg-gray-600/20 text-gray-400';
    };

    const getStatusText = () => {
        if (loan.status === 'paid') return 'Paid Off';
        if (loan.status === 'active') return 'Active';
        if (isOverdue) return 'Overdue';
        if (isDueSoon) return 'Due Soon';
        return 'Pending';
    };

    return (
        <Card className="bg-gray-800/80 border-gray-700 hover:border-custom-purple transition-all">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-custom-purple/20">
                        <CreditCard className="w-5 h-5 text-custom-purple" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-white">{loan.type}</CardTitle>
                        <p className="text-sm text-gray-400">Loan #{loan.id.slice(0, 8)}</p>
                    </div>
                </div>
                <Badge className={getStatusColor()}>
                    {getStatusText()}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-400">Original Amount</p>
                        <p className="text-xl font-bold text-white">KES {loan.originalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Remaining</p>
                        <p className="text-xl font-bold text-white">KES {loan.remainingBalance.toLocaleString()}</p>
                    </div>
                </div>
                
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                {loan.status === 'active' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-400">Interest Rate</p>
                            <p className="text-white">{loan.interestRate}%</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Monthly Payment</p>
                            <p className="text-white">KES {loan.monthlyPayment?.toLocaleString() || 'N/A'}</p>
                        </div>
                    </div>
                )}

                {loan.dueDate && (
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">Next Payment Due</span>
                        </div>
                        <p className="text-white font-medium">
                            {new Date(loan.dueDate).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {loan.status === 'active' && (
                    <div className="flex gap-2">
                        <Button className="flex-1 bg-custom-purple hover:bg-purple-700 text-white">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Pay Now
                        </Button>
                        <Button 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={() => onSetupAutomated(loan)}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Auto Pay
                        </Button>
                    </div>
                )}
                
                {loan.automated && (
                    <div className="flex items-center gap-2 p-2 bg-green-600/10 border border-green-600/20 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Automated repayment enabled</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const AutomatedRepaymentModal = ({ loan, isOpen, onClose, onSetup }) => {
    const [frequency, setFrequency] = useState('monthly');
    const [amount, setAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && loan) {
            // Set default amount to monthly payment or remaining balance
            const defaultAmount = loan.monthlyPayment || loan.remainingBalance;
            setAmount(defaultAmount.toString());
            
            // Set default start date to loan due date or next month
            const dueDate = loan.dueDate ? new Date(loan.dueDate) : new Date();
            dueDate.setMonth(dueDate.getMonth() + 1);
            setStartDate(dueDate.toISOString().split('T')[0]);
        }
    }, [isOpen, loan]);

    const handleSetup = async () => {
        if (!startDate || !amount) return;

        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            const result = await AutomatedPaymentService.setupRecurringLoanRepayment(
                loan.userId,
                loan.id,
                paymentAmount,
                frequency as 'weekly' | 'monthly',
                new Date(startDate)
            );

            if (result.success) {
                onSetup(loan.id);
                onClose();
            } else {
                alert('Failed to setup automated repayment: ' + result.error);
            }
        } catch (error) {
            console.error('Error setting up automated repayment:', error);
            alert('Failed to setup automated repayment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md bg-gray-800/95 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-custom-purple" />
                        Setup Automated Repayment
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-300 mb-1">Loan Details</p>
                        <p className="text-white font-medium">{loan.type}</p>
                        <p className="text-sm text-gray-400">
                            Remaining: KES {loan.remainingBalance.toLocaleString()}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="repayment-amount" className="text-sm text-gray-300">Repayment Amount</label>
                        <input
                            id="repayment-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                            aria-label="Enter repayment amount"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">Payment Frequency</label>
                        <Select value={frequency} onValueChange={setFrequency}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="start-date" className="text-sm text-gray-300">Start Date</label>
                        <input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            aria-label="Select start date for automated repayment"
                        />
                    </div>

                    <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                        <p className="text-sm text-blue-400">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            Repayments will be automatically processed when funds are available. 
                            You'll be notified if funds are insufficient.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button 
                            className="flex-1 bg-custom-purple hover:bg-purple-700 text-white"
                            onClick={handleSetup}
                            disabled={loading || !startDate || !amount}
                        >
                            {loading ? 'Setting up...' : 'Setup Automated Repayment'}
                        </Button>
                        <Button 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

interface LoansScreenProps {
    loans: any[];
    onApplyNew: () => void;
}

const LoansScreen: React.FC<LoansScreenProps> = ({ loans, onApplyNew }) => {
    const [showAutomatedModal, setShowAutomatedModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creditScore, setCreditScore] = useState(400);
    const [loanLimit, setLoanLimit] = useState(10000);
    const [showApplication, setShowApplication] = useState(false);
    const [applicationAmount, setApplicationAmount] = useState(10000);
    const [applicationDuration, setApplicationDuration] = useState(12);

    useEffect(() => {
        fetchPendingPayments();
        fetchCreditData();
    }, []);

    const fetchPendingPayments = async () => {
        try {
            // This would normally get the current user ID from context
            const userId = 'current-user-id'; // Replace with actual user ID
            const payments = await AutomatedPaymentService.getPendingPayments(userId);
            setPendingPayments(payments.filter(p => p.type === 'loan'));
        } catch (error) {
            console.error('Error fetching pending payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCreditData = async () => {
        try {
            let score = 400;
            try {
                const creditScoreData = await CreditScoreService.getCreditScore('test-user-id');
                score = creditScoreData?.score || 400;
            } catch (error) {
                console.warn('Credit score service not available, using default:', error);
                score = 400;
            }
            setCreditScore(score);
            
            // Calculate loan limit based on credit score
            let limit = 10000; // Base limit
            if (score >= 750) limit = 500000;
            else if (score >= 650) limit = 250000;
            else if (score >= 550) limit = 100000;
            else if (score >= 450) limit = 50000;
            
            setLoanLimit(limit);
        } catch (error) {
            console.error('Error fetching credit data:', error);
            setCreditScore(400);
            setLoanLimit(10000);
        }
    };

    const handleSetupAutomated = (loan) => {
        setSelectedLoan(loan);
        setShowAutomatedModal(true);
    };

    const handleAutomatedSetup = (loanId) => {
        // Update the loan to show it has automated payments
        // In a real app, this would update the loan status
        console.log('Automated repayment setup for loan:', loanId);
    };

    const getLoanEligibility = () => {
        return creditScore >= 400;
    };

    const getLoanStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'badge-success';
            case 'pending':
                return 'badge-warning';
            case 'rejected':
                return 'badge-danger';
            default:
                return 'badge-info';
        }
    };

    const calculateMonthlyPayment = (amount: number, months: number) => {
        const annualRate = 0.12; // 12% annual interest
        const monthlyRate = annualRate / 12;
        const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                       (Math.pow(1 + monthlyRate, months) - 1);
        return payment;
    };

    const monthlyPayment = calculateMonthlyPayment(applicationAmount, applicationDuration);

    const activeLoans = loans.filter(loan => loan.status === 'active');
    const paidLoans = loans.filter(loan => loan.status === 'paid');
    const totalBorrowed = loans.reduce((sum, loan) => sum + loan.originalAmount, 0);
    const totalRemaining = activeLoans.reduce((sum, loan) => sum + loan.remainingBalance, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#F1F1F1] mb-2">Loans & Credit</h1>
                    <p className="text-gray-400">Manage your borrowing and repayment</p>
                </div>
                <Button 
                    className="btn-primary"
                    onClick={() => setShowApplication(!showApplication)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Apply for Loan
                </Button>
            </div>

            {/* Loan Eligibility Card */}
            <Card className="card-modern">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#F1F1F1] flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        Loan Eligibility
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Credit Score */}
                        <div className="text-center">
                            <div className={`text-3xl font-bold px-4 py-2 rounded-lg mb-2 ${
                                creditScore >= 750 ? 'credit-score-excellent' :
                                creditScore >= 650 ? 'credit-score-good' :
                                creditScore >= 550 ? 'credit-score-fair' : 'credit-score-poor'
                            }`}>
                                {creditScore}
                            </div>
                            <p className="text-sm text-gray-400">Credit Score</p>
                        </div>

                        {/* Loan Limit */}
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#F1F1F1] mb-2">
                                KES {loanLimit.toLocaleString()}
                            </div>
                            <p className="text-sm text-gray-400">Maximum Loan Amount</p>
                        </div>

                        {/* Eligibility Status */}
                        <div className="text-center">
                            <div className={`text-2xl font-bold mb-2 ${
                                getLoanEligibility() ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {getLoanEligibility() ? 'Eligible' : 'Not Eligible'}
                            </div>
                            <Badge className={getLoanEligibility() ? 'badge-success' : 'badge-danger'}>
                                {getLoanEligibility() ? 'Can Apply' : 'Cannot Apply'}
                            </Badge>
                        </div>
                    </div>

                    {/* Eligibility Factors */}
                    <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="text-sm font-semibold text-[#F1F1F1] mb-3">Factors Affecting Eligibility:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-gray-300">Credit score ≥ 400</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-gray-300">No overdue loans</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-gray-300">Regular income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-gray-300">Good repayment history</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loan Application Form */}
            {showApplication && (
                <Card className="card-modern animate-slide-in">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-[#F1F1F1]">
                            New Loan Application
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-[#F1F1F1] mb-2">
                                    Loan Amount (KES)
                                </label>
                                <input
                                    type="range"
                                    min="10000"
                                    max={loanLimit}
                                    step="1000"
                                    value={applicationAmount}
                                    onChange={(e) => setApplicationAmount(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    aria-label="Loan amount slider"
                                    title="Adjust loan amount"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>KES 10,000</span>
                                    <span>KES {loanLimit.toLocaleString()}</span>
                                </div>
                                <div className="text-2xl font-bold text-[#F1F1F1] mt-2">
                                    KES {applicationAmount.toLocaleString()}
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-[#F1F1F1] mb-2">
                                    Repayment Period (Months)
                                </label>
                                <input
                                    type="range"
                                    min="6"
                                    max="60"
                                    step="6"
                                    value={applicationDuration}
                                    onChange={(e) => setApplicationDuration(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    aria-label="Repayment period slider"
                                    title="Adjust repayment period"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>6 months</span>
                                    <span>60 months</span>
                                </div>
                                <div className="text-2xl font-bold text-[#F1F1F1] mt-2">
                                    {applicationDuration} months
                                </div>
                            </div>
                        </div>

                        {/* Loan Summary */}
                        <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                            <h4 className="text-sm font-semibold text-[#F1F1F1] mb-3">Loan Summary:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400">Principal Amount:</span>
                                    <div className="text-[#F1F1F1] font-medium">KES {applicationAmount.toLocaleString()}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400">Interest Rate:</span>
                                    <div className="text-[#F1F1F1] font-medium">12% per annum</div>
                                </div>
                                <div>
                                    <span className="text-gray-400">Monthly Payment:</span>
                                    <div className="text-[#F1F1F1] font-medium">KES {monthlyPayment.toFixed(0)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                            <Button 
                                className="btn-primary flex-1"
                                disabled={!getLoanEligibility()}
                            >
                                Submit Application
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="btn-ghost"
                                onClick={() => setShowApplication(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Active Loans */}
            <Card className="card-modern">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#F1F1F1]">
                        Active Loans ({activeLoans.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {activeLoans.length > 0 ? (
                        <div className="space-y-4">
                            {activeLoans.map((loan, index) => {
                                const progress = ((loan.originalAmount - loan.remainingBalance) / loan.originalAmount) * 100;
                                return (
                                    <div key={index} className="p-4 bg-gray-800/30 rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="text-[#F1F1F1] font-medium">Loan #{loan.id}</h4>
                                                <p className="text-sm text-gray-400">
                                                    Applied on {new Date(loan.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge className={getLoanStatusColor(loan.status)}>
                                                {loan.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                            <div>
                                                <span className="text-sm text-gray-400">Amount:</span>
                                                <div className="text-[#F1F1F1] font-medium">
                                                    KES {loan.originalAmount?.toLocaleString() || '0'}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-400">Remaining:</span>
                                                <div className="text-[#F1F1F1] font-medium">
                                                    KES {loan.remainingBalance?.toLocaleString() || '0'}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-400">Monthly Payment:</span>
                                                <div className="text-[#F1F1F1] font-medium">
                                                    KES {loan.monthly_payment?.toLocaleString() || '0'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                                                <span>Repayment Progress</span>
                                                <span>{progress.toFixed(1)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" className="btn-primary">
                                                Make Payment
                                            </Button>
                                            <Button size="sm" variant="ghost" className="btn-ghost">
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No active loans</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Loan History */}
            <Card className="card-modern">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#F1F1F1]">
                        Loan History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="table-modern">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left p-3">Loan ID</th>
                                    <th className="text-left p-3">Amount</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Applied Date</th>
                                    <th className="text-left p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.map((loan, index) => (
                                    <tr key={index}>
                                        <td className="p-3">#{loan.id}</td>
                                        <td className="p-3">KES {loan.amount?.toLocaleString() || '0'}</td>
                                        <td className="p-3">
                                            <Badge className={getLoanStatusColor(loan.status)}>
                                                {loan.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            {new Date(loan.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-3">
                                            <Button size="sm" variant="ghost" className="btn-ghost">
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Automated Repayments Section */}
            {pendingPayments.length > 0 && (
                <Card className="bg-gray-800/80 border-gray-700 mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-custom-purple" />
                            Scheduled Automated Repayments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-purple-400" />
                                        <div>
                                            <p className="text-white font-medium">Automated Loan Repayment</p>
                                            <p className="text-sm text-gray-400">
                                                Scheduled for {new Date(payment.scheduledDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-medium">KES {payment.amount.toLocaleString()}</p>
                                        <Badge className="bg-purple-600/20 text-purple-400 text-xs">Scheduled</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Automated Repayment Modal */}
            {selectedLoan && (
                <AutomatedRepaymentModal
                    loan={selectedLoan}
                    isOpen={showAutomatedModal}
                    onClose={() => {
                        setShowAutomatedModal(false);
                        setSelectedLoan(null);
                    }}
                    onSetup={handleAutomatedSetup}
                />
            )}
        </div>
    );
};

export default LoansScreen; 