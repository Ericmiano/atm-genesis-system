
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FraudAlert } from '../../types/atm';
import { AlertTriangle } from 'lucide-react';

interface FraudAlertsListProps {
  fraudAlerts: FraudAlert[];
}

const FraudAlertsList: React.FC<FraudAlertsListProps> = ({ fraudAlerts }) => {
  if (fraudAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No fraud alerts detected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {/* This would render fraud alerts when they exist */}
    </div>
  );
};

export default FraudAlertsList;
