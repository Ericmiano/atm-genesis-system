import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Bell, 
    CheckCircle, 
    AlertTriangle, 
    XCircle, 
    Clock,
    DollarSign,
    CreditCard
} from 'lucide-react';
import { AutomatedPaymentService, PaymentNotification } from '../../services/automatedPaymentService';

interface NotificationsPanelProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ userId, isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isOpen && userId) {
            fetchNotifications();
        }
    }, [isOpen, userId]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const notifs = await AutomatedPaymentService.getNotifications(userId);
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await AutomatedPaymentService.markNotificationAsRead(notificationId, userId);
            setNotifications(prev => 
                prev.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.isRead);
            for (const notification of unreadNotifications) {
                await AutomatedPaymentService.markNotificationAsRead(notification.id, userId);
            }
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'payment_success':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'insufficient_funds':
                return <AlertTriangle className="w-5 h-5 text-red-400" />;
            case 'payment_failed':
                return <XCircle className="w-5 h-5 text-red-400" />;
            default:
                return <Bell className="w-5 h-5 text-silver" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'payment_success':
                return 'bg-green-600/10 border-green-600/20';
            case 'insufficient_funds':
                return 'bg-red-600/10 border-red-600/20';
            case 'payment_failed':
                return 'bg-red-600/10 border-red-600/20';
            default:
                return 'bg-silver-gradient border-glow';
        }
    };

    const getNotificationBadge = (type: string) => {
        switch (type) {
            case 'payment_success':
                return <Badge className="bg-green-600/20 text-green-400 text-xs">Success</Badge>;
            case 'insufficient_funds':
                return <Badge className="bg-red-600/20 text-red-400 text-xs">Warning</Badge>;
            case 'payment_failed':
                return <Badge className="bg-red-600/20 text-red-400 text-xs">Failed</Badge>;
            default:
                return <Badge className="badge-sleek text-xs">Info</Badge>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="modal-sleek w-full max-w-2xl max-h-[80vh] rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-silver/20">
                    <CardTitle className="text-xl text-silver-light flex items-center gap-2">
                        <Bell className="w-5 h-5 text-silver glow-silver" />
                        Notifications
                        {unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white animate-pulse-slow">
                                {unreadCount}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="button-sleek text-silver hover:text-silver-light"
                                onClick={markAllAsRead}
                            >
                                Mark all read
                            </Button>
                        )}
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-silver hover:text-silver-light hover:bg-glass"
                            onClick={onClose}
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[60vh] scrollbar-sleek">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-silver mx-auto"></div>
                                <p className="text-silver mt-2">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 text-silver-dark mx-auto mb-4" />
                                <p className="text-silver">No notifications</p>
                                <p className="text-sm text-silver-dark mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-sleek p-4 rounded-lg border ${
                                            !notification.isRead ? 'ring-1 ring-silver/30 glow-silver' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-medium text-silver-light">
                                                        {notification.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        {getNotificationBadge(notification.type)}
                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-silver rounded-full animate-pulse-slow"></div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-silver mb-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-silver-dark">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs text-silver hover:text-silver-light hover:bg-glass"
                                                            onClick={() => markAsRead(notification.id)}
                                                        >
                                                            Mark as read
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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

export default NotificationsPanel; 