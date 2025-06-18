
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useATM } from '../contexts/ATMContext';
import { translations } from '../utils/translations';
import { atmService } from '../services/atmService';
import { Language } from '../types/atm';
import { ArrowLeft, Settings, Lock, Globe, User } from 'lucide-react';

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
  const { language, setLanguage, currentUser } = useATM();
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
      const result = await atmService.changePin(currentPin, newPin);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl animate-scale-in">
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
                <Settings className="w-6 h-6 text-gray-600" />
                <CardTitle className="text-xl">{t.settings}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* User Information */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-gray-600" />
                <h3 className="text-lg font-semibold">Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Account Holder</p>
                  <p className="font-semibold">{currentUser?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-semibold">{currentUser?.accountNumber}</p>
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">{t.language}</h3>
              </div>
              <div className="space-y-2">
                <Label>{t.language}</Label>
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
            </div>

            {/* PIN Change */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold">{t.changePin}</h3>
              </div>
              <form onSubmit={handlePinChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPin">{t.currentPin}</Label>
                  <Input
                    id="currentPin"
                    type="password"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="••••"
                    maxLength={4}
                    className="text-lg text-center transition-all duration-200 focus:scale-105"
                  />
                </div>
                <div>
                  <Label htmlFor="newPin">{t.newPin}</Label>
                  <Input
                    id="newPin"
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="••••"
                    maxLength={4}
                    className="text-lg text-center transition-all duration-200 focus:scale-105"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPin">{t.confirmPin}</Label>
                  <Input
                    id="confirmPin"
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="••••"
                    maxLength={4}
                    className="text-lg text-center transition-all duration-200 focus:scale-105"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !currentPin || !newPin || !confirmPin}
                  className="w-full text-lg py-6 bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105 transform"
                >
                  {loading ? t.processing : t.changePin}
                </Button>
              </form>
            </div>

            {message && (
              <Alert variant={success ? "default" : "destructive"} className="animate-slide-in-right">
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
