
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuditLog } from '../../types/atm';
import { Eye } from 'lucide-react';

interface AuditLogsListProps {
  auditLogs: AuditLog[];
}

const AuditLogsList: React.FC<AuditLogsListProps> = ({ auditLogs }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-KE');
  };

  if (auditLogs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No audit logs available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {auditLogs.map((log, index) => (
        <Card 
          key={log.id} 
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{log.action}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(log.timestamp)}</p>
              </div>
              <Badge variant="outline">{log.userId || 'System'}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AuditLogsList;
