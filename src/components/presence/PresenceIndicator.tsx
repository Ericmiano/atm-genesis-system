
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import { cn } from '@/lib/utils';

const PresenceIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isDarkMode } = useEnhancedTheme();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 rounded-full text-xs transition-all duration-300",
      isOnline 
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    )}>
      {isOnline ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      <span className="font-medium">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default PresenceIndicator;
