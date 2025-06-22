import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Keyboard, 
  Monitor, 
  Settings,
  Check,
  X
} from 'lucide-react';
import { useAccessibility } from '@/hooks/useAccessibility';
import { cn } from '@/lib/utils';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  isOpen,
  onClose
}) => {
  const { settings, updateSettings, announceToScreenReader } = useAccessibility();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    announceToScreenReader('Accessibility settings saved');
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium' as const,
      screenReader: false,
      keyboardNavigation: false,
    };
    setLocalSettings(defaultSettings);
    updateSettings(defaultSettings);
    announceToScreenReader('Accessibility settings reset to default');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Accessibility className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Accessibility Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize your experience
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close accessibility settings"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Visual Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="w-4 h-4" />
                Visual Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="high-contrast" className="text-sm font-medium">
                    High Contrast
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={localSettings.highContrast}
                  onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                  aria-label="Toggle high contrast mode"
                />
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Font Size</Label>
                <RadioGroup
                  value={localSettings.fontSize}
                  onValueChange={(value) => handleSettingChange('fontSize', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="font-small" />
                    <Label htmlFor="font-small" className="text-sm">Small</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="font-medium" />
                    <Label htmlFor="font-medium" className="text-sm">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="font-large" />
                    <Label htmlFor="font-large" className="text-sm">Large</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Motion Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Monitor className="w-4 h-4" />
                Motion Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reduced-motion" className="text-sm font-medium">
                    Reduced Motion
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Reduce animations and transitions
                  </p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={localSettings.reducedMotion}
                  onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
                  aria-label="Toggle reduced motion"
                />
              </div>
            </CardContent>
          </Card>

          {/* Navigation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Keyboard className="w-4 h-4" />
                Navigation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Keyboard Navigation */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="keyboard-nav" className="text-sm font-medium">
                    Enhanced Keyboard Navigation
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Improved keyboard controls
                  </p>
                </div>
                <Switch
                  id="keyboard-nav"
                  checked={localSettings.keyboardNavigation}
                  onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
                  aria-label="Toggle enhanced keyboard navigation"
                />
              </div>

              {/* Screen Reader */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="screen-reader" className="text-sm font-medium">
                    Screen Reader Support
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enhanced screen reader announcements
                  </p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={localSettings.screenReader}
                  onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
                  aria-label="Toggle screen reader support"
                />
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
              <CardDescription>
                Quick access to common actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Skip to main content</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Tab</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Open accessibility menu</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Alt + A</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Navigate menu items</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Arrow Keys</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Activate item</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skip to content link
export const SkipToContent: React.FC = () => {
  const { skipToContent } = useAccessibility();

  return (
    <Button
      onClick={skipToContent}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg"
      aria-label="Skip to main content"
    >
      Skip to main content
    </Button>
  );
};

// Accessibility menu trigger
export const AccessibilityMenuTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-blue-600 text-white rounded-full w-12 h-12 shadow-lg hover:bg-blue-700"
        aria-label="Open accessibility settings"
      >
        <Accessibility className="w-5 h-5" />
      </Button>
      
      <AccessibilitySettings 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default AccessibilitySettings; 