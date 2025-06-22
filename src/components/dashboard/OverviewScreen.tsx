import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    CreditCard, 
    Target,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    EyeOff,
    RefreshCw
} from 'lucide-react';
import { CreditScoreService } from '../../services/creditScoreService';
import { OverdraftService } from '../../services/overdraftService';

interface OverviewScreenProps {
    stats: {
        recentTransactions: any[];
        totalTransactions: number;
    };
    currentUser: any;
}

const OverviewScreen: React.FC<OverviewScreenProps> = ({ stats, currentUser }) => {
    const [creditScore, setCreditScore] = useState(400);
    const [overdraftLimit, setOverdraftLimit] = useState(50000);
    const [overdraftUsed, setOverdraftUsed] = useState(0);
    const [balance, setBalance] = useState(125000);
    const [showBalance, setShowBalance] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch credit score with fallback
                let score = 400;
                try {
                    const creditScoreData = await CreditScoreService.getCreditScore(currentUser?.id || 'test-user');
                    score = creditScoreData?.score || 400;
                } catch (error) {
                    console.warn('Credit score service not available, using default:', error);
                    score = 400;
                }
                setCreditScore(score);

                // Fetch overdraft info with fallback
                let limit = 50000;
                let used = 0;
                try {
                    const overdraftInfo = await OverdraftService.checkEligibility(currentUser?.id || 'test-user');
                    limit = overdraftInfo?.limit || 50000;
                    used = (overdraftInfo?.limit || 50000) - (overdraftInfo?.available || 50000);
                } catch (error) {
                    console.warn('Overdraft service not available, using defaults:', error);
                    limit = 50000;
                    used = 0;
                }
                setOverdraftLimit(limit);
                setOverdraftUsed(used);

                // Fetch balance (simulated)
                setBalance(125000);
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Use fallback values
                setCreditScore(400);
                setOverdraftLimit(50000);
                setOverdraftUsed(0);
                setBalance(125000);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    const getCreditScoreColor = (score: number) => {
        if (score >= 750) return 'credit-score-excellent';
        if (score >= 650) return 'credit-score-good';
        if (score >= 550) return 'credit-score-fair';
        return 'credit-score-poor';
    };

    const getCreditScoreLabel = (score: number) => {
        if (score >= 750) return 'Excellent';
        if (score >= 650) return 'Good';
        if (score >= 550) return 'Fair';
        return 'Poor';
    };

    const overdraftPercentage = overdraftLimit > 0 ? (overdraftUsed / overdraftLimit) * 100 : 0;
    const overdraftRemaining = overdraftLimit - overdraftUsed;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div className="card-modern p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#F1F1F1] mb-2">
                            Welcome back, {currentUser?.name || 'User'}! 👋
                        </h1>
                        <p className="text-gray-400">
                            Here's your financial overview for today
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Last updated</p>
                        <p className="text-sm text-[#F1F1F1]">
                            {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Account Balance */}
                <Card className="stat-card primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#F1F1F1]">
                            Account Balance
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBalance(!showBalance)}
                            className="btn-ghost p-1"
                        >
                            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#F1F1F1] animate-counter">
                            {showBalance ? `KES ${balance.toLocaleString()}` : '••••••'}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Available for transactions
                        </p>
                    </CardContent>
                </Card>

                {/* Credit Score */}
                <Card className="stat-card success">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#F1F1F1]">
                            Credit Score
                        </CardTitle>
                        <Target className="w-4 h-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getCreditScoreColor(creditScore)}`}>
                                {creditScore}
                            </div>
                            <Badge className={`badge-${getCreditScoreLabel(creditScore).toLowerCase()}`}>
                                {getCreditScoreLabel(creditScore)}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Based on payment history
                        </p>
                    </CardContent>
                </Card>

                {/* Overdraft Protection */}
                <Card className="stat-card warning">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#F1F1F1]">
                            Overdraft Protection
                        </CardTitle>
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#F1F1F1]">
                            KES {overdraftRemaining.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(overdraftPercentage, 100)}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-400">
                                {overdraftPercentage.toFixed(0)}%
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {overdraftUsed.toLocaleString()} used of {overdraftLimit.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                {/* Monthly Expenses */}
                <Card className="stat-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#F1F1F1]">
                            This Month's Expenses
                        </CardTitle>
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#F1F1F1]">
                            KES 45,200
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-red-400">-12%</span>
                            <span className="text-xs text-gray-400">from last month</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="card-modern">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#F1F1F1]">
                        Recent Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.recentTransactions.length > 0 ? (
                            stats.recentTransactions.map((transaction, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            transaction.type === 'credit' 
                                                ? 'bg-green-500/20 text-green-400' 
                                                : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {transaction.type === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#F1F1F1]">
                                                {transaction.description || 'Transaction'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {transaction.date instanceof Date 
                                                    ? transaction.date.toLocaleDateString() 
                                                    : transaction.date 
                                                        ? new Date(transaction.date).toLocaleDateString()
                                                        : new Date().toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-medium ${
                                            transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {transaction.type === 'credit' ? '+' : '-'} KES {transaction.amount?.toLocaleString() || '0'}
                                        </p>
                                        <Badge className={`text-xs ${
                                            transaction.status === 'completed' ? 'badge-success' : 'badge-warning'
                                        }`}>
                                            {transaction.status || 'pending'}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400">No recent transactions</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <Button variant="ghost" className="w-full btn-ghost">
                            View All Transactions
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OverviewScreen; 