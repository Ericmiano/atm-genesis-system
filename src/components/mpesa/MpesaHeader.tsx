
import React from 'react';
import { X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MpesaHeaderProps {
  onClose?: () => void;
}

const MpesaHeader: React.FC<MpesaHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-[#00C853] to-[#4CAF50] rounded-full flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">M-Pesa Services</h2>
          <p className="text-gray-600">Send money, pay bills, and more</p>
        </div>
      </div>
      {onClose && (
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default MpesaHeader;
