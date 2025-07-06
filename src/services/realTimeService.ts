
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read: boolean;
  timestamp: string;
  user_id: string;
  data?: any;
}

export class RealTimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private connectionCallbacks: Array<(isConnected: boolean) => void> = [];

  subscribeToTransactions(userId: string, callback?: (payload: any) => void) {
    try {
      const channelName = `transactions:${userId}`;
      
      if (this.channels.has(channelName)) {
        return;
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Transaction update:', payload);
            if (callback) callback(payload);
          }
        )
        .subscribe((status) => {
          console.log('Transaction subscription status:', status);
        });

      this.channels.set(channelName, channel);
    } catch (error) {
      console.error('Error subscribing to transactions:', error);
    }
  }

  subscribeToSecurityEvents(userId: string, callback: (event: any) => void) {
    try {
      const channelName = `security:${userId}`;
      
      if (this.channels.has(channelName)) {
        return;
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'audit_logs',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Security event:', payload);
            callback(payload);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
    } catch (error) {
      console.error('Error subscribing to security events:', error);
    }
  }

  subscribeToFraudAlerts(userId: string, callback: (alert: any) => void) {
    try {
      const channelName = `fraud:${userId}`;
      
      if (this.channels.has(channelName)) {
        return;
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fraud_alerts',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Fraud alert:', payload);
            callback(payload);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
    } catch (error) {
      console.error('Error subscribing to fraud alerts:', error);
    }
  }

  subscribeToNotifications(userId: string, callback: (notification: NotificationData) => void) {
    try {
      const channelName = `notifications_${userId}`;
      
      if (this.channels.has(channelName)) {
        return;
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('New notification:', payload);
            if (payload.new) {
              const notification: NotificationData = {
                id: payload.new.id,
                title: payload.new.title,
                message: payload.new.message,
                type: payload.new.type,
                priority: payload.new.priority || 'medium',
                read: payload.new.read || false,
                timestamp: payload.new.created_at,
                user_id: payload.new.user_id,
                data: payload.new.data
              };
              callback(notification);
            }
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  }

  async getUnreadNotifications(userId: string): Promise<NotificationData[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return (data || []).map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority || 'medium',
        read: notification.read || false,
        timestamp: notification.created_at,
        user_id: notification.user_id,
        data: notification.data
      }));
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  unsubscribeFromChannel(channelName: string) {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
      }
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
    }
  }

  onConnectionChange(callback: (isConnected: boolean) => void) {
    this.connectionCallbacks.push(callback);
    
    // Check current connection status
    const status = supabase.realtime.isConnected();
    callback(status);
    
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  unsubscribeAll() {
    try {
      this.channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      this.channels.clear();
      this.connectionCallbacks = [];
    } catch (error) {
      console.error('Error unsubscribing from channels:', error);
    }
  }

  getConnectionStatus(): boolean {
    try {
      return supabase.realtime.isConnected();
    } catch (error) {
      console.error('Error getting connection status:', error);
      return false;
    }
  }
}

export const realTimeService = new RealTimeService();
