import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopBar from './DashboardTopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onShowMpesa: () => void;
  onShowBiometric: () => void;
  onShowQRCode: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeScreen,
  setActiveScreen,
  isSidebarOpen,
  setIsSidebarOpen,
  onShowMpesa,
  onShowBiometric,
  onShowQRCode,
}) => {
  const { currentUser, logout } = useSupabaseATM();
  const { isDarkMode } = useEnhancedTheme();

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-accent text-white' 
        : 'bg-gradient-to-br from-neutral-50 via-white to-neutral-100 text-neutral-900'
    }`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex min-h-screen w-full">
        <DashboardSidebar
          activeTab={activeScreen}
          setActiveTab={setActiveScreen}
          onLogout={logout}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardTopBar
            currentUser={currentUser}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            onShowMpesa={onShowMpesa}
            onShowBiometric={onShowBiometric}
            onShowQRCode={onShowQRCode}
          />

          <main className="flex-1 p-4 lg:p-6 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <AnimatePresence mode="wait">
                {children}
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
