
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BuyGoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy: (merchantCode: string, amount: number) => void;
}

const BuyGoodsModal: React.FC<BuyGoodsModalProps> = ({ isOpen, onClose, onBuy }) => {
  const [merchantCode, setMerchantCode] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (merchantCode && amount) {
      onBuy(merchantCode, parseFloat(amount));
      setMerchantCode('');
      setAmount('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy Goods</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="merchant">Merchant Code</Label>
            <Input
              id="merchant"
              value={merchantCode}
              onChange={(e) => setMerchantCode(e.target.value)}
              placeholder="Enter merchant code"
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Buy</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BuyGoodsModal;
