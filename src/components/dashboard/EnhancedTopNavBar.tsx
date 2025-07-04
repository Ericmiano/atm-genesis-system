
import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Menu, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '../enhanced/ThemeToggle';
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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`banking-topnav sticky top-0 z-50 ${
        isDarkMode
          ? 'bg-gray-900/80 border-gray-800/50'
          : 'bg-white/80 border-gray-200/50'
      } backdrop-blur-xl border-b transition-all duration-300`}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
              isDarkMode
                ? 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100/50 text-gray-700 hover:text-gray-900'
            }`}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative">
            <Search className={`absolute left-3 w-4 h-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search transactions, accounts..."
              className={`input-banking pl-10 pr-4 py-2 w-80 text-sm ${
                isDarkMode
                  ? 'bg-gray-800/50 border-gray-700/50 text-gray-200 placeholder-gray-400'
                  : 'bg-gray-50/50 border-gray-200/50 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50`}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              variant="ghost"
              size="sm"
              className={`relative p-2 rounded-xl transition-all duration-200 ${
                isDarkMode
                  ? 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100/50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0 animate-pulse"
              >
                3
              </Badge>
            </Button>
          </motion.div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  className={`flex items-center gap-2 p-2 rounded-xl transition-all duration-200 ${
                    isDarkMode
                      ? 'hover:bg-gray-800/50'
                      : 'hover:bg-gray-100/50'
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className={`text-xs font-semibold ${
                      isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className={`text-sm font-semibold ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {currentUser?.name || 'User'}
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {currentUser?.email || 'user@example.com'}
                    </div>
                  </div>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className={`w-56 ${
                isDarkMode 
                  ? 'bg-gray-800/95 border-gray-700/50 text-gray-100' 
                  : 'bg-white/95 border-gray-200/50 text-gray-900'
              } backdrop-blur-md shadow-xl`}
            >
              <DropdownMenuLabel className={`${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={`${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200/50'
              }`} />
              <DropdownMenuItem className={`flex items-center gap-2 cursor-pointer ${
                isDarkMode
                  ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}>
                <User className="w-4 h-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className={`flex items-center gap-2 cursor-pointer ${
                isDarkMode
                  ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className={`${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200/50'
              }`} />
              <DropdownMenuItem 
                onClick={onLogout}
                className={`flex items-center gap-2 cursor-pointer ${
                  isDarkMode
                    ? 'hover:bg-red-600/20 text-red-400 hover:text-red-300'
                    : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default EnhancedTopNavBar;
