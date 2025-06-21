
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '../../types/atm';
import { Activity } from 'lucide-react';

interface TransactionsListProps {
  transactions: Transaction[];
}

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-KE');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No transactions found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {transactions.map((transaction, index) => (
        <Card 
          key={transaction.id} 
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge>{transaction.type}</Badge>
                  <span className="font-medium">{transaction.description}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{formatDate(transaction.timestamp)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">KES {transaction.amount.toLocaleString()}</p>
                <Badge variant={getStatusColor(transaction.status)}>
                  {transaction.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TransactionsList;
