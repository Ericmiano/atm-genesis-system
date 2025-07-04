
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Eye, Mic, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { securityService } from '@/services/securityService';
import { useSupabaseATM } from '@/contexts/SupabaseATMContext';

type BiometricType = 'fingerprint' | 'face' | 'voice';

interface BiometricAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
  mode: 'setup' | 'verify';
  requiredType?: BiometricType;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ 
  onSuccess, 
  onCancel, 
  mode = 'verify',
  requiredType 
}) => {
  const [selectedType, setSelectedType] = useState<BiometricType>(requiredType || 'fingerprint');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [error, setError] = useState('');
  const [supportedMethods, setSupportedMethods] = useState<BiometricType[]>([]);
  const { currentUser } = useSupabaseATM();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const supported: BiometricType[] = [];

    // Check WebAuthn support (for fingerprint)
    if (window.PublicKeyCredential) {
      supported.push('fingerprint');
    }

    // Check getUserMedia support (for face/voice)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      supported.push('face', 'voice');
    }

    setSupportedMethods(supported);
  };

  const simulateBiometricCapture = async (type: BiometricType): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate biometric data capture
        const mockData = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        resolve(mockData);
      }, 2000);
    });
  };

  const handleBiometricAction = async () => {
    if (!currentUser) return;

    setIsCapturing(true);
    setError('');

    try {
      // Simulate biometric capture
      const biometricData = await simulateBiometricCapture(selectedType);
      setCaptureComplete(true);

      let result;
      if (mode === 'setup') {
        result = await securityService.setupBiometric(currentUser.id, selectedType, biometricData);
      } else {
        result = await securityService.verifyBiometric(currentUser.id, selectedType, biometricData);
      }

      if (result.success) {
        setTimeout(onSuccess, 1000);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Biometric authentication failed');
      setCaptureComplete(false);
    } finally {
      setIsCapturing(false);
    }
  };

  const getBiometricIcon = (type: BiometricType) => {
    switch (type) {
      case 'fingerprint':
        return Fingerprint;
      case 'face':
        return Eye;
      case 'voice':
        return Mic;
    }
  };

  const getBiometricLabel = (type: BiometricType) => {
    switch (type) {
      case 'fingerprint':
        return 'Fingerprint';
      case 'face':
        return 'Face Recognition';
      case 'voice':
        return 'Voice Recognition';
    }
  };

  const getInstructions = (type: BiometricType) => {
    switch (type) {
      case 'fingerprint':
        return 'Place your finger on the sensor and hold steady';
      case 'face':
        return 'Look directly at the camera and stay still';
      case 'voice':
        return 'Speak clearly: "My voice is my password"';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-800 border-gray-700 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {mode === 'setup' ? 'Setup' : 'Verify'} Biometric Authentication
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Biometric Type Selection */}
            {!requiredType && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">
                  Choose Authentication Method
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {supportedMethods.map((type) => {
                    const Icon = getBiometricIcon(type);
                    return (
                      <Button
                        key={type}
                        variant={selectedType === type ? "default" : "outline"}
                        className={`justify-start p-4 h-auto ${
                          selectedType === type 
                            ? 'bg-purple-600 hover:bg-purple-700 border-purple-500' 
                            : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                        }`}
                        onClick={() => setSelectedType(type)}
                        disabled={isCapturing}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{getBiometricLabel(type)}</div>
                          <div className="text-xs text-gray-400">
                            {getInstructions(type)}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Capture Interface */}
            <div className="text-center space-y-4">
              <motion.div
                className={`mx-auto w-32 h-32 rounded-full border-4 flex items-center justify-center ${
                  isCapturing 
                    ? 'border-purple-500 bg-purple-500/20' 
                    : captureComplete 
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-gray-600 bg-gray-700/50'
                }`}
                animate={isCapturing ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: isCapturing ? Infinity : 0 }}
              >
                {isCapturing ? (
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                ) : captureComplete ? (
                  <CheckCircle className="w-12 h-12 text-green-400" />
                ) : (
                  React.createElement(getBiometricIcon(selectedType), {
                    className: "w-12 h-12 text-gray-400"
                  })
                )}
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">
                  {getBiometricLabel(selectedType)}
                </h3>
                <p className="text-sm text-gray-400">
                  {isCapturing 
                    ? 'Capturing biometric data...' 
                    : captureComplete
                    ? 'Capture complete!'
                    : getInstructions(selectedType)
                  }
                </p>
              </div>

              {/* Status Badge */}
              {isCapturing && (
                <Badge className="bg-purple-600 text-white">
                  Processing...
                </Badge>
              )}
              
              {captureComplete && !error && (
                <Badge className="bg-green-600 text-white">
                  ✓ Success
                </Badge>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isCapturing}
                className="flex-1 border-gray-600 hover:border-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBiometricAction}
                disabled={isCapturing || captureComplete}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {mode === 'setup' ? 'Setup' : 'Verify'}
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {mode === 'setup' 
                  ? 'Your biometric data is encrypted and stored securely'
                  : 'Biometric verification provides additional security'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BiometricAuth;
