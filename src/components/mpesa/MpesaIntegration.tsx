
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MpesaHeader from './MpesaHeader';
import MpesaSendMoney from './MpesaSendMoney';
import MpesaPayBill from './MpesaPayBill';
import MpesaBuyGoods from './MpesaBuyGoods';
import MpesaBuyAirtime from './MpesaBuyAirtime';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';

interface MpesaIntegrationProps {
  onClose?: () => void;
}

const MpesaIntegration: React.FC<MpesaIntegrationProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('send');
  const { isDarkMode } = useEnhancedTheme();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
            isDarkMode 
              ? 'bg-gray-900 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}
        >
          <MpesaHeader onClose={onClose} />

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full grid-cols-4 mb-6 ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <TabsTrigger 
                  value="send" 
                  className="text-sm font-medium data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  Send Money
                </TabsTrigger>
                <TabsTrigger 
                  value="paybill" 
                  className="text-sm font-medium data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                >
                  Pay Bill
                </TabsTrigger>
                <TabsTrigger 
                  value="buygoods" 
                  className="text-sm font-medium data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
                >
                  Buy Goods
                </TabsTrigger>
                <TabsTrigger 
                  value="airtime" 
                  className="text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Airtime
                </TabsTrigger>
              </TabsList>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="send" className="mt-0">
                  <MpesaSendMoney onClose={onClose} />
                </TabsContent>

                <TabsContent value="paybill" className="mt-0">
                  <MpesaPayBill onClose={onClose} />
                </TabsContent>

                <TabsContent value="buygoods" className="mt-0">
                  <MpesaBuyGoods onClose={onClose} />
                </TabsContent>

                <TabsContent value="airtime" className="mt-0">
                  <MpesaBuyAirtime onClose={onClose} />
                </TabsContent>
              </motion.div>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MpesaIntegration;
