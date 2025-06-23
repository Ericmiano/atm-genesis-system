
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Bell, 
    Search, 
    Settings, 
    LogOut, 
    Menu,
    Globe,
    Moon,
    Sun,
    ChevronDown,
    User,
    CreditCard,
    Shield,
    HelpCircle
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';

interface EnhancedTopNavBarProps {
    onToggleSidebar?: () => void;
    onLogout: () => void;
}

const EnhancedTopNavBar: React.FC<EnhancedTopNavBarProps> = ({ 
    onToggleSidebar, 
    onLogout 
}) => {
    const { currentUser } = useSupabaseATM();
    const [notifications] = useState([
        { id: 1, text: 'New transaction: KES 5,000 deposited', unread: true },
        { id: 2, text: 'Loan payment due in 3 days', unread: true },
        { id: 3, text: 'Credit score improved by 15 points', unread: false },
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <header className="banking-topnav">
            <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    {onToggleSidebar && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden p-2 rounded-xl hover:bg-white/10"
                            onClick={onToggleSidebar}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                    )}

                    {/* Search Bar */}
                    <div className="hidden md:flex relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search transactions, bills..."
                            className="input-banking pl-10 w-80 bg-[#0E0E0E]/50 border-white/10 focus:border-blue-500/50"
                        />
                    </div>
                </div>

                {/* Center Section - Welcome Message */}
                <div className="hidden lg:block">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-[#F1F1F1]">
                            Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Language Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10">
                                <Globe className="w-4 h-4" />
                                <span className="text-sm">EN</span>
                                <ChevronDown className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="modal-banking border-white/20">
                            <DropdownMenuItem className="flex items-center gap-2 hover:bg-white/10">
                                <span>🇺🇸</span> English
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 hover:bg-white/10">
                                <span>🇰🇪</span> Swahili
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="relative p-2 rounded-xl hover:bg-white/10">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <Badge className="notification-badge">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="modal-banking border-white/20 w-80">
                            <div className="p-3 border-b border-white/10">
                                <h3 className="font-semibold text-[#F1F1F1]">Notifications</h3>
                                <p className="text-sm text-gray-400">{unreadCount} unread messages</p>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <DropdownMenuItem 
                                        key={notification.id}
                                        className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${
                                                notification.unread ? 'bg-blue-500' : 'bg-gray-600'
                                            }`} />
                                            <div className="flex-1">
                                                <p className="text-sm text-[#F1F1F1]">{notification.text}</p>
                                                <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                            <div className="p-3 border-t border-white/10">
                                <Button variant="ghost" size="sm" className="w-full text-blue-400 hover:bg-blue-500/10">
                                    View all notifications
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full gradient-blue-green flex items-center justify-center text-white font-semibold text-sm">
                                        {currentUser?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-[#1F1F1F]"></div>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-[#F1F1F1]">
                                        {currentUser?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {currentUser?.role === 'ADMIN' ? 'Administrator' : 'Account Holder'}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="modal-banking border-white/20 w-64" align="end">
                            <div className="p-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full gradient-blue-green flex items-center justify-center text-white font-bold">
                                        {currentUser?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-[#F1F1F1]">{currentUser?.name}</p>
                                        <p className="text-sm text-gray-400">{currentUser?.email}</p>
                                        <Badge className="mt-1 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                            {currentUser?.role === 'ADMIN' ? 'Administrator' : 'Verified'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            
                            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/5">
                                <User className="w-4 h-4" />
                                <span>Profile Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/5">
                                <CreditCard className="w-4 h-4" />
                                <span>Account Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/5">
                                <Shield className="w-4 h-4" />
                                <span>Security & Privacy</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/5">
                                <Settings className="w-4 h-4" />
                                <span>Preferences</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-white/10" />
                            
                            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/5">
                                <HelpCircle className="w-4 h-4" />
                                <span>Help & Support</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-white/10" />
                            
                            <DropdownMenuItem 
                                className="flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-400"
                                onClick={onLogout}
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default EnhancedTopNavBar;
