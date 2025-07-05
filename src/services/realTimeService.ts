import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface NotificationData {
  id: string;
  type: 'transaction' | 'security' | 'system' | 'fraud';
  title: string;
  message: string;
  userId: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
}

export interface PresenceData {
  userId: string;
  username: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  sessionId?: string;
}

export class RealTimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceChannels: Map<string, RealtimeChannel> = new Map();
  private notificationCallbacks: ((notification: NotificationData) => void)[] = [];
  private presenceCallbacks: ((presence: PresenceData[]) => void)[] = [];

  // Notification Management (using localStorage for now)
  async subscribeToNotifications(userId: string, callback: (notification: NotificationData) => void): Promise<void> {
    this.notificationCallbacks.push(callback);

    // Subscribe to transaction changes as notifications
    const channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const transaction = payload.new as any;
          const notification: NotificationData = {
            id: `notif_${Date.now()}_${Math.random()}`,
            type: 'transaction',
            title: 'New Transaction',
            message: `${transaction.type}: ${transaction.description}`,
            userId: transaction.user_id,
            timestamp: transaction.timestamp,
            read: false,
            priority: 'medium',
            data: transaction
          };
          
          // Store in localStorage
          this.storeNotification(notification);
          
          this.notificationCallbacks.forEach(cb => cb(notification));
        }
      )
      .subscribe();

    this.channels.set(`notifications_${userId}`, channel);
  }

  private storeNotification(notification: NotificationData): void {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    stored.unshift(notification);
    // Keep only last 50 notifications
    stored.splice(50);
    localStorage.setItem('notifications', JSON.stringify(stored));
  }

  async sendNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const fullNotification: NotificationData = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Store locally
    this.storeNotification(fullNotification);
    
    // Trigger callbacks
    this.notificationCallbacks.forEach(cb => cb(fullNotification));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = stored.map((n: NotificationData) => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
  }

  async getUnreadNotifications(userId: string): Promise<NotificationData[]> {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    return stored.filter((n: NotificationData) => n.userId === userId && !n.read);
  }

  // Presence Management
  async subscribeToPresence(roomId: string, callback: (presence: PresenceData[]) => void): Promise<void> {
    this.presenceCallbacks.push(callback);

    const channel = supabase
      .channel(`presence_${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const presenceList: PresenceData[] = Object.values(newState).flat() as PresenceData[];
        this.presenceCallbacks.forEach(cb => cb(presenceList));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe();

    this.presenceChannels.set(`presence_${roomId}`, channel);
  }

  async updatePresence(roomId: string, presenceData: PresenceData): Promise<void> {
    const channel = this.presenceChannels.get(`presence_${roomId}`);
    if (channel) {
      await channel.track(presenceData);
    }
  }

  async removePresence(roomId: string): Promise<void> {
    const channel = this.presenceChannels.get(`presence_${roomId}`);
    if (channel) {
      await channel.untrack();
    }
  }

  // Transaction Real-time Updates
  async subscribeToTransactionUpdates(userId: string, callback: (transaction: any) => void): Promise<void> {
    const channel = supabase
      .channel(`transactions_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback({
            event: payload.eventType,
            transaction: payload.new || payload.old
          });
        }
      )
      .subscribe();

    this.channels.set(`transactions_${userId}`, channel);
  }

  // System Status Updates
  async subscribeToSystemStatus(callback: (status: any) => void): Promise<void> {
    const channel = supabase
      .channel('system_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          callback({
            event: payload.eventType,
            status: payload.new || payload.old
          });
        }
      )
      .subscribe();

    this.channels.set('system_status', channel);
  }

  // Security Events Real-time (using audit_logs table)
  async subscribeToSecurityEvents(userId: string, callback: (event: any) => void): Promise<void> {
    const channel = supabase
      .channel(`security_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    this.channels.set(`security_${userId}`, channel);
  }

  // Fraud Alert Real-time
  async subscribeToFraudAlerts(userId: string, callback: (alert: any) => void): Promise<void> {
    const channel = supabase
      .channel(`fraud_alerts_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fraud_alerts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Send immediate notification for fraud alerts
          this.sendNotification({
            type: 'fraud',
            title: 'Fraud Alert',
            message: payload.new.description || 'Suspicious activity detected',
            userId: payload.new.user_id,
            priority: payload.new.severity?.toLowerCase() as 'low' | 'medium' | 'high' || 'high',
            data: payload.new
          });
          
          callback(payload.new);
        }
      )
      .subscribe();

    this.channels.set(`fraud_alerts_${userId}`, channel);
  }

  // Live Chat Support
  async subscribeToSupportChat(sessionId: string, callback: (message: any) => void): Promise<void> {
    const channel = supabase
      .channel(`support_chat_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
          filter: `details=ilike.%support_chat_${sessionId}%`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    this.channels.set(`support_chat_${sessionId}`, channel);
  }

  async sendSupportMessage(sessionId: string, message: string, isFromUser: boolean): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action: 'SUPPORT_MESSAGE',
          details: `support_chat_${sessionId}: ${message}`,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to send support message:', error);
    }
  }

  // Loan Status Updates
  async subscribeToLoanUpdates(userId: string, callback: (loan: any) => void): Promise<void> {
    const channel = supabase
      .channel(`loans_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loans',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Send notification for loan status changes
          if (payload.old.status !== payload.new.status) {
            this.sendNotification({
              type: 'system',
              title: 'Loan Status Update',
              message: `Your loan application status has been updated to: ${payload.new.status}`,
              userId: payload.new.user_id,
              priority: 'medium',
              data: { loanId: payload.new.id, newStatus: payload.new.status }
            });
          }
          
          callback({
            event: payload.eventType,
            loan: payload.new,
            oldLoan: payload.old
          });
        }
      )
      .subscribe();

    this.channels.set(`loans_${userId}`, channel);
  }

  // Bill Payment Reminders
  async scheduleBillReminder(userId: string, billId: string, dueDate: string): Promise<void> {
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before due date

    // In a real application, you would use a job scheduler
    // For now, we'll create a notification
    if (reminderDate > new Date()) {
      setTimeout(() => {
        this.sendNotification({
          type: 'system',
          title: 'Bill Payment Reminder',
          message: 'You have a bill payment due in 3 days',
          userId,
          priority: 'medium',
          data: { billId, dueDate }
        });
      }, reminderDate.getTime() - Date.now());
    }
  }

  // Connection Management
  unsubscribeFromChannel(channelName: string): void {
    const channel = this.channels.get(channelName) || this.presenceChannels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.presenceChannels.delete(channelName);
    }
  }

  unsubscribeFromAll(): void {
    [...this.channels.keys(), ...this.presenceChannels.keys()].forEach(channelName => {
      this.unsubscribeFromChannel(channelName);
    });
    
    this.notificationCallbacks = [];
    this.presenceCallbacks = [];
  }

  // Connection Status
  getConnectionStatus(): boolean {
    return supabase.realtime.isConnected();
  }

  onConnectionChange(callback: (status: boolean) => void): void {
    supabase.realtime.onOpen(() => callback(true));
    supabase.realtime.onClose(() => callback(false));
  }
}

export const realTimeService = new RealTimeService();
