
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wallet, CreditCard, Shield, Zap } from 'lucide-react';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import { cn } from '@/lib/utils';

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
  const { isDarkMode } = useEnhancedTheme();

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
    <div className={cn(
      "flex flex-col items-center justify-center space-y-4",
      containerSizes[size]
    )}>
      <div className="relative">
        {/* Main spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Icon className={cn(
            sizeClasses[size],
            "text-blue-500 animate-spin"
          )} />
        </motion.div>

        {/* Outer ring animation */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent",
            sizeClasses[size],
            "border-t-blue-500/30"
          )}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Glow effect */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full blur-sm",
            sizeClasses[size],
            "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
          )}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Pulse effect */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            sizeClasses[size],
            "bg-gradient-to-r from-blue-500/10 to-purple-500/10"
          )}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className={cn(
            "rounded-full h-2 transition-colors duration-300",
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          )}>
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className={cn(
            "text-xs mt-1 text-center transition-colors duration-300",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            {progress}%
          </p>
        </div>
      )}

      {/* Loading message */}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-sm text-center font-medium transition-colors duration-300",
            isDarkMode ? "text-white" : "text-gray-900"
          )}
        >
          {message}
        </motion.p>
      )}

      {/* Banking-specific loading states */}
      {variant === 'banking' && (
        <div className={cn(
          "flex items-center space-x-2 text-xs transition-colors duration-300",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-blue-500"
          >
            <CreditCard className="w-4 h-4" />
          </motion.div>
          <span>Securing your connection...</span>
        </div>
      )}

      {/* Secure variant specific */}
      {variant === 'secure' && (
        <div className={cn(
          "flex items-center space-x-2 text-xs transition-colors duration-300",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-purple-500"
          >
            <Shield className="w-4 h-4" />
          </motion.div>
          <span>Establishing secure connection...</span>
        </div>
      )}

      {/* Default variant specific */}
      {variant === 'default' && (
        <div className={cn(
          "flex items-center space-x-2 text-xs transition-colors duration-300",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-orange-500"
          >
            <Zap className="w-4 h-4" />
          </motion.div>
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedLoadingSpinner;
