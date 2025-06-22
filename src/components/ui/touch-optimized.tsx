import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Touch-optimized button with proper sizing
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  variant = 'default',
  size = 'default',
  children,
  className,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        // Minimum touch target size (44px)
        'min-h-[44px] min-w-[44px]',
        // Mobile-specific styles
        'md:min-h-auto md:min-w-auto',
        // Touch feedback
        'active:scale-95 transition-all duration-150',
        // Improved focus states for touch
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        // Consistent spacing
        'px-4 py-3 rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

// Touch-optimized card with swipe gestures
interface TouchCardProps {
  children: React.ReactNode;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
}

export const TouchCard: React.FC<TouchCardProps> = ({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onTap,
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPressed(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPressed(false);
    
    if (!touchStart || !touchEnd) {
      // Single tap
      if (onTap) onTap();
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
        'transition-all duration-200',
        'touch-manipulation', // Optimize for touch
        isPressed && 'scale-95 shadow-lg',
        // Consistent spacing
        'mb-4',
        // Improved focus states for touch
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:outline-none',
        className
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

// Touch-optimized input with better mobile keyboard
interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TouchInput: React.FC<TouchInputProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'text-base', // Larger text for mobile
          'touch-manipulation', // Optimize for touch
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

// Touch-optimized list with pull-to-refresh
interface TouchListProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  className?: string;
}

export const TouchList: React.FC<TouchListProps> = ({
  children,
  onRefresh,
  className,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (listRef.current?.scrollTop === 0) {
      const touch = e.touches[0];
      setPullDistance(touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (listRef.current?.scrollTop === 0 && pullDistance > 0) {
      const touch = e.touches[0];
      const distance = touch.clientY - pullDistance;
      
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 100 && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  return (
    <div
      ref={listRef}
      className={cn(
        'overflow-y-auto',
        'touch-manipulation',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullDistance > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
      {children}
    </div>
  );
};

// Touch-optimized modal with swipe to dismiss
interface TouchModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const TouchModal: React.FC<TouchModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  const [dragDistance, setDragDistance] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragDistance(touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const distance = touch.clientY - dragDistance;
    
    if (distance > 0) {
      e.preventDefault();
      setDragDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (dragDistance > 100) {
      onClose();
    }
    setDragDistance(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg',
          'w-full max-w-md mx-4 mb-4 sm:mb-0',
          'transform transition-transform duration-200',
          dragDistance > 0 && `translate-y-${Math.min(dragDistance / 10, 20)}`
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Touch-optimized number input with increment/decrement buttons
interface TouchNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export const TouchNumberInput: React.FC<TouchNumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 999999,
  step = 1,
  label,
  className,
}) => {
  const increment = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <TouchButton
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={value <= min}
          className="w-12 h-12"
        >
          -
        </TouchButton>
        
        <TouchInput
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="text-center text-lg font-semibold"
        />
        
        <TouchButton
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={value >= max}
          className="w-12 h-12"
        >
          +
        </TouchButton>
      </div>
    </div>
  );
}; 