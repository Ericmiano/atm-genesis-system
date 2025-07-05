
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PresenceData {
  userId: string;
  username: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: string;
  sessionId?: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'security' | 'fraud' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  timestamp: string;
  userId: string;
}

export interface RealTimeServiceOptions {
  onUserPresence?: (users: PresenceData[]) => void;
  onConnectionChange?: (status: 'OPEN' | 'CLOSED' | 'CONNECTING') => void;
  onTransactionUpdate?: (transaction: any) => void;
}

export class RealTimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private options: RealTimeServiceOptions = {};

  constructor(options: RealTimeServiceOptions = {}) {
    this.options = options;
  }

  // Subscribe to user presence in a specific channel
  subscribeToPresence(channelName: string, callback: (users: PresenceData[]) => void) {
    try {
      const channel = supabase.channel(`presence_${channelName}`, {
        config: {
          presence: {
            key: channelName,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const users = Object.values(presenceState).flat().map((presence: any) => ({
            userId: presence.userId || presence.user_id || 'unknown',
            username: presence.username || 'Anonymous',
            status: presence.status || 'online',
            lastSeen: presence.lastSeen || presence.last_seen || new Date().toISOString(),
            sessionId: presence.sessionId || presence.session_id
          })) as PresenceData[];
          callback(users);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('User joined:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          console.log('User left:', leftPresences);
        })
        .subscribe();

      this.channels.set(`presence_${channelName}`, channel);
      return channel;
    } catch (error) {
      console.error('Error subscribing to presence:', error);
      return null;
    }
  }

  // Update user presence
  updatePresence(channelName: string, presenceData: PresenceData) {
    try {
      const channel = this.channels.get(`presence_${channelName}`);
      if (channel) {
        channel.track(presenceData);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }

  // Remove user presence
  removePresence(channelName: string) {
    try {
      const channel = this.channels.get(`presence_${channelName}`);
      if (channel) {
        channel.untrack();
      }
    } catch (error) {
      console.error('Error removing presence:', error);
    }
  }

  // Subscribe to transaction updates
  subscribeToTransactions(userId: string) {
    try {
      const channel = supabase
        .channel('transactions')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            this.options.onTransactionUpdate?.(payload.new);
          }
        )
        .subscribe();

      this.channels.set('transactions', channel);
      return channel;
    } catch (error) {
      console.error('Error subscribing to transactions:', error);
      return null;
    }
  }

  // Subscribe to transaction updates (alias for compatibility)
  subscribeToTransactionUpdates(userId: string, callback: (transaction: any) => void) {
    try {
      const channel = supabase
        .channel('transaction_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            callback(payload.new || payload.old);
          }
        )
        .subscribe();

      this.channels.set('transaction_updates', channel);
      return channel;
    } catch (error) {
      console.error('Error subscribing to transaction updates:', error);
      return null;
    }
  }

  // Subscribe to security events
  subscribeToSecurityEvents(userId: string, callback: (event: any) => void) {
    try {
      const channel = supabase
        .channel('security_events')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'audit_logs',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            callback(payload.new);
          }
        )
        .subscribe();

      this.channels.set('security_events', channel);
      return channel;
    } catch (error) {
      console.error('Error subscribing to security events:', error);
      return null;
    }
  }

  // Subscribe to fraud alerts
  subscribeToFraudAlerts(userId: string, callback: (alert: any) => void) {
    try {
      const channel = supabase
        .channel('fraud_alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'fraud_alerts',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            callback(payload.new);
          }
        )
        .subscribe();

      this.channels.set('fraud_alerts', channel);
      return channel;
    } catch (error) {
      console.error('Error subscribing to fraud alerts:', error);
      return null;
    }
  }

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (notification: NotificationData) => void) {
    try {
      const channel = supabase
        .channel(`notifications_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const dbNotification = payload.new as any;
            const notification: NotificationData = {
              id: dbNotification.id,
              title: dbNotification.title,
              message: dbNotification.message,
              type: dbNotification.type as 'transaction' | 'security' | 'fraud' | 'info',
              priority: dbNotification.priority as 'low' | 'medium' | 'high' | 'critical',
              read: dbNotification.read,
              timestamp: dbNotification.created_at,
              userId: dbNotification.user_id
            };
            callback(notification);
          }
        )
        .subscribe();

      this.channels.set(`notifications_${userId}`, channel);
      return channel;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return null;
    }
  }

  // Get unread notifications
  async getUnreadNotifications(userId: string): Promise<NotificationData[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((dbNotification: any): NotificationData => ({
        id: dbNotification.id,
        title: dbNotification.title,
        message: dbNotification.message,
        type: dbNotification.type as 'transaction' | 'security' | 'fraud' | 'info',
        priority: dbNotification.priority as 'low' | 'medium' | 'high' | 'critical',
        read: dbNotification.read,
        timestamp: dbNotification.created_at,
        userId: dbNotification.user_id
      }));
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Monitor connection status
  onConnectionChange(callback: (isOnline: boolean) => void) {
    // Use browser's online/offline events instead of realtime connection
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status
    callback(navigator.onLine);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // Track user activity
  trackUserActivity(userId: string, activityData: any) {
    try {
      const channel = this.channels.get('presence') || this.subscribeToPresence('lobby', () => {});
      if (channel) {
        channel.track({
          user_id: userId,
          last_activity: new Date().toISOString(),
          ...activityData,
        });
      }
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    try {
      this.channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      this.channels.clear();
    } catch (error) {
      console.error('Error unsubscribing from channels:', error);
    }
  }

  // Alias for compatibility
  unsubscribeFromAll() {
    this.unsubscribeAll();
  }

  // Unsubscribe from specific channel
  unsubscribe(channelName: string) {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
      }
    } catch (error) {
      console.error(`Error unsubscribing from ${channelName}:`, error);
    }
  }

  // Alias for compatibility
  unsubscribeFromChannel(channelName: string) {
    this.unsubscribe(channelName);
  }

  // Get connection status
  getConnectionStatus() {
    return navigator.onLine ? 'OPEN' : 'CLOSED';
  }

  // Send real-time message
  sendMessage(channelName: string, event: string, payload: any) {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.send({
          type: 'broadcast',
          event,
          payload,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}

export const realTimeService = new RealTimeService();
