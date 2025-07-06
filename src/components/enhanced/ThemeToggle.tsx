
import React from 'react';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode, mode, setMode } = useEnhancedTheme();

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'auto', icon: Monitor, label: 'Auto' }
  ] as const;

  return (
    <div className="flex items-center gap-1">
      {/* Theme Mode Selector */}
      <div className={cn(
        "flex items-center rounded-lg p-1 transition-all duration-300",
        isDarkMode ? "bg-gray-800/50" : "bg-gray-100"
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
                "p-2 rounded-md transition-all duration-300",
                isActive 
                  ? cn(
                      "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg",
                      "transform scale-105"
                    )
                  : cn(
                      "hover:bg-opacity-50",
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                    )
              )}
              title={`Switch to ${theme.label} mode`}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}
      </div>
      
      {/* Quick Toggle Switch */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDarkMode}
        className={cn(
          "relative w-12 h-6 rounded-full p-0 transition-all duration-300 ml-2",
          "bg-gradient-to-r hover:shadow-lg",
          isDarkMode 
            ? "from-purple-600 to-blue-600" 
            : "from-yellow-400 to-orange-500"
        )}
        title="Quick toggle theme"
      >
        <div className={cn(
          "absolute w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md top-1",
          "flex items-center justify-center",
          isDarkMode ? "translate-x-7" : "translate-x-1"
        )}>
          {isDarkMode ? (
            <Moon className="w-2 h-2 text-purple-600" />
          ) : (
            <Sun className="w-2 h-2 text-orange-500" />
          )}
        </div>
      </Button>
    </div>
  );
};

export default ThemeToggle;
