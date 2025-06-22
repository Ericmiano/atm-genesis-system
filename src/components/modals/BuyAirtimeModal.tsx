import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, CheckCircle, XCircle } from 'lucide-react';
import { mpesaService, BuyAirtimeRequest } from '../../services/mpesaService';

interface BuyAirtimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

const AIRTIME_PACKAGES = {
  SAFARICOM: [
    { name: '10 KES', value: 10 },
    { name: '20 KES', value: 20 },
    { name: '50 KES', value: 50 },
    { name: '100 KES', value: 100 },
    { name: '200 KES', value: 200 },
    { name: '500 KES', value: 500 },
    { name: '1000 KES', value: 1000 }
  ],
  AIRTEL: [
    { name: '10 KES', value: 10 },
    { name: '20 KES', value: 20 },
    { name: '50 KES', value: 50 },
    { name: '100 KES', value: 100 },
    { name: '200 KES', value: 200 },
    { name: '500 KES', value: 500 },
    { name: '1000 KES', value: 1000 }
  ],
  TELKOM: [
    { name: '10 KES', value: 10 },
    { name: '20 KES', value: 20 },
    { name: '50 KES', value: 50 },
    { name: '100 KES', value: 100 },
    { name: '200 KES', value: 200 },
    { name: '500 KES', value: 500 },
    { name: '1000 KES', value: 1000 }
  ]
};

export const BuyAirtimeModal: React.FC<BuyAirtimeModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    provider: 'SAFARICOM' as 'SAFARICOM' | 'AIRTEL' | 'TELKOM',
    amount: '',
    customAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handlePackageSelect = (amount: string) => {
    setFormData(prev => ({ 
      ...prev, 
      amount,
      customAmount: '' // Clear custom amount when package is selected
    }));
  };

  const handleCustomAmountChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      customAmount: value,
      amount: '' // Clear package amount when custom amount is entered
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    
    const phoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Invalid phone number format');
      return false;
    }

    const finalAmount = formData.amount || formData.customAmount;
    if (!finalAmount || parseFloat(finalAmount) < 10) {
      setError('Minimum amount is 10 KES');
      return false;
    }

    if (parseFloat(finalAmount) > 10000) {
      setError('Maximum amount is 10,000 KES');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const finalAmount = formData.amount || formData.customAmount;
      const request: BuyAirtimeRequest = {
        phoneNumber: formData.phoneNumber,
        amount: parseFloat(finalAmount),
        provider: formData.provider
      };

      await mpesaService.buyAirtime(userId, request);
      setSuccess(true);
      
      // Reset form
      setFormData({
        phoneNumber: '',
        provider: 'SAFARICOM',
        amount: '',
        customAmount: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onSuccess();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to buy airtime. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        phoneNumber: '',
        provider: 'SAFARICOM',
        amount: '',
        customAmount: ''
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-purple-500" />
            Buy Airtime
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Airtime Purchase Successful!</h3>
            <p className="text-gray-600">Your airtime has been credited.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g., 0712345678"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500">
                Enter the phone number to receive airtime
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Network Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(value: 'SAFARICOM' | 'AIRTEL' | 'TELKOM') => 
                  handleInputChange('provider', value)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAFARICOM">Safaricom</SelectItem>
                  <SelectItem value="AIRTEL">Airtel</SelectItem>
                  <SelectItem value="TELKOM">Telkom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Package or Enter Custom Amount</Label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {AIRTIME_PACKAGES[formData.provider].map((pkg) => (
                  <Button
                    key={pkg.value}
                    type="button"
                    variant={formData.amount === pkg.value.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePackageSelect(pkg.value.toString())}
                    disabled={loading}
                    className="text-xs"
                  >
                    {pkg.name}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customAmount">Custom Amount (KES)</Label>
                <Input
                  id="customAmount"
                  type="number"
                  min="10"
                  max="10000"
                  step="1"
                  placeholder="Enter custom amount"
                  value={formData.customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Min: 10 KES, Max: 10,000 KES
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Buy Airtime
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}; 