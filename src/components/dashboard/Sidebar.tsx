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
    Calculator,
    Target,
    AlertCircle,
    Users,
    Activity,
    Database,
    PieChart,
    Lightbulb,
    FileText,
    Lock
} from 'lucide-react';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
    const { currentUser } = useSupabaseATM();
    const isAdmin = currentUser?.role === 'ADMIN';

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: Home, description: 'Financial overview' },
        { id: 'transactions', label: 'Transactions', icon: CreditCard, description: 'Payment history' },
        { id: 'loans', label: 'Loans', icon: TrendingUp, description: 'Borrowing & repayments' },
        { id: 'overdrafts', label: 'Overdrafts', icon: AlertCircle, description: 'Overdraft protection' },
        { id: 'credit-score', label: 'Credit Score', icon: Target, description: 'Financial health' },
        { id: 'bills', label: 'Bills', icon: Receipt, description: 'Bill payments' },
        { id: 'settings', label: 'Settings', icon: Settings, description: 'Account preferences' },
    ];

    // Add admin-specific menu items
    if (isAdmin) {
        menuItems.push(
            { id: 'admin', label: 'Admin Panel', icon: Users, description: 'User management' },
            { id: 'system-metrics', label: 'System Metrics', icon: Activity, description: 'System monitoring' },
            { id: 'analytics', label: 'Analytics', icon: PieChart, description: 'Data insights' },
            { id: 'analytics-insights', label: 'Insights', icon: Lightbulb, description: 'AI recommendations' },
            { id: 'analytics-reports', label: 'Reports', icon: FileText, description: 'Export & reports' },
            { id: 'security-dashboard', label: 'Security', icon: Lock, description: 'Advanced security' }
        );
    }

    return (
        <aside className="sidebar-sleek w-64 h-full flex flex-col py-8 px-4 space-y-4 border-r border-gray-200 dark:border-gray-700">
            {/* Logo Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 shadow-neumorphic">
                        <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            ATM Genesis
                        </h1>
                        <p className="text-xs text-muted-foreground">Banking System</p>
                        {isAdmin && (
                            <Badge className="mt-1 text-xs bg-red-500/20 text-red-400 border-red-500/30">
                                ADMIN
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-col gap-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isAdminItem = ['admin', 'system-metrics', 'analytics', 'analytics-insights', 'analytics-reports', 'security-dashboard'].includes(item.id);
                    
                    return (
                        <button
                            key={item.id}
                            className={cn(
                                'sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all duration-150',
                                'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300',
                                'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:outline-none',
                                'active:scale-95',
                                isActive && 'active bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 scale-[1.04] shadow-md',
                                isAdminItem && 'border-l-2 border-red-500/50'
                            )}
                            onClick={() => setActiveTab(item.id)}
                            tabIndex={0}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-muted-foreground'}`} />
                            <div className="flex-1 text-left">
                                <span className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {item.label}
                                </span>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Quick Stats Widget */}
            <div className="mb-6 p-4 card-modern rounded-2xl">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    Quick Stats
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Balance</span>
                        <span className="text-sm text-foreground font-medium">KES 125,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Credit Score</span>
                        <span className="text-sm text-green-400 font-medium">720</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Active Loans</span>
                        <span className="text-sm text-blue-400 font-medium">2</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                </div>
            </div>

            {/* Security Status */}
            <div className="mb-4 p-3 card-modern rounded-xl">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-muted-foreground">Secure Session</span>
                </div>
            </div>

            {/* Logout Button */}
            <div className="mt-auto pt-8">
                <button
                    className="w-full btn-secondary py-3 rounded-lg text-base font-semibold transition-all duration-150 active:scale-95"
                    onClick={onLogout}
                >
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar; 