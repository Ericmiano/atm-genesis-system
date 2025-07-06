
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  Settings, 
  LogOut,
  Shield,
  AlertCircle,
  Target,
  X
} from 'lucide-react';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import { cn } from '@/lib/utils';

interface EnhancedSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  isCollapsed 
}) => {
  const { currentUser } = useSupabaseATM();
  const { isDarkMode } = useEnhancedTheme();
  const isAdmin = currentUser?.role === 'ADMIN';

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Home, description: 'Overview & insights' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, description: 'Payment history' },
    { id: 'loans', label: 'Loans', icon: TrendingUp, description: 'Credit & lending' },
    { id: 'overdrafts', label: 'Overdrafts', icon: AlertCircle, description: 'Account protection' },
    { id: 'credit-score', label: 'Credit Score', icon: Target, description: 'Financial health' },
    { id: 'bills', label: 'Bills', icon: Receipt, description: 'Bill management' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Account settings' },
  ];

  // Add admin menu item only for administrators
  if (isAdmin) {
    menuItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: Shield,
      description: 'System administration'
    });
  }

  return (
    <div className={cn(
      "h-full flex flex-col transition-all duration-300 border-r relative",
      "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
      "border-gray-200/50 dark:border-gray-700/50",
      isCollapsed ? "w-16" : "w-64 sm:w-72"
    )}>
      {/* Mobile Close Button */}
      <div className="lg:hidden absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.dispatchEvent(new CustomEvent('closeSidebar'))}
          className="p-1 h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                NexusBank
              </h1>
              <p className="text-xs text-muted-foreground">Banking System</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm sm:text-base">{currentUser?.name || 'User'}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                {isAdmin && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5 hidden sm:inline-flex">
                    ADMIN
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex-1 p-2 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAdminItem = item.id === 'admin';
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => {
                setActiveTab(item.id);
                // Close mobile sidebar on selection
                if (window.innerWidth < 1024) {
                  window.dispatchEvent(new CustomEvent('closeSidebar'));
                }
              }}
              className={cn(
                "w-full justify-start gap-3 h-10 sm:h-12 transition-all duration-200 text-left",
                "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                isActive && "bg-gradient-to-r from-pink-500/10 to-purple-600/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800",
                isAdminItem && "border-l-2 border-red-500/50",
                isCollapsed && "px-2 sm:px-3"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0",
                isActive ? "text-pink-600 dark:text-pink-400" : "text-gray-500"
              )} />
              {!isCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-sm sm:text-base truncate">{item.label}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block truncate">{item.description}</div>
                </div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="p-2 sm:p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-3 space-y-2">
            <h4 className="text-sm font-semibold text-pink-600 dark:text-pink-400">Quick Stats</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-semibold">KES {currentUser?.balance?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span className="font-mono text-xs">{currentUser?.accountNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-2 sm:p-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <Button
          variant="destructive"
          onClick={onLogout}
          className={cn(
            "w-full justify-start gap-3 h-10 sm:h-12",
            isCollapsed && "px-2 sm:px-3"
          )}
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm sm:text-base">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedSidebar;
