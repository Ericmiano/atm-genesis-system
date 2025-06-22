import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Shield, 
  Smartphone, 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  EyeOff,
  RefreshCw,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface MFASetupProps {
  onComplete?: () => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ onComplete }) => {
  const { currentUser } = useSupabaseATM();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup' | 'complete'>('qr');
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      // Check if MFA is enabled for current user
      const response = await fetch('/api/mfa/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };

  const generateMFASecret = () => {
    // Generate a random 32-character base32 secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const generateQRCode = (secret: string, email: string) => {
    const issuer = 'ATM Genesis System';
    const label = email;
    const url = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
    
    // In a real implementation, you would use a QR code library
    // For now, we'll create a simple representation
    return url;
  };

  const startMFASetup = async () => {
    setIsSettingUp(true);
    setSetupStep('qr');
    setError('');
    
    try {
      const secret = generateMFASecret();
      setSecretKey(secret);
      
      const qrUrl = generateQRCode(secret, currentUser?.email || '');
      setQrCode(qrUrl);
      
      const codes = generateBackupCodes();
      setBackupCodes(codes);
      
    } catch (error) {
      setError('Failed to start MFA setup');
    }
  };

  const verifyMFACode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real implementation, you would verify the TOTP code
      // For demo purposes, we'll accept any 6-digit code
      const isValid = /^\d{6}$/.test(verificationCode);
      
      if (isValid) {
        setSetupStep('backup');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const completeMFASetup = async () => {
    setLoading(true);
    setError('');

    try {
      // Save MFA secret and backup codes to database
      const response = await fetch('/api/mfa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          backupCodes: backupCodes,
        }),
      });

      if (response.ok) {
        setIsEnabled(true);
        setSetupStep('complete');
        toast({
          title: "MFA Enabled",
          description: "Multi-factor authentication has been successfully enabled for your account.",
        });
        onComplete?.();
      } else {
        setError('Failed to enable MFA');
      }
    } catch (error) {
      setError('Failed to enable MFA');
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mfa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsEnabled(false);
        toast({
          title: "MFA Disabled",
          description: "Multi-factor authentication has been disabled for your account.",
        });
      } else {
        setError('Failed to disable MFA');
      }
    } catch (error) {
      setError('Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
      toast({
        title: "Copied!",
        description: "Backup codes copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy backup codes",
        variant: "destructive",
      });
    }
  };

  const downloadBackupCodes = () => {
    const content = `ATM Genesis System - Backup Codes\n\n${backupCodes.join('\n')}\n\nKeep these codes safe. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isSettingUp) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Set Up Multi-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${setupStep === 'qr' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupStep === 'qr' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="text-sm">Scan QR Code</span>
            </div>
            <div className={`flex items-center gap-2 ${setupStep === 'verify' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupStep === 'verify' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="text-sm">Verify Code</span>
            </div>
            <div className={`flex items-center gap-2 ${setupStep === 'backup' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupStep === 'backup' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="text-sm">Backup Codes</span>
            </div>
            <div className={`flex items-center gap-2 ${setupStep === 'complete' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${setupStep === 'complete' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                4
              </div>
              <span className="text-sm">Complete</span>
            </div>
          </div>

          {/* QR Code Step */}
          {setupStep === 'qr' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Step 1: Scan QR Code</h3>
                <p className="text-gray-600 mb-4">
                  Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center relative">
                    <QrCode className="w-32 h-32 text-gray-400" />
                    <div className="absolute text-xs text-gray-500 text-center">
                      QR Code would be generated here<br />
                      Secret: {secretKey}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Or enter this code manually:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">{secretKey}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(secretKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={() => setSetupStep('verify')}>
                  Next: Verify Code
                </Button>
              </div>
            </div>
          )}

          {/* Verification Step */}
          {setupStep === 'verify' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Step 2: Verify Code</h3>
                <p className="text-gray-600 mb-4">
                  Enter the 6-digit code from your authenticator app:
                </p>
              </div>

              <div className="flex justify-center">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl font-mono tracking-widest w-48"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setSetupStep('qr')}>
                  Back
                </Button>
                <Button onClick={verifyMFACode} disabled={loading || verificationCode.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </div>
            </div>
          )}

          {/* Backup Codes Step */}
          {setupStep === 'backup' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Step 3: Save Backup Codes</h3>
                <p className="text-gray-600 mb-4">
                  Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Backup Codes</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                    >
                      {showBackupCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyBackupCodes}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadBackupCodes}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded text-center">
                      {showBackupCodes ? code : '••••••'}
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Important:</strong> Save these codes securely. Each code can only be used once to access your account.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setSetupStep('verify')}>
                  Back
                </Button>
                <Button onClick={completeMFASetup} disabled={loading}>
                  {loading ? 'Enabling MFA...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {setupStep === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-lg font-semibold">MFA Setup Complete!</h3>
              <p className="text-gray-600">
                Multi-factor authentication has been successfully enabled for your account. 
                Your account is now more secure.
              </p>

              <div className="flex justify-center">
                <Button onClick={() => {
                  setIsSettingUp(false);
                  setSetupStep('qr');
                }}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Multi-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            {isEnabled ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <h3 className="font-semibold">
                {isEnabled ? 'MFA is Enabled' : 'MFA is Disabled'}
              </h3>
              <p className="text-sm text-gray-600">
                {isEnabled 
                  ? 'Your account is protected with multi-factor authentication'
                  : 'Enable MFA to add an extra layer of security to your account'
                }
              </p>
            </div>
          </div>
          <Badge variant={isEnabled ? 'default' : 'secondary'}>
            {isEnabled ? 'Protected' : 'Unprotected'}
          </Badge>
        </div>

        {/* MFA Information */}
        <div className="space-y-4">
          <h4 className="font-semibold">How Multi-Factor Authentication Works</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h5 className="font-medium">Scan QR Code</h5>
                <p className="text-sm text-gray-600">Use your authenticator app to scan the QR code</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <div>
                <h5 className="font-medium">Enter Code</h5>
                <p className="text-sm text-gray-600">Enter the 6-digit code from your app</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <div>
                <h5 className="font-medium">Save Backup Codes</h5>
                <p className="text-sm text-gray-600">Store backup codes for emergency access</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">4</span>
              </div>
              <div>
                <h5 className="font-medium">Enhanced Security</h5>
                <p className="text-sm text-gray-600">Your account is now protected with MFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {!isEnabled ? (
            <Button onClick={startMFASetup} className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Enable MFA
            </Button>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Disable MFA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Disable Multi-Factor Authentication?</DialogTitle>
                  <DialogDescription>
                    This will remove the extra security layer from your account. 
                    Are you sure you want to continue?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive" onClick={disableMFA} disabled={loading}>
                    {loading ? 'Disabling...' : 'Disable MFA'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Security Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Security Tips</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Use a dedicated authenticator app like Google Authenticator or Authy</li>
            <li>• Keep your backup codes in a secure location</li>
            <li>• Never share your MFA codes with anyone</li>
            <li>• Use different authenticator apps for different accounts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MFASetup; 