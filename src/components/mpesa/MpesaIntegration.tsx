
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MpesaHeader from './MpesaHeader';
import MpesaSendMoney from './MpesaSendMoney';
import MpesaPayBill from './MpesaPayBill';
import MpesaBuyGoods from './MpesaBuyGoods';
import MpesaBuyAirtime from './MpesaBuyAirtime';

interface MpesaIntegrationProps {
  onClose?: () => void;
}

const MpesaIntegration: React.FC<MpesaIntegrationProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('send');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <MpesaHeader onClose={onClose} />

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="send" className="text-xs">Send Money</TabsTrigger>
              <TabsTrigger value="paybill" className="text-xs">Pay Bill</TabsTrigger>
              <TabsTrigger value="buygoods" className="text-xs">Buy Goods</TabsTrigger>
              <TabsTrigger value="airtime" className="text-xs">Airtime</TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="mt-6">
              <MpesaSendMoney onClose={onClose} />
            </TabsContent>

            <TabsContent value="paybill" className="mt-6">
              <MpesaPayBill onClose={onClose} />
            </TabsContent>

            <TabsContent value="buygoods" className="mt-6">
              <MpesaBuyGoods onClose={onClose} />
            </TabsContent>

            <TabsContent value="airtime" className="mt-6">
              <MpesaBuyAirtime onClose={onClose} />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default MpesaIntegration;
