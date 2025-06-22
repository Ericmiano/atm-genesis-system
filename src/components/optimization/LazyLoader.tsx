import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { performanceUtils } from '@/hooks/usePerformance';

interface LazyLoaderProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  className?: string;
}

// Lazy loader with intersection observer
export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback = <Skeleton className="w-full h-32" />,
  onLoad,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = performanceUtils.createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
            onLoad?.();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, hasLoaded, onLoad]);

  return (
    <div ref={elementRef} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};

// Lazy image component
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <LazyLoader
      fallback={<Skeleton className="w-full h-full" />}
      onLoad={() => {
        const img = new Image();
        img.onload = () => {
          setImageSrc(src);
          handleImageLoad();
        };
        img.onerror = handleImageError;
        img.src = src;
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && !hasError && 'opacity-100',
          hasError && 'opacity-50',
          className
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </LazyLoader>
  );
};

// Lazy component wrapper
interface LazyComponentProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  component,
  fallback = <Skeleton className="w-full h-32" />,
  props = {},
}) => {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Virtualized list for large datasets
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
}

export const VirtualizedList = <T,>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className,
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = performanceUtils.throttle((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, 16);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Infinite scroll component
interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
  className?: string;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  onLoadMore,
  hasMore,
  loading,
  threshold = 0.8,
  className,
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = performanceUtils.throttle(async () => {
    if (!hasMore || loading || isLoadingMore) return;

    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

    if (scrollPercentage >= threshold) {
      setIsLoadingMore(true);
      try {
        await onLoadMore();
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, 100);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div ref={containerRef} className={cn('overflow-auto', className)}>
      {children}
      {isLoadingMore && (
        <div className="flex justify-center p-4">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      )}
    </div>
  );
};

// Code splitting utilities
export const lazyComponents = {
  // Lazy load dashboard components
  Dashboard: lazy(() => import('@/components/Dashboard')),
  OverviewScreen: lazy(() => import('@/components/dashboard/OverviewScreen')),
  TransactionsScreen: lazy(() => import('@/components/dashboard/TransactionsScreen')),
  LoansScreen: lazy(() => import('@/components/dashboard/LoansScreen')),
  BillsScreen: lazy(() => import('@/components/dashboard/BillsScreen')),
  SettingsScreen: lazy(() => import('@/components/dashboard/SettingsScreen')),
  SystemMetricsScreen: lazy(() => import('@/components/dashboard/SystemMetricsScreen')),
  
  // Lazy load modals
  SendMoneyModal: lazy(() => import('@/components/modals/SendMoneyModal')),
  PayBillModal: lazy(() => import('@/components/modals/PayBillModal')),
  BuyAirtimeModal: lazy(() => import('@/components/modals/BuyAirtimeModal')),
  BuyGoodsModal: lazy(() => import('@/components/modals/BuyGoodsModal')),
  
  // Lazy load admin components
  AdminScreen: lazy(() => import('@/components/AdminScreen')),
  UserManagement: lazy(() => import('@/components/UserManagement')),
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload dashboard components when user logs in
  const preloadDashboard = () => {
    performanceUtils.prefetchResource('/src/components/Dashboard.tsx');
    performanceUtils.prefetchResource('/src/components/dashboard/OverviewScreen.tsx');
  };

  // Preload modals when dashboard loads
  const preloadModals = () => {
    performanceUtils.prefetchResource('/src/components/modals/SendMoneyModal.tsx');
    performanceUtils.prefetchResource('/src/components/modals/PayBillModal.tsx');
  };

  return { preloadDashboard, preloadModals };
};

// Utility function for className concatenation
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
}; 