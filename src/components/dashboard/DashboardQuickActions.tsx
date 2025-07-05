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
      color: 'primary',
      badge: 'New'
    },
    {
      icon: Fingerprint,
      label: 'Biometric',
      onClick: onShowBiometric,
      color: 'secondary'
    },
    {
      icon: QrCode,
      label: 'QR Code',
      onClick: onShowQRCode,
      color: 'accent'
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
                  ? "hover:bg-dark-surface/50" 
                  : "hover:bg-neutral-100"
              )}
              title={action.label}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors duration-300",
                isDarkMode 
                  ? "group-hover:bg-dark-surface" 
                  : "group-hover:bg-neutral-200"
              )}>
                <Icon className={cn(
                  "w-4 h-4 transition-colors duration-300",
                  isDarkMode ? "text-muted-foreground" : "text-neutral-600"
                )} />
              </div>
            </Button>
            {action.badge && (
              <Badge className={cn(
                "absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium",
                "bg-gradient-to-r from-primary to-secondary text-white"
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
