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
            description: 'Account overview',
            color: 'primary'
        },
        { 
            id: 'transactions', 
            label: 'Transactions', 
            icon: CreditCard, 
            description: 'Payment history',
            color: 'secondary'
        },
        { 
            id: 'loans', 
            label: 'Loans', 
            icon: TrendingUp, 
            description: 'Borrowing & repayments',
            color: 'accent'
        },
        { 
            id: 'bills', 
            label: 'Bills', 
            icon: Receipt, 
            description: 'Bill payments',
            color: 'success'
        },
        { 
            id: 'analytics', 
            label: 'Analytics', 
            icon: PieChart, 
            description: 'Data insights',
            color: 'warning'
        },
        { 
            id: 'settings', 
            label: 'Settings', 
            icon: Settings, 
            description: 'Account preferences',
            color: 'error'
        },
    ];

    const adminItems = [
        { 
            id: 'admin', 
            label: 'Admin Panel', 
            icon: Users, 
            description: 'User management',
            color: 'primary'
        },
        { 
            id: 'system-metrics', 
            label: 'System Metrics', 
            icon: Activity, 
            description: 'System monitoring',
            color: 'secondary'
        },
        { 
            id: 'security', 
            label: 'Security', 
            icon: Lock, 
            description: 'Security settings',
            color: 'accent'
        }
    ];

    const allMenuItems = isAdmin ? [...menuItems, ...adminItems] : menuItems;

    return (
        <aside className={cn(
            "w-64 flex flex-col transition-all duration-300",
            isDarkMode 
                ? "bg-dark-surface border-r border-dark-border/20" 
                : "bg-white border-r border-neutral-200/50 shadow-lg"
        )}>
            {/* Header */}
            <div className={cn(
                "p-6 border-b transition-colors duration-300",
                isDarkMode ? "border-dark-border/20" : "border-neutral-200/50"
            )}>
                <div className="flex items-center space-x-3">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                        "bg-gradient-to-br from-primary to-secondary"
                    )}>
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            NexusBank
                        </h1>
                        {isAdmin && (
                            <Badge className="mt-1 bg-error/10 text-error border-error/20 text-xs font-medium">
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
                                'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                                'hover:shadow-md hover:scale-[1.02]',
                                isActive 
                                    ? cn(
                                        'bg-gradient-to-r from-primary/10 to-secondary/10',
                                        'border border-primary/20 text-primary font-semibold',
                                        'shadow-lg shadow-primary/10'
                                    )
                                    : cn(
                                        'hover:bg-muted/50 text-muted-foreground hover:text-foreground',
                                        isDarkMode ? 'hover:bg-dark-surface/50' : 'hover:bg-neutral-50'
                                    ),
                                isAdminItem && 'border-l-2 border-error/30 ml-2'
                            )}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <div className={cn(
                                'p-2 rounded-lg transition-colors duration-300',
                                isActive 
                                    ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg' 
                                    : cn(
                                        'group-hover:bg-muted/50',
                                        isDarkMode ? 'group-hover:bg-dark-surface/50' : 'group-hover:bg-neutral-100'
                                    )
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Theme Toggle & Support */}
            <div className={cn(
                "p-4 border-t transition-colors duration-300",
                isDarkMode ? "border-dark-border/20" : "border-neutral-200/50"
            )}>
                <div className="space-y-4">
                    {/* Dark Mode Toggle */}
                    <div className={cn(
                        "flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                        isDarkMode 
                            ? "bg-dark-surface/50 border border-dark-border/20" 
                            : "bg-neutral-50 border border-neutral-200/50"
                    )}>
                        <div className="flex items-center space-x-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isDarkMode ? "bg-primary" : "bg-secondary"
                            )} />
                            <span className="text-sm font-medium text-muted-foreground">Theme</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleDarkMode}
                            className={cn(
                                "relative w-12 h-6 rounded-full p-0 transition-all duration-300",
                                "bg-gradient-to-r from-primary to-secondary shadow-lg"
                            )}
                        >
                            <div className={cn(
                                "absolute w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md top-1",
                                isDarkMode ? "translate-x-7" : "translate-x-1"
                            )} />
                        </Button>
                    </div>

                    {/* Support Button */}
                    <Button className={cn(
                        "w-full transition-all duration-300 hover:scale-[1.02]",
                        "bg-gradient-to-r from-primary to-secondary text-white shadow-lg",
                        "hover:shadow-xl hover:shadow-primary/25"
                    )}>
                        <Headphones className="w-4 h-4 mr-2" />
                        Support
                    </Button>

                    {/* Logout Button */}
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full transition-all duration-300 hover:scale-[1.02]",
                            "border-error/20 text-error hover:bg-error/10",
                            "hover:border-error/30 hover:shadow-lg"
                        )}
                        onClick={onLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </aside>
    );
};

export default EnhancedSidebar;
