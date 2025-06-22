import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
    Bell, 
    Search, 
    User, 
    Settings, 
    LogOut,
    ChevronDown,
    Globe,
    Moon,
    Sun,
    Contrast
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';
import { useTheme } from '../../contexts/ThemeContext';

interface DashboardHeaderProps {
    currentUser: any;
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
            className="mx-2"
        >
            {icon}
        </Button>
    );
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentUser, onLogout }) => {
    const [notifications] = useState(3);
    const { language, setLanguage } = useSupabaseATM();
    const { isDarkMode, toggleDarkMode } = useTheme();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' }
    ];

    const currentLanguage = languages.find(lang => lang.code === language);

    return (
        <header className="header-modern h-16 px-6 flex items-center justify-between fixed top-0 left-64 right-0 z-40">
            {/* Left Section - Welcome Message */}
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">
                        Welcome back, {currentUser?.name || 'User'}!
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <ThemeSwitcher />

                {/* Language Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span className="text-lg">{currentLanguage?.flag}</span>
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {languages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => setLanguage(lang.code as any)}
                                className="flex items-center gap-3"
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span>{lang.name}</span>
                                {language === lang.code && (
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                        Active
                                    </Badge>
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative w-10 h-10 p-0 rounded-full">
                    <Bell className="w-5 h-5" />
                    {notifications > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {notifications}
                        </Badge>
                    )}
                </Button>

                {/* User Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3 p-2">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={currentUser?.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-sm font-medium">
                                    {currentUser?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-foreground">
                                    {currentUser?.name || 'User'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {currentUser?.role || 'Customer'}
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center gap-3">
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={onLogout}
                            className="flex items-center gap-3 text-red-600 focus:text-red-600"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default DashboardHeader; 