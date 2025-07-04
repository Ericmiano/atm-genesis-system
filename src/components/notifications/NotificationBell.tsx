
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertTriangle, Info, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { realTimeService, NotificationData } from '@/services/realTimeService';
import { useSupabaseATM } from '@/contexts/SupabaseATMContext';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useSupabaseATM();

  useEffect(() => {
    if (!currentUser) return;

    // Load initial notifications
    realTimeService.getUnreadNotifications(currentUser.id).then(setNotifications);

    // Subscribe to real-time notifications
    realTimeService.subscribeToNotifications(currentUser.id, (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      realTimeService.unsubscribeFromChannel(`notifications_${currentUser.id}`);
    };
  }, [currentUser]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    await realTimeService.markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    await Promise.all(
      unreadNotifications.map(n => realTimeService.markNotificationAsRead(n.id))
    );
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconProps = { className: "w-4 h-4" };
    
    switch (type) {
      case 'transaction':
        return <CreditCard {...iconProps} />;
      case 'security':
        return <Shield {...iconProps} />;
      case 'fraud':
        return <AlertTriangle {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500 border-red-500';
      case 'high':
        return 'text-orange-500 border-orange-500';
      case 'medium':
        return 'text-yellow-500 border-yellow-500';
      default:
        return 'text-blue-500 border-blue-500';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 rounded-full hover:bg-gray-700/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 z-50 w-96 max-w-sm"
            >
              <Card className="bg-gray-800/95 border-gray-700 shadow-2xl backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg font-semibold text-white">
                    Notifications
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-gray-700/50"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-1">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 border-l-4 hover:bg-gray-700/30 cursor-pointer transition-colors ${
                              notification.read 
                                ? 'bg-gray-800/30 border-gray-600' 
                                : `bg-gray-700/50 ${getPriorityColor(notification.priority)}`
                            }`}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-1 rounded-full ${
                                notification.read ? 'bg-gray-600' : 'bg-gray-700'
                              }`}>
                                {getNotificationIcon(notification.type, notification.priority)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className={`text-sm font-medium ${
                                    notification.read ? 'text-gray-300' : 'text-white'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                
                                <p className={`text-xs mt-1 ${
                                  notification.read ? 'text-gray-400' : 'text-gray-200'
                                }`}>
                                  {notification.message}
                                </p>
                                
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
