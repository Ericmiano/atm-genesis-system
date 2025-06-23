
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: (billType: string, amount: number) => void;
}

const PayBillModal: React.FC<PayBillModalProps> = ({ isOpen, onClose, onPay }) => {
  const [billType, setBillType] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (billType && amount) {
      onPay(billType, parseFloat(amount));
      setBillType('');
      setAmount('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Bill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="billType">Bill Type</Label>
            <Input
              id="billType"
              value={billType}
              onChange={(e) => setBillType(e.target.value)}
              placeholder="Enter bill type"
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
            <Button type="submit">Pay</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PayBillModal;
