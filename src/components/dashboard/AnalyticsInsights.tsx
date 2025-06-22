import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  Target,
  BarChart3,
  Users,
  Shield,
  DollarSign
} from 'lucide-react';
import { useAnalyticsInsights } from '@/hooks/useAnalytics';

interface Insight {
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'Performance' | 'Business' | 'Security' | 'Transactions';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const AnalyticsInsights: React.FC = () => {
  const { insights, recommendations, isLoading, error } = useAnalyticsInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Performance':
        return <BarChart3 className="h-4 w-4" />;
      case 'Business':
        return <DollarSign className="h-4 w-4" />;
      case 'Security':
        return <Shield className="h-4 w-4" />;
      case 'Transactions':
        return <Users className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load analytics insights. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const criticalInsights = insights.filter((insight: Insight) => insight.priority === 'critical');
  const highPriorityInsights = insights.filter((insight: Insight) => insight.priority === 'high');
  const mediumPriorityInsights = insights.filter((insight: Insight) => insight.priority === 'medium');
  const lowPriorityInsights = insights.filter((insight: Insight) => insight.priority === 'low');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Insights</h2>
          <p className="text-muted-foreground">
            Intelligent insights and recommendations based on your data
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Lightbulb className="h-3 w-3" />
          <span>{insights.length} insights</span>
        </Badge>
      </div>

      {/* Critical Insights */}
      {criticalInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <XCircle className="h-5 w-5" />
                <span>Critical Issues</span>
                <Badge className="bg-red-100 text-red-800">{criticalInsights.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalInsights.map((insight: Insight, index) => (
                <Alert key={index} className={getInsightColor(insight.type)}>
                  {getInsightIcon(insight.type)}
                  <AlertTitle className="flex items-center justify-between">
                    <span>{insight.title}</span>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(insight.category)}
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                  </AlertTitle>
                  <AlertDescription>{insight.description}</AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* High Priority Insights */}
      {highPriorityInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span>High Priority</span>
                <Badge className="bg-orange-100 text-orange-800">{highPriorityInsights.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {highPriorityInsights.map((insight: Insight, index) => (
                <Alert key={index} className={getInsightColor(insight.type)}>
                  {getInsightIcon(insight.type)}
                  <AlertTitle className="flex items-center justify-between">
                    <span>{insight.title}</span>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(insight.category)}
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                  </AlertTitle>
                  <AlertDescription>{insight.description}</AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Medium Priority Insights */}
      {mediumPriorityInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Medium Priority</span>
                <Badge className="bg-yellow-100 text-yellow-800">{mediumPriorityInsights.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mediumPriorityInsights.map((insight: Insight, index) => (
                <Alert key={index} className={getInsightColor(insight.type)}>
                  {getInsightIcon(insight.type)}
                  <AlertTitle className="flex items-center justify-between">
                    <span>{insight.title}</span>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(insight.category)}
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                  </AlertTitle>
                  <AlertDescription>{insight.description}</AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Low Priority Insights */}
      {lowPriorityInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Info className="h-5 w-5" />
                <span>Low Priority</span>
                <Badge className="bg-blue-100 text-blue-800">{lowPriorityInsights.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowPriorityInsights.map((insight: Insight, index) => (
                <Alert key={index} className={getInsightColor(insight.type)}>
                  {getInsightIcon(insight.type)}
                  <AlertTitle className="flex items-center justify-between">
                    <span>{insight.title}</span>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(insight.category)}
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                  </AlertTitle>
                  <AlertDescription>{insight.description}</AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Recommendations</span>
                <Badge variant="outline">{recommendations.length}</Badge>
              </CardTitle>
              <CardDescription>
                Actionable recommendations to improve your system performance and user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Insights State */}
      {insights.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Systems Operational</h3>
                <p className="text-gray-600">
                  No critical insights at the moment. Your system is performing well!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Insights</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{criticalInsights.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{highPriorityInsights.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                <p className="text-2xl font-bold text-green-600">{recommendations.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsInsights; 