import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:outline-none transition-all duration-150 select-none active:scale-95 shadow-sm px-4 py-2 gap-2';

const variantStyles = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
  secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
  ghost: 'bg-transparent text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
  link: 'bg-transparent underline text-blue-600 hover:text-blue-800',
};

const sizeStyles = {
  default: 'h-11 min-w-[44px] px-4 text-base',
  sm: 'h-9 min-w-[36px] px-3 text-sm',
  lg: 'h-14 min-w-[56px] px-6 text-lg',
  icon: 'h-11 w-11 p-0',
};

export const buttonVariants = ({ variant = 'default', size = 'default', className = '' }: {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  className?: string;
} = {}) => {
  return cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export default Button;
