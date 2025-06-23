import { useState, useEffect, useCallback } from 'react';
import { analyticsService, AnalyticsEventType } from '@/services/analyticsService';

interface AnalyticsHook {
  trackPageView: (pageName: string) => void;
  trackUserAction: (actionName: string, properties?: Record<string, any>) => void;
  trackTransaction: (transactionName: string, properties?: Record<string, any>) => void;
  trackError: (errorName: string, errorMessage?: string) => void;
  trackPerformance: (eventName: string, duration: number, success?: boolean) => void;
  trackSecurityEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackFeatureUsage: (featureName: string, properties?: Record<string, any>) => void;
  trackConversion: (conversionName: string, properties?: Record<string, any>) => void;
  trackRetention: (retentionName: string, properties?: Record<string, any>) => void;
  trackEngagement: (engagementName: string, properties?: Record<string, any>) => void;
  getTransactionAnalytics: (startDate: Date, endDate: Date, aggregation: string) => Promise<any>;
  getPerformanceMetrics: (timeRange: string) => Promise<any>;
  getBusinessIntelligence: () => Promise<any>;
  getFraudAnalytics: (timeRange: string) => Promise<any>;
  getRealTimeAnalytics: () => Promise<any>;
  generateAnalyticsReport: (reportType: string, startDate: Date, endDate: Date) => Promise<any>;
  isExporting: boolean;
  exportReport: (format: 'pdf' | 'csv' | 'json') => Promise<void>;
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
}

export const useAnalytics = (): AnalyticsHook => {
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.setDate(now.getDate() - 30));
  });
  const [endDate, setEndDate] = useState(new Date());

  const trackPageView = useCallback((pageName: string) => {
    analyticsService.trackEvent(AnalyticsEventType.PAGE_VIEW, pageName);
  }, []);

  const trackUserAction = useCallback((actionName: string, properties?: Record<string, any>) => {
    analyticsService.trackEvent(AnalyticsEventType.USER_ACTION, actionName, properties);
  }, []);

  const trackTransaction = useCallback((transactionName: string, properties?: Record<string, any>) => {
    analyticsService.trackEvent(AnalyticsEventType.TRANSACTION, transactionName, properties);
  }, []);

  const trackError = useCallback((errorName: string, errorMessage?: string) => {
    analyticsService.trackEvent(AnalyticsEventType.ERROR, errorName, { errorMessage });
  }, []);

  const trackPerformance = useCallback((eventName: string, duration: number, success: boolean = true) => {
    analyticsService.trackEvent(AnalyticsEventType.PERFORMANCE, eventName, { duration, success });
  }, []);

  const trackSecurityEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    analyticsService.trackEvent(AnalyticsEventType.SECURITY, eventName, properties);
  }, []);

  const trackFeatureUsage = useCallback((featureName: string, properties?: Record<string, any>) => {
    analyticsService.trackEvent(AnalyticsEventType.FEATURE_USAGE, featureName, properties);
  }, []);

  const trackConversion = useCallback((conversionName: string, properties?: Record<string, any>) => {
    analyticsService.trackEvent(AnalyticsEventType.CONVERSION, conversionName, properties);
  }, []);

  const trackRetention = useCallback((retentionName: string, properties?: Record<string, any>) => {
    analyticsService.trackEvent(AnalyticsEventType.RETENTION, retentionName, properties);
  }, []);

  const trackEngagement = useCallback((engagementName: string, properties?: Record<string, any>) => {
    analyticsService.trackEvent(AnalyticsEventType.ENGAGEMENT, engagementName, properties);
  }, []);

  const getTransactionAnalytics = useCallback(async (startDate: Date, endDate: Date, aggregation: string) => {
    return await analyticsService.getTransactionAnalytics(startDate, endDate, aggregation);
  }, []);

  const getPerformanceMetrics = useCallback(async (timeRange: string) => {
    return await analyticsService.getPerformanceMetrics(timeRange);
  }, []);

  const getBusinessIntelligence = useCallback(async () => {
    return await analyticsService.getBusinessIntelligence();
  }, []);

  const getFraudAnalytics = useCallback(async (timeRange: string) => {
    return await analyticsService.getFraudAnalytics(timeRange);
  }, []);

  const getRealTimeAnalytics = useCallback(async () => {
    return await analyticsService.getRealTimeAnalytics();
  }, []);

  const generateAnalyticsReport = useCallback(async (reportType: string, startDate: Date, endDate: Date) => {
    return await analyticsService.generateAnalyticsReport(reportType, startDate, endDate);
  }, []);

  const exportReport = useCallback(async (format: 'pdf' | 'csv' | 'json' = 'json') => {
  try {
    setIsExporting(true);
    const report = await analyticsService.generateAnalyticsReport('monthly', startDate, endDate);
    
    let content: string;
    let mimeType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        content = convertToCSV(report.metrics);
        mimeType = 'text/csv';
        filename = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'pdf':
        content = generatePDFContent(report);
        mimeType = 'application/pdf';
        filename = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
        break;
      default:
        content = JSON.stringify(report, null, 2);
        mimeType = 'application/json';
        filename = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
  } finally {
    setIsExporting(false);
  }
}, [startDate, endDate]);

// Helper functions for export
const convertToCSV = (data: any): string => {
  // Simple CSV conversion
  return Object.entries(data)
    .map(([key, value]) => `${key},${JSON.stringify(value)}`)
    .join('\n');
};

const generatePDFContent = (report: any): string => {
  // Simple text content for PDF (would need a proper PDF library in production)
  return `Analytics Report\n\nSummary: ${report.summary}\n\nMetrics: ${JSON.stringify(report.metrics, null, 2)}`;
};

  return {
    trackPageView,
    trackUserAction,
    trackTransaction,
    trackError,
    trackPerformance,
    trackSecurityEvent,
    trackFeatureUsage,
    trackConversion,
    trackRetention,
    trackEngagement,
    getTransactionAnalytics,
    getPerformanceMetrics,
    getBusinessIntelligence,
    getFraudAnalytics,
    getRealTimeAnalytics,
    generateAnalyticsReport,
    isExporting,
    exportReport,
    startDate,
    endDate,
    setStartDate,
    setEndDate
  };
};
