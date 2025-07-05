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
    <div className="flex items-center gap-2">
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
              "relative p-2 rounded-xl transition-all duration-300 group",
              "hover:scale-105 hover:shadow-lg",
              isActive 
                ? cn(
                    "bg-gradient-to-r from-primary/10 to-secondary/10",
                    "border border-primary/20 text-primary font-semibold",
                    "shadow-lg shadow-primary/10"
                  )
                : cn(
                    "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )
            )}
            title={`Switch to ${theme.label} mode`}
          >
            <div className={cn(
              "p-1.5 rounded-lg transition-colors duration-300",
              isActive 
                ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg" 
                : "group-hover:bg-muted/50"
            )}>
              <Icon className="w-4 h-4" />
            </div>
          </Button>
        );
      })}
      
      {/* Quick Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDarkMode}
        className={cn(
          "relative w-12 h-6 rounded-full p-0 transition-all duration-300",
          "bg-gradient-to-r from-primary to-secondary shadow-lg",
          "hover:scale-105 hover:shadow-xl"
        )}
        title="Quick toggle theme"
      >
        <div className={cn(
          "absolute w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md top-1",
          isDarkMode ? "translate-x-7" : "translate-x-1"
        )} />
      </Button>
    </div>
  );
};

export default ThemeToggle;
