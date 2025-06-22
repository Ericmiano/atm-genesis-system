import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { translations } from '../utils/translations';
import { supabaseATMService } from '../services/supabaseATMService';
import { Transaction } from '../types/atm';
import { ArrowLeft, FileText, Calendar, TrendingUp, TrendingDown, ArrowRightLeft, Eye, Filter, Download, Search } from 'lucide-react';

interface HistoryScreenProps {
  onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { language } = useSupabaseATM();
  const t = translations[language];

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const history = await supabaseATMService.getTransactionHistory();
        setTransactions(history);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'WITHDRAWAL':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'DEPOSIT':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'TRANSFER':
        return <ArrowRightLeft className="w-5 h-5 text-purple-600" />;
      case 'BALANCE_INQUIRY':
        return <Eye className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'WITHDRAWAL':
        return 'text-red-600';
      case 'DEPOSIT':
        return 'text-green-600';
      case 'TRANSFER':
        return 'text-purple-600';
      case 'BALANCE_INQUIRY':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount: number, type: Transaction['type']) => {
    if (type === 'BALANCE_INQUIRY') return '-';
    const prefix = type === 'DEPOSIT' ? '+' : '-';
    return `${prefix}KES ${amount.toLocaleString()}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-KE'),
      time: date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl animate-scale-in">
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
                <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-xl dark:text-white">{t.transactionHistory}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 dark:border-orange-400 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">{t.processing}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, index) => {
                  const { date, time } = formatDate(transaction.timestamp);
                  return (
                    <Card 
                      key={transaction.id} 
                      className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-fade-in bg-white dark:bg-gray-800"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <h3 className="font-semibold text-gray-800 dark:text-white">
                                {transaction.type.replace('_', ' ')}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{date} at {time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getTransactionColor(transaction.type)} dark:text-inherit`}>
                              {formatAmount(transaction.amount, transaction.type)}
                            </div>
                            <Badge 
                              variant={transaction.status === 'SUCCESS' ? 'default' : 'destructive'}
                              className="mt-1"
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoryScreen;
