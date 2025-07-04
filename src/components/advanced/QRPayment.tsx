
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Camera, Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useSupabaseATM } from '@/contexts/SupabaseATMContext';

interface QRPaymentProps {
  mode: 'generate' | 'scan';
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

interface PaymentData {
  recipientId: string;
  recipientName: string;
  amount: number;
  description: string;
  timestamp: string;
  qrId: string;
}

const QRPayment: React.FC<QRPaymentProps> = ({ mode, onSuccess, onCancel }) => {
  const [qrData, setQrData] = useState<string>('');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentUser } = useSupabaseATM();

  useEffect(() => {
    if (mode === 'scan' && isScanning) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [mode, isScanning]);

  const generateQRCode = async () => {
    if (!currentUser || !amount) return;

    setIsProcessing(true);
    setError('');

    try {
      const paymentData: PaymentData = {
        recipientId: currentUser.id,
        recipientName: currentUser.name,
        amount: parseFloat(amount),
        description: description || 'QR Payment',
        timestamp: new Date().toISOString(),
        qrId: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // In a real implementation, you would use a proper QR code library
      const qrString = JSON.stringify(paymentData);
      const qrDataUrl = await generateQRDataUrl(qrString);
      
      setQrData(qrDataUrl);
      setPaymentData(paymentData);
    } catch (err) {
      setError('Failed to generate QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateQRDataUrl = async (data: string): Promise<string> => {
    // Simulate QR code generation - in reality, use a library like qrcode
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Canvas not supported');
    
    canvas.width = 200;
    canvas.height = 200;
    
    // Simple pattern generation (replace with actual QR code library)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 200, 200);
    
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        if ((i + j + data.length) % 2 === 0) {
          ctx.fillRect(i * 10, j * 10, 10, 10);
        }
      }
    }
    
    return canvas.toDataURL();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning
        const scanInterval = setInterval(() => {
          scanQRCode();
        }, 1000);
        
        // Store interval for cleanup
        (videoRef.current as any).scanInterval = scanInterval;
      }
    } catch (err) {
      setError('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Clear scanning interval
      if ((videoRef.current as any).scanInterval) {
        clearInterval((videoRef.current as any).scanInterval);
      }
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    // Simulate QR code detection (replace with actual QR scanner library)
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const mockQRDetection = Math.random() > 0.95; // 5% chance of "detection"
      
      if (mockQRDetection) {
        const mockPaymentData = {
          recipientId: 'mock_recipient',
          recipientName: 'John Doe',
          amount: 1500,
          description: 'QR Payment',
          timestamp: new Date().toISOString(),
          qrId: 'qr_mock_123'
        };
        
        handleQRDetected(JSON.stringify(mockPaymentData));
      }
    } catch (error) {
      console.error('QR scanning error:', error);
    }
  };

  const handleQRDetected = (qrString: string) => {
    try {
      const data = JSON.parse(qrString);
      setScanResult(qrString);
      setPaymentData(data);
      setIsScanning(false);
      stopCamera();
    } catch (err) {
      setError('Invalid QR code format');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      // Simulate QR code reading from image
      const mockData = {
        recipientId: 'file_recipient',
        recipientName: 'Jane Smith',
        amount: 2500,
        description: 'QR Payment from Image',
        timestamp: new Date().toISOString(),
        qrId: 'qr_file_456'
      };
      
      handleQRDetected(JSON.stringify(mockData));
    };
    reader.readAsDataURL(file);
  };

  const processPayment = async () => {
    if (!paymentData || !currentUser) return;

    setIsProcessing(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, call your payment service
      const transactionResult = {
        id: `txn_${Date.now()}`,
        amount: paymentData.amount,
        recipient: paymentData.recipientName,
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      };
      
      onSuccess(transactionResult);
    } catch (err) {
      setError('Payment processing failed');
    } finally {
      setIsProcessing(false);
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
            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <QrCode className="w-6 h-6" />
              {mode === 'generate' ? 'Generate' : 'Scan'} QR Payment
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {mode === 'generate' ? (
              // Generate QR Code Mode
              <div className="space-y-4">
                {!qrData ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-gray-300">Amount (KES)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Payment description"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <Button
                      onClick={generateQRCode}
                      disabled={!amount || isProcessing}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <QrCode className="w-4 h-4 mr-2" />
                      )}
                      Generate QR Code
                    </Button>
                  </>
                ) : (
                  // Display Generated QR Code
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mx-auto w-48 h-48 bg-white p-4 rounded-lg"
                    >
                      <img src={qrData} alt="QR Code" className="w-full h-full" />
                    </motion.div>
                    
                    <div className="space-y-2">
                      <Badge className="bg-green-600">QR Code Generated</Badge>
                      <div className="text-sm text-gray-300">
                        <p>Amount: KES {paymentData?.amount.toLocaleString()}</p>
                        <p>Recipient: {paymentData?.recipientName}</p>
                        {paymentData?.description && (
                          <p>Description: {paymentData.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Share this QR code with the payer to receive payment
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Scan QR Code Mode
              <div className="space-y-4">
                {!paymentData ? (
                  <>
                    {/* Camera Scanner */}
                    <div className="space-y-4">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          className={`w-full h-48 bg-gray-700 rounded-lg ${
                            isScanning ? 'block' : 'hidden'
                          }`}
                          autoPlay
                          playsInline
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        {!isScanning && (
                          <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                            <Camera className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                        
                        {isScanning && (
                          <motion.div
                            className="absolute inset-4 border-2 border-purple-500 rounded-lg"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setIsScanning(!isScanning)}
                          className={`flex-1 ${
                            isScanning 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {isScanning ? 'Stop Scanning' : 'Start Camera'}
                        </Button>
                        
                        <label className="flex-1">
                          <Button variant="outline" className="w-full border-gray-600" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      {isScanning && (
                        <div className="text-center">
                          <Badge className="bg-blue-600">Scanning for QR codes...</Badge>
                          <p className="text-xs text-gray-500 mt-2">
                            Point your camera at a QR code
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Payment Confirmation
                  <div className="space-y-4">
                    <div className="text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        QR Code Detected
                      </h3>
                    </div>
                    
                    <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Recipient:</span>
                        <span className="text-white">{paymentData.recipientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white">KES {paymentData.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Description:</span>
                        <span className="text-white">{paymentData.description}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={processPayment}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Confirm Payment
                    </Button>
                  </div>
                )}
              </div>
            )}

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
                disabled={isProcessing}
                className="flex-1 border-gray-600 hover:border-gray-500"
              >
                Cancel
              </Button>
              
              {mode === 'generate' && qrData && (
                <Button
                  onClick={() => {
                    setQrData('');
                    setPaymentData(null);
                    setAmount('');
                    setDescription('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Generate New
                </Button>
              )}
              
              {mode === 'scan' && paymentData && (
                <Button
                  onClick={() => {
                    setScanResult('');
                    setPaymentData(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Scan Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default QRPayment;
