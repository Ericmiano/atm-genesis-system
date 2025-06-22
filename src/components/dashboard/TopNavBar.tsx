import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Avatar } from '@/components/ui/avatar';
import { Bell, LogOut } from 'lucide-react';

const TopNavBar: React.FC<{ user: any; onLogout: () => void; }> = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-30 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow flex items-center justify-between px-6 py-3 mb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ATM Genesis</span>
      </div>
      <div className="flex items-center gap-6">
        {/* Notification Bell with Pulse Animation */}
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <Bell className="w-6 h-6 text-blue-600 cursor-pointer" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </motion.div>
        {/* User Avatar with Dropdown */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="focus:outline-none">
              <Avatar className="w-9 h-9 border-2 border-blue-500">
                <img src={user?.avatarUrl || undefined} alt={user?.name || 'User'} />
              </Avatar>
            </button>
          </PopoverTrigger>
          <AnimatePresence>
            {open && (
              <PopoverContent sideOffset={8} className="w-48 p-0 border-0 shadow-xl animate-scale-in">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <div className="p-4">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={onLogout}
                  >
                    <LogOut className="inline w-4 h-4 mr-2" /> Logout
                  </button>
                </motion.div>
              </PopoverContent>
            )}
          </AnimatePresence>
        </Popover>
      </div>
    </nav>
  );
};

export default TopNavBar; 