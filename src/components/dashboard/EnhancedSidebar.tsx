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
    Lightbulb,
    FileText,
    Lock,
    ChevronLeft,
    Bell
} from 'lucide-react';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';
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
    const isAdmin = currentUser?.role === 'ADMIN';

    const menuItems = [
        { 
            id: 'overview', 
            label: 'Dashboard', 
            icon: Home, 
            description: 'Account overview',
            badge: null
        },
        { 
            id: 'transactions', 
            label: 'Transactions', 
            icon: CreditCard, 
            description: 'Payment history',
            badge: '3'
        },
        { 
            id: 'loans', 
            label: 'Loans', 
            icon: TrendingUp, 
            description: 'Borrowing & repayments',
            badge: null
        },
        { 
            id: 'overdrafts', 
            label: 'Overdrafts', 
            icon: AlertCircle, 
            description: 'Overdraft protection',
            badge: null
        },
        { 
            id: 'credit-score', 
            label: 'Credit Score', 
            icon: Target, 
            description: 'Financial health',
            badge: 'NEW'
        },
        { 
            id: 'bills', 
            label: 'Bills', 
            icon: Receipt, 
            description: 'Bill payments',
            badge: '2'
        },
        { 
            id: 'settings', 
            label: 'Settings', 
            icon: Settings, 
            description: 'Account preferences',
            badge: null
        },
    ];

    const adminItems = [
        { 
            id: 'admin', 
            label: 'Admin Panel', 
            icon: Users, 
            description: 'User management',
            badge: null
        },
        { 
            id: 'system-metrics', 
            label: 'System Metrics', 
            icon: Activity, 
            description: 'System monitoring',
            badge: 'LIVE'
        },
        { 
            id: 'analytics', 
            label: 'Analytics', 
            icon: PieChart, 
            description: 'Data insights',
            badge: null
        },
        { 
            id: 'security-dashboard', 
            label: 'Security', 
            icon: Lock, 
            description: 'Advanced security',
            badge: '!'
        }
    ];

    const allMenuItems = isAdmin ? [...menuItems, ...adminItems] : menuItems;

    return (
        <aside className={cn(
            'banking-sidebar flex flex-col transition-all duration-300 z-40',
            isCollapsed ? 'w-20' : 'w-80'
        )}>
            {/* Header Section */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="p-3 rounded-2xl gradient-blue-green shadow-lg">
                                    <Wallet className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#F1F1F1] tracking-tight">
                                    ATM Genesis
                                </h1>
                                <p className="text-sm text-gray-400">Modern Banking</p>
                                {isAdmin && (
                                    <Badge className="mt-1 bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                        ADMINISTRATOR
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                    {onToggleCollapse && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleCollapse}
                            className="p-2 rounded-xl hover:bg-white/10"
                        >
                            <ChevronLeft className={cn(
                                "w-5 h-5 transition-transform duration-300",
                                isCollapsed && "rotate-180"
                            )} />
                        </Button>
                    )}
                </div>
            </div>

            {/* User Profile Section */}
            {!isCollapsed && (
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full gradient-blue-green flex items-center justify-center text-white font-bold text-lg">
                                {currentUser?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0E0E0E]"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[#F1F1F1] font-semibold truncate">
                                {currentUser?.name || 'User'}
                            </p>
                            <p className="text-gray-400 text-sm truncate">
                                {currentUser?.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-400">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Menu */}
            <div className="flex-1 py-6 custom-scrollbar overflow-y-auto">
                <nav className="space-y-2 px-3">
                    {allMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        const isAdminItem = adminItems.some(admin => admin.id === item.id);
                        
                        return (
                            <button
                                key={item.id}
                                className={cn(
                                    'sidebar-nav-item w-full group',
                                    isActive && 'active',
                                    isAdminItem && 'border-l-2 border-red-500/30'
                                )}
                                onClick={() => setActiveTab(item.id)}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="relative">
                                    <Icon className={cn(
                                        "w-6 h-6 transition-all duration-300",
                                        isActive ? 'text-blue-400 scale-110' : 'text-gray-400 group-hover:text-white'
                                    )} />
                                    {item.badge && (
                                        <Badge className={cn(
                                            "absolute -top-2 -right-2 text-xs px-1.5 py-0.5 min-w-0 h-auto",
                                            item.badge === 'NEW' && "bg-green-500/20 text-green-400 border-green-500/30",
                                            item.badge === 'LIVE' && "bg-red-500/20 text-red-400 border-red-500/30",
                                            item.badge === '!' && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                                            typeof item.badge === 'string' && /^\d+$/.test(item.badge) && "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                        )}>
                                            {item.badge}
                                        </Badge>
                                    )}
                                </div>
                                
                                {!isCollapsed && (
                                    <div className="flex-1 text-left min-w-0">
                                        <div className={cn(
                                            "font-medium transition-colors duration-300",
                                            isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                        )}>
                                            {item.label}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                                            {item.description}
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Quick Stats Widget */}
            {!isCollapsed && (
                <div className="p-6 border-t border-white/10">
                    <div className="banking-card p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                        <h3 className="text-sm font-semibold text-[#F1F1F1] mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            Quick Overview
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Balance</span>
                                <span className="text-sm font-bold text-green-400">
                                    KES {(currentUser?.balance || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Credit Score</span>
                                <span className="text-sm font-bold text-blue-400">
                                    {currentUser?.creditScore || 400}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Active Loans</span>
                                <span className="text-sm font-bold text-yellow-400">2</span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Financial Health</span>
                                    <span>78%</span>
                                </div>
                                <div className="credit-score-bar">
                                    <div 
                                        className="credit-score-progress" 
                                        style={{ width: '78%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Section */}
            <div className="p-6 border-t border-white/10">
                <Button
                    className={cn(
                        "w-full btn-banking-secondary justify-start gap-3",
                        isCollapsed && "justify-center"
                    )}
                    onClick={onLogout}
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && "Sign Out"}
                </Button>
            </div>
        </aside>
    );
};

export default EnhancedSidebar;
