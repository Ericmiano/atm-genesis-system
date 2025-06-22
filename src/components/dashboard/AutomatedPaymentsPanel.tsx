import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    DollarSign,
    Calendar,
    Trash2
} from 'lucide-react';
import { AutomatedPaymentService, AutomatedPayment } from '../../services/automatedPaymentService';

interface AutomatedPaymentsPanelProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

const AutomatedPaymentsPanel: React.FC<AutomatedPaymentsPanelProps> = ({ userId, isOpen, onClose }) => {
    const [payments, setPayments] = useState<AutomatedPayment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            fetchPayments();
        }
    }, [isOpen, userId]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const [pending, history] = await Promise.all([
                AutomatedPaymentService.getPendingPayments(userId),
                AutomatedPaymentService.getPaymentHistory(userId)
            ]);
            setPayments([...pending, ...history.slice(0, 10)]); // Show pending + recent history
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelPayment = async (paymentId: string) => {
        try {
            const result = await AutomatedPaymentService.cancelPayment(paymentId, userId);
            if (result.success) {
                setPayments(prev => prev.filter(p => p.id !== paymentId));
            } else {
                alert('Failed to cancel payment: ' + result.error);
            }
        } catch (error) {
            console.error('Error cancelling payment:', error);
            alert('Failed to cancel payment');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-400" />;
            case 'insufficient_funds':
                return <AlertTriangle className="w-4 h-4 text-red-400" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-600/20 text-yellow-400 text-xs">Pending</Badge>;
            case 'completed':
                return <Badge className="bg-green-600/20 text-green-400 text-xs">Completed</Badge>;
            case 'failed':
                return <Badge className="bg-red-600/20 text-red-400 text-xs">Failed</Badge>;
            case 'insufficient_funds':
                return <Badge className="bg-red-600/20 text-red-400 text-xs">Insufficient</Badge>;
            case 'cancelled':
                return <Badge className="bg-gray-600/20 text-gray-400 text-xs">Cancelled</Badge>;
            default:
                return <Badge className="bg-gray-600/20 text-gray-400 text-xs">Unknown</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bill':
                return <DollarSign className="w-4 h-4 text-blue-400" />;
            case 'loan':
                return <DollarSign className="w-4 h-4 text-purple-400" />;
            default:
                return <DollarSign className="w-4 h-4 text-gray-400" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[80vh] bg-gray-800/95 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-custom-purple" />
                        Automated Payments
                    </CardTitle>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-400 hover:text-white"
                        onClick={onClose}
                    >
                        <XCircle className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[60vh]">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-purple mx-auto"></div>
                                <p className="text-gray-400 mt-2">Loading payments...</p>
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="p-8 text-center">
                                <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400">No automated payments</p>
                                <p className="text-sm text-gray-500 mt-1">Set up automated payments for bills and loans</p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-3">
                                {payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="p-4 rounded-lg border border-gray-700 bg-gray-700/30"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(payment.type)}
                                                    {getStatusIcon(payment.status)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-white">
                                                        Automated {payment.type} payment
                                                    </h4>
                                                    <p className="text-sm text-gray-400">
                                                        KES {payment.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-400">
                                                        {payment.status === 'pending' ? 'Scheduled for' : 'Processed on'}
                                                    </p>
                                                    <p className="text-sm text-white">
                                                        {payment.status === 'pending' 
                                                            ? new Date(payment.scheduledDate).toLocaleDateString()
                                                            : payment.processedAt 
                                                                ? new Date(payment.processedAt).toLocaleDateString()
                                                                : 'N/A'
                                                        }
                                                    </p>
                                                </div>
                                                {getStatusBadge(payment.status)}
                                                {payment.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-400 hover:text-red-300"
                                                        onClick={() => cancelPayment(payment.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        {payment.errorMessage && (
                                            <div className="mt-2 p-2 bg-red-600/10 border border-red-600/20 rounded text-sm text-red-400">
                                                Error: {payment.errorMessage}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default AutomatedPaymentsPanel; 