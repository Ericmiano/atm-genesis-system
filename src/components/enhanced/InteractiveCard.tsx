
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  gradient?: boolean;
  glow?: boolean;
  onClick?: () => void;
  delay?: number;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className,
  hover = true,
  clickable = false,
  gradient = false,
  glow = false,
  onClick,
  delay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={hover ? { 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={clickable ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTapEnd={() => setIsPressed(false)}
      onClick={onClick}
      className={cn(
        'banking-card relative overflow-hidden transition-all duration-300',
        gradient && 'bg-gradient-to-br from-[#1F1F1F] to-[#2A2A2A]',
        clickable && 'cursor-pointer',
        glow && isHovered && 'shadow-2xl shadow-blue-500/20',
        className
      )}
    >
      {/* Animated background gradient */}
      {gradient && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5"
          animate={{
            opacity: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 blur-xl"
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Click ripple effect */}
      {clickable && isPressed && (
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-2xl"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.div>
  );
};

export default InteractiveCard;
