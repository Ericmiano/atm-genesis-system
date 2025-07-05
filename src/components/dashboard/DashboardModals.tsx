
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MpesaIntegration from '../mpesa/MpesaIntegration';
import BiometricAuth from '../advanced/BiometricAuth';
import QRPayment from '../advanced/QRPayment';

interface DashboardModalsProps {
  showMpesa: boolean;
  setShowMpesa: (show: boolean) => void;
  showBiometric: boolean;
  setShowBiometric: (show: boolean) => void;
  showQRCode: boolean;
  setShowQRCode: (show: boolean) => void;
  qrMode: 'generate' | 'scan';
}

const DashboardModals: React.FC<DashboardModalsProps> = ({
  showMpesa,
  setShowMpesa,
  showBiometric,
  setShowBiometric,
  showQRCode,
  setShowQRCode,
  qrMode,
}) => {
  return (
    <>
      {/* M-Pesa Integration Modal */}
      <AnimatePresence>
        {showMpesa && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <MpesaIntegration onClose={() => setShowMpesa(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biometric Auth Modal */}
      <AnimatePresence>
        {showBiometric && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <BiometricAuth
              mode="setup"
              onSuccess={() => setShowBiometric(false)}
              onCancel={() => setShowBiometric(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Payment Modal */}
      <AnimatePresence>
        {showQRCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <QRPayment
              mode={qrMode}
              onSuccess={(data) => {
                console.log('QR Payment success:', data);
                setShowQRCode(false);
              }}
              onCancel={() => setShowQRCode(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardModals;
