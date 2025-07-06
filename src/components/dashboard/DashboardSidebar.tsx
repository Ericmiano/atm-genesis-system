
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import EnhancedSidebar from './EnhancedSidebar';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  isSidebarOpen,
}) => {
  // Handle mobile sidebar close events
  useEffect(() => {
    const handleCloseSidebar = () => {
      // This will be handled by the parent component
      const event = new CustomEvent('setSidebarOpen', { detail: false });
      window.dispatchEvent(event);
    };

    window.addEventListener('closeSidebar', handleCloseSidebar);
    return () => window.removeEventListener('closeSidebar', handleCloseSidebar);
  }, []);

  return (
    <motion.div
      className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300`}
      initial={{ x: -300 }}
      animate={{ x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -300 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <EnhancedSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />
    </motion.div>
  );
};

export default DashboardSidebar;
