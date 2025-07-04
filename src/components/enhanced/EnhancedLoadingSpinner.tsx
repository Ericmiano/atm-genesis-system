
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wallet, CreditCard, Shield } from 'lucide-react';

interface EnhancedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'banking' | 'secure';
  message?: string;
  progress?: number;
}

const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  message,
  progress
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerSizes = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const getIcon = () => {
    switch (variant) {
      case 'banking':
        return Wallet;
      case 'secure':
        return Shield;
      default:
        return Loader2;
    }
  };

  const Icon = getIcon();

  return (
    <div className={`flex flex-col items-center justify-center ${containerSizes[size]} space-y-4`}>
      <div className="relative">
        {/* Main spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Icon className={`${sizeClasses[size]} text-blue-500 animate-spin`} />
        </motion.div>

        {/* Outer ring animation */}
        <motion.div
          className={`absolute inset-0 rounded-full border-2 border-transparent border-t-blue-200 ${sizeClasses[size]}`}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Glow effect */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-blue-500/20 ${sizeClasses[size]} blur-sm`}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">{progress}%</p>
        </div>
      )}

      {/* Loading message */}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-600 dark:text-gray-300 text-center font-medium"
        >
          {message}
        </motion.p>
      )}

      {/* Banking-specific loading states */}
      {variant === 'banking' && (
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <CreditCard className="w-4 h-4" />
          </motion.div>
          <span>Securing your connection...</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedLoadingSpinner;
