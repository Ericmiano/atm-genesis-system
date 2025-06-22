import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  onMaxRetriesExceeded?: (error: any) => void;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: any;
}

export const useRetryRequest = <T extends (...args: any[]) => Promise<any>>(
  requestFn: T,
  options: RetryOptions = {}
) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
    onRetry,
    onMaxRetriesExceeded
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null
  });

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return delay + jitter;
  }, [baseDelay, maxDelay]);

  const executeWithRetry = useCallback(async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setState(prev => ({ ...prev, isRetrying: false, retryCount: attempt }));
        const result = await requestFn(...args);
        // Reset state on success
        setState({ isRetrying: false, retryCount: 0, lastError: null });
        return result;
      } catch (error) {
        lastError = error;
        
        // Check if we should retry this error
        if (attempt === maxRetries || !shouldRetry(error)) {
          setState({ isRetrying: false, retryCount: attempt, lastError: error });
          onMaxRetriesExceeded?.(error);
          throw error;
        }

        // Prepare for retry
        setState(prev => ({ ...prev, isRetrying: true, retryCount: attempt + 1, lastError: error }));
        onRetry?.(attempt + 1, error);

        // Wait before retrying
        const delay = calculateDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }, [requestFn, maxRetries, shouldRetry, onRetry, onMaxRetriesExceeded, calculateDelay]);

  const reset = useCallback(() => {
    setState({ isRetrying: false, retryCount: 0, lastError: null });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...state
  };
};

// Predefined retry strategies
export const retryStrategies = {
  // Retry on network errors
  networkOnly: (error: any) => {
    return error.name === 'NetworkError' || 
           error.message?.includes('network') ||
           error.message?.includes('fetch') ||
           error.code === 'NETWORK_ERROR';
  },

  // Retry on server errors (5xx)
  serverErrors: (error: any) => {
    return error.status >= 500 && error.status < 600;
  },

  // Retry on rate limiting
  rateLimit: (error: any) => {
    return error.status === 429 || error.message?.includes('rate limit');
  },

  // Retry on temporary failures
  temporary: (error: any) => {
    return retryStrategies.networkOnly(error) || 
           retryStrategies.serverErrors(error) ||
           retryStrategies.rateLimit(error);
  },

  // Never retry
  never: () => false,

  // Always retry (use with caution)
  always: () => true
};

// Hook for common API retry patterns
export const useApiRetry = <T extends (...args: any[]) => Promise<any>>(
  requestFn: T,
  strategy: keyof typeof retryStrategies = 'temporary'
) => {
  return useRetryRequest(requestFn, {
    shouldRetry: retryStrategies[strategy],
    onRetry: (attempt, error) => {
      console.warn(`API request failed, retrying (${attempt}/3):`, error.message);
    },
    onMaxRetriesExceeded: (error) => {
      console.error('API request failed after all retries:', error);
    }
  });
}; 