import React from 'react';
import { User } from '../../types/atm';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import { Menu, Bell, User as UserIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import NotificationBell from '../notifications/NotificationBell';
import PresenceIndicator from '../presence/PresenceIndicator';
import DashboardQuickActions from './DashboardQuickActions';

interface DashboardTopBarProps {
  currentUser: User | null;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onShowMpesa: () => void;
  onShowBiometric: () => void;
  onShowQRCode: () => void;
}

const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  currentUser,
  isSidebarOpen,
  setIsSidebarOpen,
  onShowMpesa,
  onShowBiometric,
  onShowQRCode,
}) => {
  const { isDarkMode } = useEnhancedTheme();

  return (
    <div className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      isDarkMode 
        ? "bg-dark-surface/80 backdrop-blur-xl border-b border-dark-border/20" 
        : "bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm"
    )}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "lg:hidden p-2 rounded-xl transition-all duration-300",
              "hover:bg-muted/50 hover:scale-105",
              isDarkMode ? "hover:bg-dark-surface/50" : "hover:bg-neutral-100"
            )}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Welcome Message */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NexusBank
            </h1>
            <p className={cn(
              "text-sm transition-colors duration-300",
              isDarkMode ? "text-muted-foreground" : "text-neutral-600"
            )}>
              Welcome back, {currentUser?.name || 'Alex Johnson'}
            </p>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className={cn(
            "relative w-full",
            isDarkMode ? "bg-dark-surface/50" : "bg-neutral-50"
          )}>
            <Search className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
              isDarkMode ? "text-muted-foreground" : "text-neutral-500"
            )} />
            <input
              type="text"
              placeholder="Search transactions, bills, loans..."
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-xl border-0 outline-none transition-all duration-300",
                "placeholder:text-muted-foreground",
                isDarkMode 
                  ? "bg-dark-surface/50 text-white focus:bg-dark-surface focus:ring-2 focus:ring-primary/20" 
                  : "bg-neutral-50 text-neutral-900 focus:bg-white focus:ring-2 focus:ring-primary/20"
              )}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <DashboardQuickActions
            onShowMpesa={onShowMpesa}
            onShowBiometric={onShowBiometric}
            onShowQRCode={onShowQRCode}
          />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                "hover:bg-muted/50 hover:scale-105",
                isDarkMode ? "hover:bg-dark-surface/50" : "hover:bg-neutral-100"
              )}
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-error text-white text-xs">
                3
              </Badge>
            </Button>
          </div>

          {/* Presence Indicator */}
          <PresenceIndicator roomId="dashboard" />

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg",
              "bg-gradient-to-br from-primary to-secondary transition-all duration-300 hover:scale-105"
            )}>
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block">
              <p className={cn(
                "font-semibold transition-colors duration-300",
                isDarkMode ? "text-white" : "text-neutral-900"
              )}>
                {currentUser?.name?.split(' ')[0] || 'User'}
              </p>
              <p className={cn(
                "text-xs transition-colors duration-300",
                isDarkMode ? "text-muted-foreground" : "text-neutral-500"
              )}>
                {currentUser?.role || 'Customer'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopBar;
