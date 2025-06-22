import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Receipt, 
    Calendar, 
    DollarSign, 
    AlertCircle, 
    CheckCircle,
    Clock,
    Plus,
    CreditCard,
    Zap,
    TrendingUp,
    TrendingDown,
    Shield
} from 'lucide-react';
import { AutomatedPaymentService } from '../../services/automatedPaymentService';

interface BillsScreenProps {
    bills: any[];
    onAddBill: () => void;
}

const BillsScreen: React.FC<BillsScreenProps> = ({ bills, onAddBill }) => {
    const [showAddBill, setShowAddBill] = useState(false);
    const [automatedPayments, setAutomatedPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newBill, setNewBill] = useState({
        name: '',
        amount: '',
        dueDate: '',
        category: 'utilities'
    });

    useEffect(() => {
        fetchAutomatedPayments();
    }, []);

    const fetchAutomatedPayments = async () => {
        try {
            const payments = await AutomatedPaymentService.getAutomatedPayments('user-id');
            setAutomatedPayments(payments || []);
        } catch (error) {
            console.error('Error fetching automated payments:', error);
        }
    };

    const getBillStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'badge-success';
            case 'pending':
                return 'badge-warning';
            case 'overdue':
                return 'badge-danger';
            default:
                return 'badge-info';
        }
    };

    const getBillCategoryIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'utilities':
                return <Zap className="w-4 h-4" />;
            case 'rent':
                return <Receipt className="w-4 h-4" />;
            case 'insurance':
                return <Receipt className="w-4 h-4" />;
            default:
                return <Receipt className="w-4 h-4" />;
        }
    };

    const getDaysUntilDue = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const totalBills = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const paidBills = bills.filter(bill => bill.status === 'paid');
    const pendingBills = bills.filter(bill => bill.status === 'pending');
    const overdueBills = bills.filter(bill => bill.status === 'overdue');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#F1F1F1] mb-2">Bills & Payments</h1>
                    <p className="text-gray-400">Manage your recurring payments and bills</p>
                </div>
                <Button 
                    className="btn-primary"
                    onClick={() => setShowAddBill(!showAddBill)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bill
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="stat-card primary">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Total Bills</p>
                                <p className="text-2xl font-bold text-[#F1F1F1]">
                                    KES {totalBills.toLocaleString()}
                                </p>
                            </div>
                            <Receipt className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card success">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Paid</p>
                                <p className="text-2xl font-bold text-[#F1F1F1]">{paidBills.length}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card warning">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Pending</p>
                                <p className="text-2xl font-bold text-[#F1F1F1]">{pendingBills.length}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Overdue</p>
                                <p className="text-2xl font-bold text-red-400">{overdueBills.length}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Bill Form */}
            {showAddBill && (
                <Card className="card-modern animate-slide-in">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-[#F1F1F1]">
                            Add New Bill
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#F1F1F1] mb-2">
                                    Bill Name
                                </label>
                                <input
                                    type="text"
                                    value={newBill.name}
                                    onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                                    className="input-modern w-full"
                                    placeholder="e.g., Electricity Bill"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#F1F1F1] mb-2">
                                    Amount (KES)
                                </label>
                                <input
                                    type="number"
                                    value={newBill.amount}
                                    onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                                    className="input-modern w-full"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#F1F1F1] mb-2">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={newBill.dueDate}
                                    onChange={(e) => setNewBill({...newBill, dueDate: e.target.value})}
                                    className="input-modern w-full"
                                    aria-label="Select due date for bill"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#F1F1F1] mb-2">
                                    Category
                                </label>
                                <select
                                    value={newBill.category}
                                    onChange={(e) => setNewBill({...newBill, category: e.target.value})}
                                    className="input-modern w-full"
                                    aria-label="Select bill category"
                                >
                                    <option value="utilities">Utilities</option>
                                    <option value="rent">Rent</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="subscription">Subscription</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button className="btn-primary flex-1">
                                Add Bill
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="btn-ghost"
                                onClick={() => setShowAddBill(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bills List */}
            <Card className="card-modern">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#F1F1F1]">
                        Your Bills ({bills.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {bills.length > 0 ? (
                        <div className="space-y-4">
                            {bills.map((bill, index) => {
                                const daysUntilDue = getDaysUntilDue(bill.dueDate);
                                const isAutomated = automatedPayments.some(p => p.billId === bill.id);
                                
                                return (
                                    <div key={index} className="p-4 bg-gray-800/30 rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                                    {getBillCategoryIcon(bill.category)}
                                                </div>
                                                <div>
                                                    <h4 className="text-[#F1F1F1] font-medium">{bill.name}</h4>
                                                    <p className="text-sm text-gray-400">
                                                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-[#F1F1F1]">
                                                    KES {bill.amount?.toLocaleString() || '0'}
                                                </div>
                                                <Badge className={getBillStatusColor(bill.status)}>
                                                    {bill.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className={`${
                                                    daysUntilDue < 0 ? 'text-red-400' :
                                                    daysUntilDue <= 7 ? 'text-yellow-400' : 'text-gray-400'
                                                }`}>
                                                    {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                                                     daysUntilDue === 0 ? 'Due today' :
                                                     `${daysUntilDue} days remaining`}
                                                </span>
                                                {isAutomated && (
                                                    <Badge className="badge-success">
                                                        <Zap className="w-3 h-3 mr-1" />
                                                        Automated
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" className="btn-primary">
                                                Pay Now
                                            </Button>
                                            <Button size="sm" variant="ghost" className="btn-ghost">
                                                Setup Auto-Pay
                                            </Button>
                                            <Button size="sm" variant="ghost" className="btn-ghost">
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No bills found</p>
                            <Button 
                                className="btn-primary mt-4"
                                onClick={() => setShowAddBill(true)}
                            >
                                Add Your First Bill
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Automated Payments */}
            <Card className="card-modern">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#F1F1F1] flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        Automated Payments ({automatedPayments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {automatedPayments.length > 0 ? (
                        <div className="space-y-4">
                            {automatedPayments.map((payment, index) => (
                                <div key={index} className="p-4 bg-gray-800/30 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-[#F1F1F1] font-medium">
                                                {payment.billName || 'Automated Payment'}
                                            </h4>
                                            <p className="text-sm text-gray-400">
                                                Next payment: {new Date(payment.nextPaymentDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-[#F1F1F1]">
                                                KES {payment.amount?.toLocaleString() || '0'}
                                            </div>
                                            <Badge className="badge-success">Active</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No automated payments set up</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Set up automated payments to never miss a bill
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Trends */}
            <Card className="card-modern">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#F1F1F1]">
                        Payment Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">
                                <TrendingUp className="w-8 h-8 mx-auto" />
                            </div>
                            <p className="text-sm text-gray-400">On-time payments</p>
                            <p className="text-lg font-bold text-[#F1F1F1]">85%</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">
                                <Clock className="w-8 h-8 mx-auto" />
                            </div>
                            <p className="text-sm text-gray-400">Average days early</p>
                            <p className="text-lg font-bold text-[#F1F1F1]">3.2</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">
                                <DollarSign className="w-8 h-8 mx-auto" />
                            </div>
                            <p className="text-sm text-gray-400">Monthly average</p>
                            <p className="text-lg font-bold text-[#F1F1F1]">KES 45,200</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BillsScreen; 