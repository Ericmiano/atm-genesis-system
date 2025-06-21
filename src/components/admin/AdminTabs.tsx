
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { translations } from '../../utils/translations';
import { Users, Activity, FileText, AlertTriangle } from 'lucide-react';

interface AdminTabsProps {
  language: string;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ language }) => {
  const t = translations[language];

  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="users" className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        {t.users}
      </TabsTrigger>
      <TabsTrigger value="transactions" className="flex items-center gap-2">
        <Activity className="w-4 h-4" />
        {t.transactions}
      </TabsTrigger>
      <TabsTrigger value="audit" className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        {t.auditLogs}
      </TabsTrigger>
      <TabsTrigger value="fraud" className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        {t.fraudAlerts}
      </TabsTrigger>
    </TabsList>
  );
};

export default AdminTabs;
