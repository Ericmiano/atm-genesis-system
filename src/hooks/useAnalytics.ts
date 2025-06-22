import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService, AnalyticsEventType } from '@/services/analyticsService';

// Hook for transaction analytics
export const useTransactionAnalytics = (startDate: Date, endDate: Date, aggregation: string = 'daily') => {
  return useQuery({
    queryKey: ['transactionAnalytics', startDate.toISOString(), endDate.toISOString(), aggregation],
    queryFn: () => analyticsService.getTransactionAnalytics(startDate, endDate, aggregation),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for performance metrics
export const usePerformanceMetrics = (timeRange: string = '24h') => {
  return useQuery({
    queryKey: ['performanceMetrics', timeRange],
    queryFn: () => analyticsService.getPerformanceMetrics(timeRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// Hook for business intelligence
export const useBusinessIntelligence = () => {
  return useQuery({
    queryKey: ['businessIntelligence'],
    queryFn: () => analyticsService.getBusinessIntelligence(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for fraud analytics
export const useFraudAnalytics = (timeRange: string = '24h') => {
  return useQuery({
    queryKey: ['fraudAnalytics', timeRange],
    queryFn: () => analyticsService.getFraudAnalytics(timeRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Hook for real-time analytics
export const useRealTimeAnalytics = () => {
  return useQuery({
    queryKey: ['realTimeAnalytics'],
    queryFn: () => analyticsService.getRealTimeAnalytics(),
    staleTime: 0, // Always stale
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
    refetchIntervalInBackground: true,
  });
};

// Hook for analytics reports
export const useAnalyticsReport = (
  reportType: 'daily' | 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date
) => {
  return useQuery({
    queryKey: ['analyticsReport', reportType, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => analyticsService.generateAnalyticsReport(reportType, startDate, endDate),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for tracking analytics events
export const useTrackAnalyticsEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventType,
      eventName,
      properties,
      userId
    }: {
      eventType: AnalyticsEventType;
      eventName: string;
      properties?: Record<string, any>;
      userId?: string;
    }) => analyticsService.trackEvent(eventType, eventName, properties, userId),
    onSuccess: () => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['realTimeAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['businessIntelligence'] });
    },
  });
};

// Hook for comprehensive analytics data
export const useAnalyticsData = (timeRange: string = '24h') => {
  const endDate = new Date();
  const startDate = getStartDate(timeRange);

  const transactionAnalytics = useTransactionAnalytics(startDate, endDate);
  const performanceMetrics = usePerformanceMetrics(timeRange);
  const businessIntelligence = useBusinessIntelligence();
  const fraudAnalytics = useFraudAnalytics(timeRange);
  const realTimeAnalytics = useRealTimeAnalytics();

  const isLoading = 
    transactionAnalytics.isLoading ||
    performanceMetrics.isLoading ||
    businessIntelligence.isLoading ||
    fraudAnalytics.isLoading ||
    realTimeAnalytics.isLoading;

  const error = 
    transactionAnalytics.error ||
    performanceMetrics.error ||
    businessIntelligence.error ||
    fraudAnalytics.error ||
    realTimeAnalytics.error;

  const data = {
    transactions: transactionAnalytics.data,
    performance: performanceMetrics.data,
    business: businessIntelligence.data,
    fraud: fraudAnalytics.data,
    realTime: realTimeAnalytics.data,
  };

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      transactionAnalytics.refetch();
      performanceMetrics.refetch();
      businessIntelligence.refetch();
      fraudAnalytics.refetch();
      realTimeAnalytics.refetch();
    },
  };
};

// Hook for analytics dashboard with time range
export const useAnalyticsDashboard = (timeRange: string = '24h') => {
  const analyticsData = useAnalyticsData(timeRange);
  const trackEvent = useTrackAnalyticsEvent();

  const trackPageView = (pageName: string, properties?: Record<string, any>) => {
    trackEvent.mutate({
      eventType: AnalyticsEventType.PAGE_VIEW,
      eventName: pageName,
      properties: {
        page: pageName,
        timestamp: Date.now(),
        ...properties,
      },
    });
  };

  const trackUserAction = (actionName: string, properties?: Record<string, any>) => {
    trackEvent.mutate({
      eventType: AnalyticsEventType.USER_ACTION,
      eventName: actionName,
      properties: {
        action: actionName,
        timestamp: Date.now(),
        ...properties,
      },
    });
  };

  const trackTransaction = (transactionType: string, amount: number, properties?: Record<string, any>) => {
    trackEvent.mutate({
      eventType: AnalyticsEventType.TRANSACTION,
      eventName: transactionType,
      properties: {
        type: transactionType,
        amount,
        timestamp: Date.now(),
        ...properties,
      },
    });
  };

  const trackError = (errorMessage: string, properties?: Record<string, any>) => {
    trackEvent.mutate({
      eventType: AnalyticsEventType.ERROR,
      eventName: 'Error',
      properties: {
        error: errorMessage,
        timestamp: Date.now(),
        ...properties,
      },
    });
  };

  const trackPerformance = (metricName: string, value: number, properties?: Record<string, any>) => {
    trackEvent.mutate({
      eventType: AnalyticsEventType.PERFORMANCE,
      eventName: metricName,
      properties: {
        metric: metricName,
        value,
        timestamp: Date.now(),
        ...properties,
      },
    });
  };

  return {
    ...analyticsData,
    trackPageView,
    trackUserAction,
    trackTransaction,
    trackError,
    trackPerformance,
  };
};

// Hook for analytics insights and recommendations
export const useAnalyticsInsights = () => {
  const { data, isLoading, error } = useAnalyticsData('24h');

  const insights = React.useMemo(() => {
    if (!data) return [];

    const insights = [];

    // Performance insights
    if (data.performance) {
      if (data.performance.errorRate > 0.05) {
        insights.push({
          type: 'warning',
          category: 'Performance',
          title: 'High Error Rate',
          description: 'System error rate is above 5%. Consider investigating recent changes.',
          priority: 'high',
        });
      }

      if (data.performance.responseTime.average > 2000) {
        insights.push({
          type: 'warning',
          category: 'Performance',
          title: 'Slow Response Times',
          description: 'Average response time is above 2 seconds. Consider optimization.',
          priority: 'medium',
        });
      }
    }

    // Business insights
    if (data.business) {
      if (data.business.userGrowth.churnRate > 0.1) {
        insights.push({
          type: 'warning',
          category: 'Business',
          title: 'High Churn Rate',
          description: 'User churn rate is above 10%. Consider retention strategies.',
          priority: 'high',
        });
      }

      if (data.business.revenueMetrics.revenueGrowth < 0.05) {
        insights.push({
          type: 'info',
          category: 'Business',
          title: 'Low Revenue Growth',
          description: 'Revenue growth is below 5%. Consider growth strategies.',
          priority: 'medium',
        });
      }
    }

    // Fraud insights
    if (data.fraud) {
      if (data.fraud.fraudScore > 0.1) {
        insights.push({
          type: 'error',
          category: 'Security',
          title: 'High Fraud Risk',
          description: 'Fraud score is above 10%. Review security measures.',
          priority: 'critical',
        });
      }

      if (data.fraud.detectionAccuracy < 0.9) {
        insights.push({
          type: 'warning',
          category: 'Security',
          title: 'Low Detection Accuracy',
          description: 'Fraud detection accuracy is below 90%. Consider model updates.',
          priority: 'high',
        });
      }
    }

    // Transaction insights
    if (data.transactions) {
      if (data.transactions.successRate < 0.95) {
        insights.push({
          type: 'warning',
          category: 'Transactions',
          title: 'Low Success Rate',
          description: 'Transaction success rate is below 95%. Investigate failures.',
          priority: 'high',
        });
      }
    }

    return insights;
  }, [data]);

  const recommendations = React.useMemo(() => {
    if (!data) return [];

    const recommendations = [];

    // Performance recommendations
    if (data.performance?.errorRate > 0.05) {
      recommendations.push('Implement comprehensive error monitoring and alerting');
      recommendations.push('Review recent deployments for potential issues');
      recommendations.push('Consider implementing circuit breakers for external services');
    }

    if (data.performance?.responseTime.average > 2000) {
      recommendations.push('Optimize database queries and add proper indexing');
      recommendations.push('Implement caching strategies for frequently accessed data');
      recommendations.push('Consider using CDN for static assets');
    }

    // Business recommendations
    if (data.business?.userGrowth.churnRate > 0.1) {
      recommendations.push('Implement user onboarding improvements');
      recommendations.push('Add user engagement features and notifications');
      recommendations.push('Conduct user surveys to understand pain points');
    }

    // Security recommendations
    if (data.fraud?.fraudScore > 0.1) {
      recommendations.push('Enhance fraud detection algorithms');
      recommendations.push('Implement additional authentication factors');
      recommendations.push('Review and update security policies');
    }

    return recommendations;
  }, [data]);

  return {
    insights,
    recommendations,
    isLoading,
    error,
  };
};

// Helper function to get start date based on time range
const getStartDate = (timeRange: string): Date => {
  const now = new Date();
  switch (timeRange) {
    case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
};

// Hook for analytics export functionality
export const useAnalyticsExport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportType,
      startDate,
      endDate,
      format = 'json'
    }: {
      reportType: 'daily' | 'weekly' | 'monthly';
      startDate: Date;
      endDate: Date;
      format?: 'json' | 'csv' | 'pdf';
    }) => {
      const report = await analyticsService.generateAnalyticsReport(reportType, startDate, endDate);
      
      if (format === 'json') {
        return JSON.stringify(report, null, 2);
      } else if (format === 'csv') {
        // Convert to CSV format
        const csvData = convertToCSV(report);
        return csvData;
      } else if (format === 'pdf') {
        // For PDF, you would typically use a library like jsPDF
        // This is a simplified version
        return 'PDF generation not implemented';
      }
      
      return report;
    },
    onSuccess: (data, variables) => {
      // Create download link
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${variables.reportType}-${variables.startDate.toISOString().split('T')[0]}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
};

// Helper function to convert analytics data to CSV
const convertToCSV = (data: any): string => {
  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  };

  const flattened = flattenObject(data);
  const headers = Object.keys(flattened);
  const csvContent = [
    headers.join(','),
    Object.values(flattened).join(',')
  ].join('\n');

  return csvContent;
}; 