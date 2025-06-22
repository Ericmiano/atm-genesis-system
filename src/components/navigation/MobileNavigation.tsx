import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  Settings, 
  Menu,
  Wallet,
  Target,
  AlertCircle,
  Users,
  Activity,
  X,
  Sun,
  Moon,
  Contrast,
  PieChart,
  Lightbulb,
  FileText,
  Lock
} from 'lucide-react';
import { useSupabaseATM } from '@/contexts/SupabaseATMContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'high-contrast' : 'light';
  const icon = theme === 'light' ? <Moon className="w-5 h-5" /> : theme === 'dark' ? <Contrast className="w-5 h-5" /> : <Sun className="w-5 h-5" />;
  const label = theme === 'light' ? 'Dark mode' : theme === 'dark' ? 'High contrast' : 'Light mode';
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${label}`}
      onClick={() => setTheme(nextTheme)}
      className="mx-1"
    >
      {icon}
    </Button>
  );
};

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  onLogout 
}) => {
  const { currentUser } = useSupabaseATM();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isAdmin = currentUser?.role === 'ADMIN';

  const menuItems = [
    { id: 'overview', label: 'Home', icon: Home, description: 'Dashboard' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, description: 'History' },
    { id: 'loans', label: 'Loans', icon: TrendingUp, description: 'Borrowing' },
    { id: 'bills', label: 'Bills', icon: Receipt, description: 'Payments' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Account' },
  ];

  const adminItems = [
    { id: 'admin', label: 'Admin', icon: Users, description: 'Management' },
    { id: 'system-metrics', label: 'Metrics', icon: Activity, description: 'System' },
    { id: 'analytics', label: 'Analytics', icon: PieChart, description: 'Data insights' },
    { id: 'analytics-insights', label: 'Insights', icon: Lightbulb, description: 'AI recommendations' },
    { id: 'analytics-reports', label: 'Reports', icon: FileText, description: 'Export & reports' },
    { id: 'security-dashboard', label: 'Security', icon: Lock, description: 'Advanced security' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center justify-center h-12 w-12 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 scale-[1.08] shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/10",
                  "active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:outline-none"
                )}
                onClick={() => handleTabChange(item.id)}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
          
          {/* More menu button */}
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center justify-center h-12 w-12 rounded-lg transition-all duration-200",
                  activeTab === 'settings' || activeTab === 'admin' || activeTab === 'system-metrics'
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                <Menu className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">More</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-green-500">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">ATM Genesis</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Banking System</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {/* Settings */}
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-12 px-4",
                      activeTab === 'settings' && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    )}
                    onClick={() => handleTabChange('settings')}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Settings</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Account preferences</div>
                    </div>
                  </Button>

                  {/* Admin Items */}
                  {isAdmin && adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-12 px-4 border-l-2 border-red-500/50",
                          activeTab === item.id && "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        )}
                        onClick={() => handleTabChange(item.id)}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                        </div>
                        <Badge className="ml-auto text-xs bg-red-500/20 text-red-400 border-red-500/30">
                          ADMIN
                        </Badge>
                      </Button>
                    );
                  })}

                  {/* Additional Features */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 px-4">
                      Additional Features
                    </h3>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 px-4"
                      onClick={() => handleTabChange('overdrafts')}
                    >
                      <AlertCircle className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Overdrafts</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Protection settings</div>
                      </div>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 px-4"
                      onClick={() => handleTabChange('credit-score')}
                    >
                      <Target className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Credit Score</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Financial health</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 px-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      onLogout();
                      setIsDrawerOpen(false);
                    }}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <span className="font-medium">Logout</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-green-500">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">ATM Genesis</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentUser?.name || 'Welcome'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {isAdmin && (
              <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                ADMIN
              </Badge>
            )}
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Mobile Content Padding */}
      <div className="md:hidden pt-16 pb-20"></div>
    </>
  );
};

export default MobileNavigation; 