import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AnimatedCardProps {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  desc?: ReactNode;
  descColor?: string;
  color?: string;
  children?: ReactNode;
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ icon, title, value, desc, descColor, color = '', children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.4, type: 'spring' }}
  >
    <Card className={`bg-gradient-to-br ${color} dark:from-gray-800 dark:to-gray-900/80 backdrop-blur border-0 shadow-xl text-white dark:text-white`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/90 dark:text-gray-300">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {desc && <p className={`text-xs mt-1 ${descColor}`}>{desc}</p>}
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

export default AnimatedCard; 