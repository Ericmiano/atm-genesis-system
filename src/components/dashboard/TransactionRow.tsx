import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Atom, BookOpen, HeartPulse, TestTube2 } from 'lucide-react';

const courseIcons = {
    'WITHDRAWAL': <BookOpen />, 
    'DEPOSIT': <Atom />, 
    'TRANSFER': <TestTube2 />, 
    'BILL_PAYMENT': <HeartPulse />
};

const TransactionRow = ({ transaction, index = 0 }) => (
    <motion.div 
        className="flex items-center gap-4 bg-gray-800/80 p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:bg-gray-800/90"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
    >
        <motion.div 
            className="p-3 bg-gray-700/60 rounded-lg text-custom-purple transition-all duration-200 hover:scale-110 hover:bg-gray-700/80"
            whileHover={{ rotate: 5 }}
        >
            {courseIcons[transaction.type] || <BookOpen />}
        </motion.div>
        <div className="flex-1 space-y-1">
            <motion.p 
                className="font-bold text-white"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.1, duration: 0.3 }}
            >
                {transaction.description}
            </motion.p>
            <motion.p 
                className="text-sm text-gray-400"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
            >
                Amount: KES {transaction.amount.toLocaleString()}
            </motion.p>
        </div>
        <div className="w-32">
            <motion.div 
                className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
            >
                <motion.div 
                    className="bg-custom-purple h-1.5 rounded-full"
                    style={{ width: `${Math.floor(Math.random() * 71) + 20}%` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
                />
            </motion.div>
        </div>
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
        >
            <Badge 
                variant={transaction.status === 'SUCCESS' ? 'default' : 'destructive'} 
                className="bg-green-600/20 text-green-400 border-green-500/30 transition-all duration-200 hover:scale-105"
            >
                {transaction.status}
            </Badge>
        </motion.div>
    </motion.div>
);

export default TransactionRow; 