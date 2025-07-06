
import React from 'react';
import { X, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MpesaHeaderProps {
  onClose?: () => void;
}

const MpesaHeader: React.FC<MpesaHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-2xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">M-Pesa Services</h2>
          <p className="text-green-100 text-sm">Secure mobile money transactions</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Secured</span>
        </div>
        
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MpesaHeader;
