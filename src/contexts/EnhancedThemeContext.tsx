
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
      const saved = localStorage.getItem('theme-mode') as ThemeMode;
      return saved || 'dark';
    }
    return 'dark';
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accent-color') as AccentColor;
      return saved || 'blue';
    }
    return 'blue';
  });

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('font-size') as 'small' | 'medium' | 'large';
      return saved || 'medium';
    }
    return 'medium';
  });

  const isDarkMode = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isHighContrast = mode === 'high-contrast';

  const toggleDarkMode = () => {
    setMode(isDarkMode ? 'light' : 'dark');
  };

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('accent-color', accentColor);
    localStorage.setItem('font-size', fontSize);
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'light', 'high-contrast', 'auto');
    document.documentElement.classList.remove('accent-blue', 'accent-green', 'accent-purple', 'accent-orange', 'accent-red');
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
    
    // Add current theme classes
    document.documentElement.classList.add(isDarkMode ? 'dark' : 'light');
    if (isHighContrast) document.documentElement.classList.add('high-contrast');
    document.documentElement.classList.add(`accent-${accentColor}`);
    document.documentElement.classList.add(`font-${fontSize}`);
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
