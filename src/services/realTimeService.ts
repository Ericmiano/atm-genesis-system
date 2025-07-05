
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealTimeServiceOptions {
  onUserPresence?: (users: any[]) => void;
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
  subscribeToPresence(channelName: string, userId: string) {
    try {
      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const users = Object.values(presenceState).flat();
          this.options.onUserPresence?.(users);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('User joined:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          console.log('User left:', leftPresences);
        })
        .subscribe();

      this.channels.set(channelName, channel);
      return channel;
    } catch (error) {
      console.error('Error subscribing to presence:', error);
      return null;
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
      const channel = this.channels.get('presence') || this.subscribeToPresence('lobby', userId);
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
