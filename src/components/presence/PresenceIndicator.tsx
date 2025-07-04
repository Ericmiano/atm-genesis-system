
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { realTimeService, PresenceData } from '@/services/realTimeService';
import { useSupabaseATM } from '@/contexts/SupabaseATMContext';

interface PresenceIndicatorProps {
  roomId?: string;
  showUserList?: boolean;
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ 
  roomId = 'main', 
  showUserList = false 
}) => {
  const [presenceList, setPresenceList] = useState<PresenceData[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const { currentUser } = useSupabaseATM();

  useEffect(() => {
    if (!currentUser) return;

    // Monitor connection status
    realTimeService.onConnectionChange(setIsConnected);

    // Subscribe to presence updates
    realTimeService.subscribeToPresence(roomId, setPresenceList);

    // Update our own presence
    const updatePresence = () => {
      if (currentUser) {
        realTimeService.updatePresence(roomId, {
          userId: currentUser.id,
          username: currentUser.name,
          status: 'online',
          lastSeen: new Date().toISOString(),
          sessionId: `session_${Date.now()}`
        });
      }
    };

    updatePresence();

    // Update presence every 30 seconds
    const interval = setInterval(updatePresence, 30000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        realTimeService.updatePresence(roomId, {
          userId: currentUser.id,
          username: currentUser.name,
          status: 'away',
          lastSeen: new Date().toISOString()
        });
      } else {
        updatePresence();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      realTimeService.removePresence(roomId);
      realTimeService.unsubscribeFromChannel(`presence_${roomId}`);
    };
  }, [currentUser, roomId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const onlineUsers = presenceList.filter(user => user.status === 'online');
  const totalUsers = presenceList.length;

  return (
    <div className="flex items-center gap-3">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* User Count */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-400" />
        <Badge variant="secondary" className="bg-gray-700 text-gray-200">
          {onlineUsers.length} online
        </Badge>
      </div>

      {/* User List */}
      {showUserList && totalUsers > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white mb-2">
                Active Users ({totalUsers})
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {presenceList.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 p-1 rounded"
                  >
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}>
                      {user.status === 'online' && (
                        <motion.div
                          className="w-2 h-2 rounded-full bg-green-500"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-gray-300 truncate">
                      {user.username}
                      {user.userId === currentUser?.id && (
                        <span className="text-blue-400 ml-1">(You)</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {user.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PresenceIndicator;
