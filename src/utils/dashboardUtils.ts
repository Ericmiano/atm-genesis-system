import { CreditCard, PiggyBank, ArrowRight, Eye, FileText, Banknote, Activity } from 'lucide-react';

export function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTransactionIcon(type: string) {
  switch (type) {
    case 'WITHDRAWAL': return CreditCard;
    case 'DEPOSIT': return PiggyBank;
    case 'TRANSFER': return ArrowRight;
    case 'BALANCE_INQUIRY': return Eye;
    case 'BILL_PAYMENT': return FileText;
    case 'LOAN_DISBURSEMENT': return Banknote;
    default: return Activity;
  }
}

export function getTransactionColor(type: string) {
  switch (type) {
    case 'WITHDRAWAL': return 'text-red-600';
    case 'DEPOSIT': return 'text-green-600';
    case 'TRANSFER': return 'text-blue-600';
    case 'BILL_PAYMENT': return 'text-orange-600';
    case 'LOAN_DISBURSEMENT': return 'text-purple-600';
    default: return 'text-gray-600';
  }
} 