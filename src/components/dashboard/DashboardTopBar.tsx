
import React from 'react';
import { User } from '../../types/atm';
import NotificationBell from '../notifications/NotificationBell';
import PresenceIndicator from '../presence/PresenceIndicator';
import DashboardQuickActions from './DashboardQuickActions';

interface DashboardTopBarProps {
  currentUser: User | null;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onShowMpesa: () => void;
  onShowBiometric: () => void;
  onShowQRCode: () => void;
}

const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  currentUser,
  isSidebarOpen,
  setIsSidebarOpen,
  onShowMpesa,
  onShowBiometric,
  onShowQRCode,
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Welcome Message */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-[#FFD600]">ATM Genesis</h1>
            <p className="text-white/80">Welcome back, {currentUser?.name || 'Alex Johnson'}</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <PresenceIndicator roomId="dashboard" />
          <NotificationBell />
          <DashboardQuickActions
            onShowMpesa={onShowMpesa}
            onShowBiometric={onShowBiometric}
            onShowQRCode={onShowQRCode}
          />

          {/* User Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF4081] to-[#FFD600] flex items-center justify-center text-white font-medium">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden md:block font-medium text-white">
              {currentUser?.name?.split(' ')[0] || 'User'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopBar;
