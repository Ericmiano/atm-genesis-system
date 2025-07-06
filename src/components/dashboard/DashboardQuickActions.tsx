
import React from 'react';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Fingerprint, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardQuickActionsProps {
  onShowMpesa: () => void;
  onShowBiometric: () => void;
  onShowQRCode: () => void;
}

const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  onShowMpesa,
  onShowBiometric,
  onShowQRCode,
}) => {
  const { isDarkMode } = useEnhancedTheme();

  const actions = [
    {
      icon: Smartphone,
      label: 'M-Pesa',
      onClick: onShowMpesa,
      color: 'from-green-500 to-green-600',
      badge: 'Popular'
    },
    {
      icon: Fingerprint,
      label: 'Biometric',
      onClick: onShowBiometric,
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: QrCode,
      label: 'QR Code',
      onClick: onShowQRCode,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="flex items-center gap-2">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <div key={index} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className={cn(
                "p-2 rounded-xl transition-all duration-300 group",
                "hover:scale-105 hover:shadow-lg",
                isDarkMode 
                  ? "hover:bg-gray-800/50" 
                  : "hover:bg-gray-100"
              )}
              title={action.label}
            >
              <div className={cn(
                "p-2 rounded-lg transition-all duration-300 bg-gradient-to-r",
                action.color,
                "group-hover:shadow-lg text-white"
              )}>
                <Icon className="w-4 h-4" />
              </div>
            </Button>
            {action.badge && (
              <Badge className={cn(
                "absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium",
                "bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg"
              )}>
                {action.badge}
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardQuickActions;
