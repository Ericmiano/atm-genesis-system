
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'high-contrast';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      return saved || 'dark'; // Default to dark mode
    }
    return 'dark';
  });

  const isDarkMode = theme === 'dark';

  const toggleDarkMode = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const setDarkMode = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'light', 'high-contrast');
    
    // Add current theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'high-contrast') {
      document.documentElement.classList.add('high-contrast');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      setDarkMode,
      theme,
      setTheme: handleSetTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
