
import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';

interface EnhancedTopNavBarProps {
  currentUser: any;
  onLogout: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

const EnhancedTopNavBar: React.FC<EnhancedTopNavBarProps> = ({
  currentUser,
  onLogout,
  onToggleSidebar,
  onToggleTheme,
  isDarkMode
}) => {
  const { mode } = useEnhancedTheme();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="banking-header"
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Welcome Message */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {currentUser?.name || 'Alex Johnson'}</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="banking-input pl-10 pr-4 py-2 w-80"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2 rounded-full">
              <Bell className="w-5 h-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-2 h-2 p-0 flex items-center justify-center animate-pulse"
              />
            </Button>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2">
            <Avatar className="banking-avatar">
              <AvatarImage src="" />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block font-medium text-foreground">
              {currentUser?.name?.split(' ')[0] || 'Alex'} J.
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default EnhancedTopNavBar;
