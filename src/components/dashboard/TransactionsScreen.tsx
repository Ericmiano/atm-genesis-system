
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Search, 
    SlidersHorizontal, 
    Download, 
    RefreshCw, 
    Eye, 
    Filter,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Send,
    CreditCard,
    ShoppingCart,
    Building2,
    Phone,
    Wallet,
    Banknote,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import SendMoneyModal from '../modals/SendMoneyModal';
import PayBillModal from '../modals/PayBillModal';
import BuyGoodsModal from '../modals/BuyGoodsModal';
import BuyAirtimeModal from '../modals/BuyAirtimeModal';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp: string;
  recipient?: string;
}

interface TransactionsScreenProps {
  transactions: Transaction[];
  onTransactionSuccess?: () => void | Promise<void>;
}

const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ transactions, onTransactionSuccess }) => {
  const { currentUser } = useSupabaseATM();
  
  // Modal states
  const [sendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);
  const [payBillModalOpen, setPayBillModalOpen] = useState(false);
  const [buyGoodsModalOpen, setBuyGoodsModalOpen] = useState(false);
  const [buyAirtimeModalOpen, setBuyAirtimeModalOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.recipient?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const successfulTransactions = filteredTransactions.filter(t => t.status === 'SUCCESS').length;
  const failedTransactions = filteredTransactions.filter(t => t.status === 'FAILED').length;
  const averageAmount = filteredTransactions.length > 0 ? totalAmount / filteredTransactions.length : 0;

  const handleTransactionSuccess = () => {
    // Refresh transactions or show success message
    console.log('Transaction completed successfully');
    if (onTransactionSuccess) {
      onTransactionSuccess();
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Description', 'Status', 'Recipient'],
      ...filteredTransactions.map(t => [
        new Date(t.timestamp).toLocaleDateString(),
        t.type,
        t.amount.toFixed(2),
        t.description,
        t.status,
        t.recipient || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'send_money':
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'deposit':
      case 'receive':
        return <ArrowDownRight className="w-4 h-4 text-green-500" />;
      case 'paybill':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'buy_goods':
        return <ShoppingCart className="w-4 h-4 text-orange-500" />;
      case 'buy_airtime':
        return <Phone className="w-4 h-4 text-purple-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">Manage and track your financial transactions</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Quick Actions
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportTransactions}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions Statistics Panel */}
      {showQuickActions && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="text-lg">Transaction Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">KES {totalAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{successfulTransactions}</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{failedTransactions}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">KES {averageAmount.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Banking Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-500" />
            Quick Banking Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Send Money */}
            <Button
              onClick={() => setSendMoneyModalOpen(true)}
              className="h-20 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="w-5 h-5" />
              <span className="text-xs">Send Money</span>
              <Badge variant="secondary" className="text-xs">Popular</Badge>
            </Button>

            {/* M-Pesa PayBill */}
            <Button
              onClick={() => setPayBillModalOpen(true)}
              className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Building2 className="w-5 h-5" />
              <span className="text-xs">M-Pesa PayBill</span>
            </Button>

            {/* M-Pesa Buy Goods */}
            <Button
              onClick={() => setBuyGoodsModalOpen(true)}
              className="h-20 flex flex-col items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">M-Pesa Buy Goods</span>
            </Button>

            {/* Buy Airtime */}
            <Button
              onClick={() => setBuyAirtimeModalOpen(true)}
              className="h-20 flex flex-col items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Phone className="w-5 h-5" />
              <span className="text-xs">Buy Airtime</span>
            </Button>

            {/* Bank Transfer */}
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs">Bank Transfer</span>
            </Button>

            {/* Cash Withdrawal */}
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Banknote className="w-5 h-5" />
              <span className="text-xs">Cash Withdrawal</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SEND_MONEY">Send Money</SelectItem>
                  <SelectItem value="PAYBILL">PayBill</SelectItem>
                  <SelectItem value="BUY_GOODS">Buy Goods</SelectItem>
                  <SelectItem value="BUY_AIRTIME">Buy Airtime</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Transactions</span>
            <span className="text-sm text-muted-foreground">
              {filteredTransactions.length} transactions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.recipient && (
                            <p className="text-sm text-muted-foreground">To: {transaction.recipient}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          KES {transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Banking Modals */}
      {currentUser && (
        <>
          <SendMoneyModal
            isOpen={sendMoneyModalOpen}
            onClose={() => setSendMoneyModalOpen(false)}
            userId={currentUser.id}
            onSuccess={handleTransactionSuccess}
          />
          
          <PayBillModal
            isOpen={payBillModalOpen}
            onClose={() => setPayBillModalOpen(false)}
            userId={currentUser.id}
            onSuccess={handleTransactionSuccess}
          />
          
          <BuyGoodsModal
            isOpen={buyGoodsModalOpen}
            onClose={() => setBuyGoodsModalOpen(false)}
            userId={currentUser.id}
            onSuccess={handleTransactionSuccess}
          />
          
          <BuyAirtimeModal
            isOpen={buyAirtimeModalOpen}
            onClose={() => setBuyAirtimeModalOpen(false)}
            userId={currentUser.id}
            onSuccess={handleTransactionSuccess}
          />
        </>
      )}
    </div>
  );
};

export default TransactionsScreen;
