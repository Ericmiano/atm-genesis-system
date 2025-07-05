
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseATM } from '../../contexts/SupabaseATMContext';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A237E] to-[#151C66] text-[#F1F1F1] transition-all duration-300">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
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
            <div className="animate-fade-in">
              <AnimatePresence mode="wait">
                {children}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
