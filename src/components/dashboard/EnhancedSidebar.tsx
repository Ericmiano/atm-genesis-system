
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
    Wallet,
    BarChart3,
    Shield,
    Target,
    AlertCircle,
    Users,
    Activity,
    PieChart,
    FileText,
    Lock,
    Bell,
    Headphones
} from 'lucide-react';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import { cn } from '@/lib/utils';

interface EnhancedSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
    activeTab, 
    setActiveTab, 
    onLogout,
    isCollapsed = false,
    onToggleCollapse
}) => {
    const { currentUser } = useSupabaseATM();
    const { isDarkMode, toggleDarkMode } = useEnhancedTheme();
    const isAdmin = currentUser?.role === 'ADMIN';

    const menuItems = [
        { 
            id: 'overview', 
            label: 'Dashboard', 
            icon: Home, 
            description: 'Account overview'
        },
        { 
            id: 'transactions', 
            label: 'Transactions', 
            icon: CreditCard, 
            description: 'Payment history'
        },
        { 
            id: 'loans', 
            label: 'Loans', 
            icon: TrendingUp, 
            description: 'Borrowing & repayments'
        },
        { 
            id: 'bills', 
            label: 'Bills', 
            icon: Receipt, 
            description: 'Bill payments'
        },
        { 
            id: 'analytics', 
            label: 'Analytics', 
            icon: PieChart, 
            description: 'Data insights'
        },
        { 
            id: 'settings', 
            label: 'Settings', 
            icon: Settings, 
            description: 'Account preferences'
        },
    ];

    const adminItems = [
        { 
            id: 'admin', 
            label: 'Admin Panel', 
            icon: Users, 
            description: 'User management'
        },
        { 
            id: 'system-metrics', 
            label: 'System Metrics', 
            icon: Activity, 
            description: 'System monitoring'
        },
        { 
            id: 'security', 
            label: 'Security', 
            icon: Lock, 
            description: 'Security settings'
        }
    ];

    const allMenuItems = isAdmin ? [...menuItems, ...adminItems] : menuItems;

    return (
        <aside className="banking-sidebar w-64 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border/50">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <span className="text-xl font-bold text-foreground">NexusBank</span>
                        {isAdmin && (
                            <Badge className="ml-2 bg-red-500/20 text-red-600 border-red-500/30 text-xs">
                                ADMIN
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {allMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isAdminItem = adminItems.some(admin => admin.id === item.id);
                    
                    return (
                        <button
                            key={item.id}
                            className={cn(
                                'nav-item w-full',
                                isActive && 'active',
                                isAdminItem && 'border-l-2 border-red-500/30 ml-2'
                            )}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Theme Toggle & Support */}
            <div className="p-4 border-t border-border/50 space-y-4">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Dark Mode</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleDarkMode}
                        className="relative w-11 h-6 bg-muted rounded-full p-0 transition-colors duration-300 data-[state=checked]:bg-primary"
                    >
                        <div className={cn(
                            "absolute w-4 h-4 bg-background rounded-full transition-transform duration-300 shadow-sm top-1",
                            isDarkMode ? "translate-x-6" : "translate-x-1"
                        )} />
                    </Button>
                </div>

                {/* Support Button */}
                <Button className="w-full btn-primary">
                    <Headphones className="w-4 h-4 mr-2" />
                    Support
                </Button>

                {/* Logout Button */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={onLogout}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </aside>
    );
};

export default EnhancedSidebar;
