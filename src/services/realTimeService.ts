
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

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
