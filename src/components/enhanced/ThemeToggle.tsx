
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ThemeToggle: React.FC = () => {
  const { mode, setMode, isDarkMode } = useEnhancedTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find(theme => theme.value === mode) || themes[1];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-2 rounded-xl transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white'
              : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700 hover:text-gray-900'
          }`}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDarkMode ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <CurrentIcon className="w-4 h-4" />
          </motion.div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={`${
          isDarkMode 
            ? 'bg-gray-800/95 border-gray-700/50 text-gray-100' 
            : 'bg-white/95 border-gray-200/50 text-gray-900'
        } backdrop-blur-md shadow-xl`}
      >
        {themes.map((theme) => {
          const Icon = theme.icon;
          return (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => setMode(theme.value as any)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-all duration-200 ${
                mode === theme.value
                  ? isDarkMode
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                  : isDarkMode
                    ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{theme.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
