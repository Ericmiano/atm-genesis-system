
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSecurity } from '../contexts/SecurityContext';
import { translations } from '../utils/translations';
import { authService } from '../services/authService';
import { Language } from '../types/atm';
import { ArrowLeft, Settings, Lock, Globe, User, Moon, Sun, Shield, Activity } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { language, setLanguage, currentUser } = useSupabaseATM();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isSessionValid } = useSecurity();
  const t = translations[language];

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPin !== confirmPin) {
      setMessage('New PIN confirmation does not match');
      setSuccess(false);
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setMessage('PIN must be exactly 4 digits');
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const result = await authService.changePin(currentPin, newPin);
      setMessage(result.message);
      setSuccess(result.success);
      
      if (result.success) {
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setMessage('Language updated successfully');
    setSuccess(true);
    setTimeout(() => setMessage(''), 3000);
  };

  const languages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'es' as Language, name: 'Español' },
    { code: 'fr' as Language, name: 'Français' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-0 shadow-2xl animate-scale-in">
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
                <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                <CardTitle className="text-xl dark:text-white">{t.settings}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Security Status */}
            <Card className={`${isSessionValid ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className={`w-6 h-6 ${isSessionValid ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Security Status</h3>
                      <p className={`text-sm ${isSessionValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {isSessionValid ? 'All security features active' : 'Security check required'}
                      </p>
                    </div>
                  </div>
                  <Activity className={`w-8 h-8 ${isSessionValid ? 'text-green-600 animate-pulse' : 'text-red-600'}`} />
                </div>
              </CardContent>
            </Card>

            {/* User Information */}
            <Card className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Account Information</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Holder</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{currentUser?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{currentUser?.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{currentUser?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{currentUser?.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : <Sun className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Appearance</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base text-gray-800 dark:text-white">Dark Mode</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark themes</p>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t.language}</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-gray-800 dark:text-white">{t.language}</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="transition-all duration-200 focus:scale-105">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* PIN Change */}
            <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t.changePin}</h3>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePinChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPin" className="text-gray-800 dark:text-white">{t.currentPin}</Label>
                    <Input
                      id="currentPin"
                      type="password"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      placeholder="••••"
                      maxLength={4}
                      className="text-lg text-center transition-all duration-200 focus:scale-105 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPin" className="text-gray-800 dark:text-white">{t.newPin}</Label>
                    <Input
                      id="newPin"
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="••••"
                      maxLength={4}
                      className="text-lg text-center transition-all duration-200 focus:scale-105 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPin" className="text-gray-800 dark:text-white">{t.confirmPin}</Label>
                    <Input
                      id="confirmPin"
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="••••"
                      maxLength={4}
                      className="text-lg text-center transition-all duration-200 focus:scale-105 mt-2"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !currentPin || !newPin || !confirmPin}
                    className="w-full text-lg py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 hover:scale-105"
                  >
                    {loading ? t.processing : t.changePin}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {message && (
              <Alert variant={success ? "default" : "destructive"} className="animate-fade-in">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsScreen;
