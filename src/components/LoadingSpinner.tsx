
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading ATM System..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 bg-white/10 rounded-full animate-pulse mb-6 mx-auto"></div>
          <Loader2 className="w-8 h-8 text-white animate-spin absolute top-6 left-1/2 transform -translate-x-1/2" />
        </div>
        <div className="text-white text-xl font-semibold animate-pulse">{message}</div>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
