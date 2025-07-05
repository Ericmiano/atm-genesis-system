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
    RefreshCw,
    Wallet,
    Shield,
    Zap
} from 'lucide-react';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import { CreditScoreService } from '../../services/creditScoreService';
import { OverdraftService } from '../../services/overdraftService';
import { cn } from '@/lib/utils';

interface OverviewScreenProps {
    stats: {
        recentTransactions: any[];
        totalTransactions: number;
    };
    currentUser: any;
}

const OverviewScreen: React.FC<OverviewScreenProps> = ({ stats, currentUser }) => {
    const { isDarkMode } = useEnhancedTheme();
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
        if (score >= 750) return 'text-success border-success/20 bg-success/10';
        if (score >= 650) return 'text-primary border-primary/20 bg-primary/10';
        if (score >= 550) return 'text-warning border-warning/20 bg-warning/10';
        return 'text-error border-error/20 bg-error/10';
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
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <Card className={cn(
                "transition-all duration-300 hover:shadow-lg",
                isDarkMode 
                    ? "bg-dark-surface border-dark-border/20" 
                    : "bg-white border-neutral-200/50 shadow-sm"
            )}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                                "bg-gradient-to-br from-primary to-secondary"
                            )}>
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className={cn(
                                    "text-2xl font-bold mb-2 transition-colors duration-300",
                                    isDarkMode ? "text-white" : "text-neutral-900"
                                )}>
                                    Welcome back, {currentUser?.name || 'User'}! 👋
                                </h1>
                                <p className={cn(
                                    "transition-colors duration-300",
                                    isDarkMode ? "text-muted-foreground" : "text-neutral-600"
                                )}>
                                    Here's your financial overview for today
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={cn(
                                "text-sm transition-colors duration-300",
                                isDarkMode ? "text-muted-foreground" : "text-neutral-500"
                            )}>
                                Last updated
                            </p>
                            <p className={cn(
                                "text-sm font-medium transition-colors duration-300",
                                isDarkMode ? "text-white" : "text-neutral-900"
                            )}>
                                {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Account Balance */}
                <Card className={cn(
                    "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                    isDarkMode 
                        ? "bg-dark-surface border-dark-border/20" 
                        : "bg-white border-neutral-200/50 shadow-sm"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn(
                            "text-sm font-medium transition-colors duration-300",
                            isDarkMode ? "text-white" : "text-neutral-900"
                        )}>
                            Account Balance
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBalance(!showBalance)}
                            className={cn(
                                "p-1 rounded-lg transition-all duration-300",
                                "hover:bg-muted/50 hover:scale-105"
                            )}
                        >
                            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold transition-colors duration-300",
                            isDarkMode ? "text-white" : "text-neutral-900"
                        )}>
                            {showBalance ? `KES ${balance.toLocaleString()}` : '••••••'}
                        </div>
                        <p className={cn(
                            "text-xs mt-1 transition-colors duration-300",
                            isDarkMode ? "text-muted-foreground" : "text-neutral-500"
                        )}>
                            Available for transactions
                        </p>
                    </CardContent>
                </Card>

                {/* Credit Score */}
                <Card className={cn(
                    "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                    isDarkMode 
                        ? "bg-dark-surface border-dark-border/20" 
                        : "bg-white border-neutral-200/50 shadow-sm"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn(
                            "text-sm font-medium transition-colors duration-300",
                            isDarkMode ? "text-white" : "text-neutral-900"
                        )}>
                            Credit Score
                        </CardTitle>
                        <Target className="w-4 h-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "text-2xl font-bold px-3 py-1 rounded-lg border",
                                getCreditScoreColor(creditScore)
                            )}>
                                {creditScore}
                            </div>
                            <Badge className={cn(
                                "text-xs font-medium",
                                getCreditScoreColor(creditScore)
                            )}>
                                {getCreditScoreLabel(creditScore)}
                            </Badge>
                        </div>
                        <p className={cn(
                            "text-xs mt-1 transition-colors duration-300",
                            isDarkMode ? "text-muted-foreground" : "text-neutral-500"
                        )}>
                            Based on payment history
                        </p>
                    </CardContent>
                </Card>

                {/* Overdraft Protection */}
                <Card className={cn(
                    "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                    isDarkMode 
                        ? "bg-dark-surface border-dark-border/20" 
                        : "bg-white border-neutral-200/50 shadow-sm"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn(
                            "text-sm font-medium transition-colors duration-300",
                            isDarkMode ? "text-white" : "text-neutral-900"
                        )}>
                            Overdraft Protection
                        </CardTitle>
                        <Shield className="w-4 h-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold transition-colors duration-300",
                            isDarkMode ? "text-white" : "text-neutral-900"
                        )}>
                            KES {overdraftRemaining.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={cn(
                                "flex-1 rounded-full h-2 transition-colors duration-300",
                                isDarkMode ? "bg-neutral-700" : "bg-neutral-200"
                            )}>
                                <div 
                                    className="bg-gradient-to-r from-warning to-accent h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(overdraftPercentage, 100)}%` }}
                                ></div>
                            </div>
                            <span className={cn(
                                "text-xs transition-colors duration-300",
                                isDarkMode ? "text-muted-foreground" : "text-neutral-500"
                            )}>
                                {overdraftPercentage.toFixed(0)}%
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className={cn(
                    "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                    isDarkMode 
                        ? "bg-dark-surface border-dark-border/20" 
                        : "bg-white border-neutral-200/50 shadow-sm"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn(
                            "text-sm font-medium transition-colors duration-300",
                            isDarkMode ? "text-white" : "text-neutral-900"
                        )}>
                            Quick Actions
                        </CardTitle>
                        <Zap className="w-4 h-4 text-accent" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className={cn(
                            "w-full transition-all duration-300 hover:scale-[1.02]",
                            "bg-gradient-to-r from-primary to-secondary text-white shadow-lg",
                            "hover:shadow-xl hover:shadow-primary/25"
                        )}>
                            Send Money
                        </Button>
                        <Button variant="outline" className={cn(
                            "w-full transition-all duration-300 hover:scale-[1.02]",
                            "border-secondary/20 text-secondary hover:bg-secondary/10"
                        )}>
                            Pay Bills
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card className={cn(
                "transition-all duration-300 hover:shadow-lg",
                isDarkMode 
                    ? "bg-dark-surface border-dark-border/20" 
                    : "bg-white border-neutral-200/50 shadow-sm"
            )}>
                <CardHeader>
                    <CardTitle className={cn(
                        "transition-colors duration-300",
                        isDarkMode ? "text-white" : "text-neutral-900"
                    )}>
                        Recent Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.recentTransactions.map((transaction, index) => (
                            <div key={index} className={cn(
                                "flex items-center justify-between p-3 rounded-xl transition-all duration-300",
                                "hover:shadow-md hover:scale-[1.01]",
                                isDarkMode 
                                    ? "bg-dark-surface/50 hover:bg-dark-surface" 
                                    : "bg-neutral-50 hover:bg-neutral-100"
                            )}>
                                <div className="flex items-center space-x-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                        transaction.type === 'credit' 
                                            ? "bg-success/10 text-success" 
                                            : "bg-error/10 text-error"
                                    )}>
                                        {transaction.type === 'credit' ? (
                                            <ArrowUpRight className="w-4 h-4" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div>
                                        <p className={cn(
                                            "font-medium transition-colors duration-300",
                                            isDarkMode ? "text-white" : "text-neutral-900"
                                        )}>
                                            {transaction.description}
                                        </p>
                                        <p className={cn(
                                            "text-xs transition-colors duration-300",
                                            isDarkMode ? "text-muted-foreground" : "text-neutral-500"
                                        )}>
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn(
                                        "font-semibold transition-colors duration-300",
                                        transaction.type === 'credit' ? "text-success" : "text-error"
                                    )}>
                                        {transaction.type === 'credit' ? '+' : '-'} KES {transaction.amount.toLocaleString()}
                                    </p>
                                    <Badge className={cn(
                                        "text-xs",
                                        transaction.status === 'completed' 
                                            ? "bg-success/10 text-success border-success/20" 
                                            : "bg-warning/10 text-warning border-warning/20"
                                    )}>
                                        {transaction.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OverviewScreen; 