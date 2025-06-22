import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  networkRequests: number;
  bundleSize: number;
}

interface PerformanceHook {
  metrics: PerformanceMetrics;
  isOptimized: boolean;
  recommendations: string[];
  trackEvent: (eventName: string, duration?: number) => void;
  measureRender: (componentName: string) => () => void;
  getMemoryUsage: () => void;
}

export const usePerformance = (): PerformanceHook => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    timeToInteractive: 0,
    networkRequests: 0,
    bundleSize: 0,
  });

  const [isOptimized, setIsOptimized] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const renderTimes = useRef<Map<string, number[]>>(new Map());
  const eventTimes = useRef<Map<string, number[]>>(new Map());

  // Measure page load performance
  useEffect(() => {
    const measurePageLoad = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
        const lcp = performance.getEntriesByType('largest-contentful-paint')[0];
        const cls = performance.getEntriesByType('layout-shift')[0];

        const newMetrics: PerformanceMetrics = {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: fcp ? fcp.startTime : 0,
          largestContentfulPaint: lcp ? lcp.startTime : 0,
          cumulativeLayoutShift: cls ? (cls as any).value : 0,
          firstInputDelay: 0, // Will be measured separately
          timeToInteractive: navigation.domInteractive - navigation.fetchStart,
          networkRequests: performance.getEntriesByType('resource').length,
          bundleSize: 0, // Will be calculated separately
        };

        setMetrics(newMetrics);
        analyzePerformance(newMetrics);
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
      return () => window.removeEventListener('load', measurePageLoad);
    }
  }, []);

  // Measure First Input Delay
  useEffect(() => {
    const measureFID = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'first-input') {
              const fid = (entry as any).processingStart - entry.startTime;
              setMetrics(prev => ({ ...prev, firstInputDelay: fid }));
              break;
            }
          }
        });

        observer.observe({ entryTypes: ['first-input'] });
        return () => observer.disconnect();
      }
    };

    measureFID();
  }, []);

  // Analyze performance and generate recommendations
  const analyzePerformance = useCallback((currentMetrics: PerformanceMetrics) => {
    const newRecommendations: string[] = [];
    let optimizationScore = 100;

    // Check load time
    if (currentMetrics.loadTime > 3000) {
      newRecommendations.push('Consider implementing code splitting to reduce initial bundle size');
      optimizationScore -= 20;
    }

    // Check First Contentful Paint
    if (currentMetrics.firstContentfulPaint > 1800) {
      newRecommendations.push('Optimize critical rendering path and reduce render-blocking resources');
      optimizationScore -= 15;
    }

    // Check Largest Contentful Paint
    if (currentMetrics.largestContentfulPaint > 2500) {
      newRecommendations.push('Optimize images and implement lazy loading for better LCP');
      optimizationScore -= 15;
    }

    // Check Cumulative Layout Shift
    if (currentMetrics.cumulativeLayoutShift > 0.1) {
      newRecommendations.push('Reserve space for dynamic content to reduce layout shifts');
      optimizationScore -= 10;
    }

    // Check First Input Delay
    if (currentMetrics.firstInputDelay > 100) {
      newRecommendations.push('Break up long tasks and optimize JavaScript execution');
      optimizationScore -= 10;
    }

    // Check network requests
    if (currentMetrics.networkRequests > 50) {
      newRecommendations.push('Consider bundling resources and implementing HTTP/2 server push');
      optimizationScore -= 10;
    }

    // Check memory usage
    if (currentMetrics.memoryUsage) {
      const memoryUsagePercent = (currentMetrics.memoryUsage.usedJSHeapSize / currentMetrics.memoryUsage.jsHeapSizeLimit) * 100;
      if (memoryUsagePercent > 80) {
        newRecommendations.push('Memory usage is high. Consider implementing memory cleanup and avoiding memory leaks');
        optimizationScore -= 20;
      }
    }

    setIsOptimized(optimizationScore >= 80);
    setRecommendations(newRecommendations);
  }, []);

  // Track custom events
  const trackEvent = useCallback((eventName: string, duration?: number) => {
    const times = eventTimes.current.get(eventName) || [];
    times.push(duration || performance.now());
    eventTimes.current.set(eventName, times);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Event: ${eventName}`, { duration, average: times.reduce((a, b) => a + b, 0) / times.length });
    }
  }, []);

  // Measure component render time
  const measureRender = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const times = renderTimes.current.get(componentName) || [];
      times.push(renderTime);
      renderTimes.current.set(componentName, times);

      // Warn if render time is too high
      if (renderTime > 16) { // 60fps threshold
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }

      trackEvent(`${componentName}-render`, renderTime);
    };
  }, [trackEvent]);

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };

      setMetrics(prev => ({ ...prev, memoryUsage }));
      analyzePerformance({ ...metrics, memoryUsage });
    }
  }, [metrics, analyzePerformance]);

  return {
    metrics,
    isOptimized,
    recommendations,
    trackEvent,
    measureRender,
    getMemoryUsage,
  };
};

// Performance monitoring utilities
export const performanceUtils = {
  // Debounce function for performance
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  },

  // Throttle function for performance
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  },

  // Measure function execution time
  measureExecution: <T extends (...args: any[]) => any>(fn: T, name: string): T => {
    return ((...args: any[]) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${name} execution time: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  },

  // Check if element is in viewport
  isInViewport: (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Intersection Observer for lazy loading
  createIntersectionObserver: (
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver => {
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });
  },

  // Preload critical resources
  preloadResource: (href: string, as: string = 'fetch'): void => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Prefetch non-critical resources
  prefetchResource: (href: string): void => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },

  // Optimize images
  optimizeImage: (src: string, width: number, quality: number = 80): string => {
    // This would integrate with an image optimization service
    return `${src}?w=${width}&q=${quality}&auto=format`;
  },

  // Bundle size analyzer
  analyzeBundleSize: (): Promise<{ [key: string]: number }> => {
    return new Promise((resolve) => {
      // This would integrate with webpack-bundle-analyzer or similar
      resolve({});
    });
  },
};

// Performance monitoring HOC
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> => {
  return (props: P) => {
    const { measureRender } = usePerformance();
    const endMeasure = measureRender(componentName);

    useEffect(() => {
      endMeasure();
    });

    return <Component {...props} />;
  };
}; 