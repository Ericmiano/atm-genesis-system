
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  connectionSpeed?: string;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0
  });

  useEffect(() => {
    // Measure page load time
    const loadTime = performance.now();
    
    // Measure memory usage if available
    const getMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return {
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576)
        };
      }
      return null;
    };

    // Measure connection speed
    const getConnectionSpeed = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        return connection.effectiveType || 'unknown';
      }
      return 'unknown';
    };

    // Performance observer for render times
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    }

    setMetrics({
      loadTime: loadTime,
      renderTime: performance.now() - loadTime,
      memoryUsage: getMemoryUsage()?.used,
      connectionSpeed: getConnectionSpeed()
    });

    return () => {
      // Cleanup performance observers
    };
  }, []);

  const measureOperation = (name: string, operation: () => void) => {
    performance.mark(`${name}-start`);
    operation();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  };

  return { metrics, measureOperation };
};
