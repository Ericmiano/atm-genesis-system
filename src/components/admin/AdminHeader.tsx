
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { translations } from '../../utils/translations';
import { ArrowLeft, Shield } from 'lucide-react';

interface AdminHeaderProps {
  onBack: () => void;
  language: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onBack, language }) => {
  const t = translations[language];

  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" />
          <CardTitle className="text-xl">{t.adminPanel}</CardTitle>
        </div>
      </div>
    </CardHeader>
  );
};

export default AdminHeader;
