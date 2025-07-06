import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';
type AccentColor = 'wildberry' | 'purple' | 'orange' | 'green' | 'blue';

interface EnhancedThemeContextType {
  mode: ThemeMode;
  accentColor: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);

export function EnhancedThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enhanced-theme-mode') as ThemeMode;
      return saved || 'auto';
    }
    return 'auto';
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enhanced-accent-color') as AccentColor;
      return saved || 'wildberry';
    }
    return 'wildberry';
  });

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enhanced-font-size') as 'small' | 'medium' | 'large';
      return saved || 'medium';
    }
    return 'medium';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (mode === 'auto' && typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return mode === 'dark';
  });

  const toggleDarkMode = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setMode(newMode);
  };

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
    
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.remove('accent-wildberry', 'accent-purple', 'accent-orange', 'accent-green', 'accent-blue');
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
    
    document.documentElement.classList.add(isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.add(`accent-${accentColor}`);
    document.documentElement.classList.add(`font-${fontSize}`);

    const root = document.documentElement;
    
    if (isDarkMode) {
      root.style.setProperty('--primary-bg', '#0A0A0F');
      root.style.setProperty('--secondary-bg', '#1A1A2E');
      root.style.setProperty('--surface-bg', '#16213E');
      root.style.setProperty('--primary-text', '#E8E8E8');
      root.style.setProperty('--secondary-text', '#B8B8B8');
      root.style.setProperty('--accent-color', '#E91E63');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--card-shadow', '0 8px 32px rgba(0, 0, 0, 0.3)');
    } else {
      // Softer light mode with muted wildberry
      root.style.setProperty('--primary-bg', '#FEFEFE');
      root.style.setProperty('--secondary-bg', '#FAFAFA');
      root.style.setProperty('--surface-bg', '#FFFFFF');
      root.style.setProperty('--primary-text', '#2D3748');
      root.style.setProperty('--secondary-text', '#718096');
      root.style.setProperty('--accent-color', '#D53F8C'); // Softer wildberry
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--card-shadow', '0 4px 20px rgba(213, 63, 140, 0.08)');
    }

    switch (accentColor) {
      case 'wildberry':
        root.style.setProperty('--accent-primary', isDarkMode ? '#E91E63' : '#D53F8C');
        root.style.setProperty('--accent-secondary', isDarkMode ? '#9C27B0' : '#B83280');
        root.style.setProperty('--accent-tertiary', isDarkMode ? '#FF5722' : '#ED8936');
        break;
      case 'purple':
        root.style.setProperty('--accent-primary', '#9C27B0');
        root.style.setProperty('--accent-secondary', '#E91E63');
        root.style.setProperty('--accent-tertiary', '#FF5722');
        break;
      case 'orange':
        root.style.setProperty('--accent-primary', '#FF5722');
        root.style.setProperty('--accent-secondary', '#FF9800');
        root.style.setProperty('--accent-tertiary', '#E91E63');
        break;
      case 'green':
        root.style.setProperty('--accent-primary', '#4CAF50');
        root.style.setProperty('--accent-secondary', '#81C784');
        root.style.setProperty('--accent-tertiary', '#E91E63');
        break;
      case 'blue':
        root.style.setProperty('--accent-primary', '#2196F3');
        root.style.setProperty('--accent-secondary', '#64B5F6');
        root.style.setProperty('--accent-tertiary', '#E91E63');
        break;
    }

    switch (fontSize) {
      case 'small':
        root.style.setProperty('--font-size-base', '0.875rem');
        root.style.setProperty('--font-size-lg', '1rem');
        root.style.setProperty('--font-size-xl', '1.125rem');
        break;
      case 'medium':
        root.style.setProperty('--font-size-base', '1rem');
        root.style.setProperty('--font-size-lg', '1.125rem');
        root.style.setProperty('--font-size-xl', '1.25rem');
        break;
      case 'large':
        root.style.setProperty('--font-size-base', '1.125rem');
        root.style.setProperty('--font-size-lg', '1.25rem');
        root.style.setProperty('--font-size-xl', '1.5rem');
        break;
    }
  }, [mode, accentColor, fontSize, isDarkMode]);

  return (
    <EnhancedThemeContext.Provider value={{
      mode,
      accentColor,
      setMode,
      setAccentColor,
      isDarkMode,
      toggleDarkMode,
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
