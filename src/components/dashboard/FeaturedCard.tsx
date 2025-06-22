import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

const FeaturedCard = ({ account }) => (
    <motion.div 
        className="bg-gray-800/80 rounded-2xl p-8 flex justify-between items-center cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl" 
        style={{ backgroundImage: 'url(https://img.freepik.com/free-vector/abstract-secure-technology-background_23-2148354212.jpg?w=1800&t=st=1720023028~exp=1720023628~hmac=a27e3668748cb159a68a18a59c9995166a1e3f947a11ab01e4c4acb164a6c8e3)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
        <div className="space-y-4">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <Badge className="bg-custom-purple mb-4 transition-all duration-200 hover:scale-105 hover:shadow-lg">Current Balance</Badge>
            </motion.div>
            <motion.h2 
                className="text-5xl font-bold text-white mb-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                KES {account?.balance?.toLocaleString()}
            </motion.h2>
            <motion.p 
                className="text-gray-300 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                Your financial hub for seamless transactions.
            </motion.p>
        </div>
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
            <Button className="bg-custom-purple hover:bg-purple-700 text-white rounded-full px-6 py-3 flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                <PlayCircle className="transition-transform duration-200 group-hover:scale-110" />
                Quick Transfer
            </Button>
        </motion.div>
    </motion.div>
);

export default FeaturedCard; 