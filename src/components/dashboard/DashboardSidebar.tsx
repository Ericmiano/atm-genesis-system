
import React from 'react';
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
  return (
    <motion.div
      className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300`}
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
