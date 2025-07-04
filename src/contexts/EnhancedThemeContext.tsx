
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'auto';
type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';

interface EnhancedThemeContextType {
  mode: ThemeMode;
  accentColor: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isHighContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);

export function EnhancedThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enhanced-theme-mode') as ThemeMode;
      return saved || 'dark';
    }
    return 'dark';
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enhanced-accent-color') as AccentColor;
      return saved || 'blue';
    }
    return 'blue';
  });

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enhanced-font-size') as 'small' | 'medium' | 'large';
      return saved || 'medium';
    }
    return 'medium';
  });

  // Calculate isDarkMode based on mode and system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (mode === 'auto' && typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return mode === 'dark';
  });

  const isHighContrast = mode === 'high-contrast';

  const toggleDarkMode = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setMode(newMode);
  };

  // Update isDarkMode when mode changes or system preference changes
  useEffect(() => {
    if (mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };
      
      setIsDarkMode(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setIsDarkMode(mode === 'dark');
    }
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('enhanced-theme-mode', mode);
    localStorage.setItem('enhanced-accent-color', accentColor);
    localStorage.setItem('enhanced-font-size', fontSize);
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'light', 'high-contrast', 'auto');
    document.documentElement.classList.remove('accent-blue', 'accent-green', 'accent-purple', 'accent-orange', 'accent-red');
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
    
    // Add current theme classes
    document.documentElement.classList.add(isDarkMode ? 'dark' : 'light');
    if (isHighContrast) document.documentElement.classList.add('high-contrast');
    document.documentElement.classList.add(`accent-${accentColor}`);
    document.documentElement.classList.add(`font-${fontSize}`);

    // Update CSS variables for better color management
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--primary-bg', '#0E0E0E');
      root.style.setProperty('--secondary-bg', '#1F1F1F');
      root.style.setProperty('--primary-text', '#F1F1F1');
      root.style.setProperty('--secondary-text', '#CCCCCC');
      root.style.setProperty('--accent-color', '#3B82F6');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
    } else {
      root.style.setProperty('--primary-bg', '#FFFFFF');
      root.style.setProperty('--secondary-bg', '#F8F9FA');
      root.style.setProperty('--primary-text', '#1F2937');
      root.style.setProperty('--secondary-text', '#6B7280');
      root.style.setProperty('--accent-color', '#3B82F6');
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
    }
  }, [mode, accentColor, fontSize, isDarkMode, isHighContrast]);

  return (
    <EnhancedThemeContext.Provider value={{
      mode,
      accentColor,
      setMode,
      setAccentColor,
      isDarkMode,
      toggleDarkMode,
      isHighContrast,
      fontSize,
      setFontSize
    }}>
      {children}
    </EnhancedThemeContext.Provider>
  );
}

export function useEnhancedTheme() {
  const context = useContext(EnhancedThemeContext);
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
}
