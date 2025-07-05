import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'auto';
type AccentColor = 'wildberry' | 'purple' | 'orange' | 'green' | 'blue';

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
      return saved || 'light'; // Default to light mode with wildberry
    }
    return 'light';
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
    document.documentElement.classList.remove('accent-wildberry', 'accent-purple', 'accent-orange', 'accent-green', 'accent-blue');
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
    
    // Add current theme classes
    document.documentElement.classList.add(isDarkMode ? 'dark' : 'light');
    if (isHighContrast) document.documentElement.classList.add('high-contrast');
    document.documentElement.classList.add(`accent-${accentColor}`);
    document.documentElement.classList.add(`font-${fontSize}`);

    // Update CSS variables for better color management
    const root = document.documentElement;
    
    if (isDarkMode) {
      // Dark mode with deep navy theme
      root.style.setProperty('--primary-bg', '#0A0A0F');
      root.style.setProperty('--secondary-bg', '#1A1A2E');
      root.style.setProperty('--surface-bg', '#16213E');
      root.style.setProperty('--primary-text', '#E8E8E8');
      root.style.setProperty('--secondary-text', '#B8B8B8');
      root.style.setProperty('--accent-color', '#E91E63');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--card-shadow', '0 8px 32px rgba(0, 0, 0, 0.3)');
    } else {
      // Light mode with wildberry pink theme
      root.style.setProperty('--primary-bg', '#FFFFFF');
      root.style.setProperty('--secondary-bg', '#F8F9FA');
      root.style.setProperty('--surface-bg', '#FFFFFF');
      root.style.setProperty('--primary-text', '#1F2937');
      root.style.setProperty('--secondary-text', '#6B7280');
      root.style.setProperty('--accent-color', '#E91E63');
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--card-shadow', '0 4px 20px rgba(233, 30, 99, 0.1)');
    }

    // Set accent color specific variables
    switch (accentColor) {
      case 'wildberry':
        root.style.setProperty('--accent-primary', '#E91E63');
        root.style.setProperty('--accent-secondary', '#9C27B0');
        root.style.setProperty('--accent-tertiary', '#FF5722');
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

    // Set font size
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
