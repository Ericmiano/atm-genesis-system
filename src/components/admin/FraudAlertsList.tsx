import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FraudAlert } from '../../types/atm';
import { AlertTriangle, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';

interface FraudAlertsListProps {
  fraudAlerts: FraudAlert[];
  onResolve?: (alertId: string) => void;
}

const FraudAlertsList: React.FC<FraudAlertsListProps> = ({ fraudAlerts, onResolve }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-KE');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUSPICIOUS_AMOUNT':
        return <DollarSign className="w-4 h-4" />;
      case 'MULTIPLE_ATTEMPTS':
        return <Clock className="w-4 h-4" />;
      case 'UNUSUAL_PATTERN':
        return <AlertTriangle className="w-4 h-4" />;
      case 'LARGE_LOAN_REQUEST':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (fraudAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-gray-600">No fraud alerts detected</p>
          <p className="text-sm text-gray-500 mt-2">System is running normally</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {fraudAlerts.map((alert, index) => (
        <Card 
          key={alert.id} 
          className={`animate-fade-in ${alert.resolved ? 'opacity-60' : ''}`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(alert.type)}
                  <span className="font-medium">{alert.type.replace(/_/g, ' ')}</span>
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  {alert.resolved && (
                    <Badge variant="outline" className="text-green-600">
                      Resolved
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>User: {alert.userId}</span>
                  <span>{formatDate(alert.timestamp)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {!alert.resolved && onResolve && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolve(alert.id)}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Resolve
                  </Button>
                )}
                {alert.resolved && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-3 h-3" />
                    Resolved
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FraudAlertsList;
