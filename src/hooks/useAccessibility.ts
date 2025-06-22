import { useState, useEffect, useCallback } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityHook {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontSize: string;
  announceToScreenReader: (message: string) => void;
  focusTrap: (element: HTMLElement | null) => void;
  skipToContent: () => void;
}

export const useAccessibility = (): AccessibilityHook => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    screenReader: false,
    keyboardNavigation: false,
  });

  // Check system preferences
  useEffect(() => {
    const checkSystemPreferences = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      setSettings(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }));
    };

    checkSystemPreferences();

    // Listen for changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = () => {
      setSettings(prev => ({ ...prev, reducedMotion: motionQuery.matches }));
    };

    const handleContrastChange = () => {
      setSettings(prev => ({ ...prev, highContrast: contrastQuery.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply font size
    root.style.setProperty('--font-size-multiplier', 
      settings.fontSize === 'small' ? '0.875' : 
      settings.fontSize === 'large' ? '1.25' : '1'
    );
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify({ ...settings, ...newSettings }));
  }, [settings]);

  const announceToScreenReader = useCallback((message: string) => {
    // Create a live region for screen reader announcements
    let liveRegion = document.getElementById('screen-reader-announcements');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'screen-reader-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = message;
    
    // Clear the message after a short delay
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = '';
      }
    }, 1000);
  }, []);

  const focusTrap = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      announceToScreenReader('Skipped to main content');
    }
  }, [announceToScreenReader]);

  return {
    settings,
    updateSettings,
    isHighContrast: settings.highContrast,
    isReducedMotion: settings.reducedMotion,
    fontSize: settings.fontSize,
    announceToScreenReader,
    focusTrap,
    skipToContent,
  };
};

// Keyboard navigation hook
export const useKeyboardNavigation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<HTMLElement[]>([]);

  const registerItem = useCallback((element: HTMLElement | null) => {
    if (element && !items.includes(element)) {
      setItems(prev => [...prev, element]);
    }
  }, [items]);

  const unregisterItem = useCallback((element: HTMLElement | null) => {
    if (element) {
      setItems(prev => prev.filter(item => item !== element));
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setCurrentIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setCurrentIndex(items.length - 1);
        break;
    }
  }, [items.length]);

  useEffect(() => {
    if (items.length > 0) {
      items[currentIndex]?.focus();
    }
  }, [currentIndex, items]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    registerItem,
    unregisterItem,
    currentIndex,
  };
};

// Screen reader utilities
export const screenReaderUtils = {
  // Announce page changes
  announcePageChange: (pageTitle: string) => {
    const announcement = `Navigated to ${pageTitle}`;
    const liveRegion = document.getElementById('screen-reader-announcements');
    if (liveRegion) {
      liveRegion.textContent = announcement;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  },

  // Announce form errors
  announceFormErrors: (errors: string[]) => {
    const announcement = `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}: ${errors.join(', ')}`;
    const liveRegion = document.getElementById('screen-reader-announcements');
    if (liveRegion) {
      liveRegion.textContent = announcement;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 2000);
    }
  },

  // Announce loading states
  announceLoading: (message: string) => {
    const announcement = `${message} is loading`;
    const liveRegion = document.getElementById('screen-reader-announcements');
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }
  },

  // Announce completion
  announceComplete: (message: string) => {
    const announcement = `${message} completed successfully`;
    const liveRegion = document.getElementById('screen-reader-announcements');
    if (liveRegion) {
      liveRegion.textContent = announcement;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  },
};

// Focus management utilities
export const focusUtils = {
  // Focus first focusable element
  focusFirst: (container: HTMLElement) => {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    focusable?.focus();
  },

  // Focus last focusable element
  focusLast: (container: HTMLElement) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastElement = focusable[focusable.length - 1] as HTMLElement;
    lastElement?.focus();
  },

  // Store and restore focus
  storeFocus: () => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.setAttribute('data-stored-focus', 'true');
    }
  },

  restoreFocus: () => {
    const storedElement = document.querySelector('[data-stored-focus="true"]') as HTMLElement;
    if (storedElement) {
      storedElement.focus();
      storedElement.removeAttribute('data-stored-focus');
    }
  },
}; 