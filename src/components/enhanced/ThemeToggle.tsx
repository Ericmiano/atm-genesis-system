
import React from 'react';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, mode, setMode } = useEnhancedTheme();

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'auto', icon: Monitor, label: 'System' }
  ] as const;

  return (
    <div className={cn(
      "flex items-center rounded-lg p-1 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
    )}>
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isActive = mode === theme.id;
        
        return (
          <Button
            key={theme.id}
            variant="ghost"
            size="sm"
            onClick={() => setMode(theme.id)}
            className={cn(
              "p-2 rounded-md transition-all duration-300 h-8 w-8",
              isActive 
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md scale-105"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}
            title={`Switch to ${theme.label} mode`}
          >
            <Icon className="w-4 h-4" />
          </Button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
