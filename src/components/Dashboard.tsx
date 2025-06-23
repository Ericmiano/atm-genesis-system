
import React, { useState, useEffect } from 'react';
import { useSupabaseATM } from '../contexts/SupabaseATMContext';
import { AutomatedPaymentService } from '../services/automatedPaymentService';
import EnhancedSidebar from './dashboard/EnhancedSidebar';
import EnhancedTopNavBar from './dashboard/EnhancedTopNavBar';
import OverviewScreen from './dashboard/OverviewScreen';
import TransactionsScreen from './dashboard/TransactionsScreen';
import LoansScreen from './dashboard/LoansScreen';
import BillsScreen from './dashboard/BillsScreen';
import SettingsScreen from './dashboard/SettingsScreen';
import SystemMetricsScreen from './dashboard/SystemMetricsScreen';
import AnalyticsDashboard from './dashboard/AnalyticsDashboard';
import AnalyticsInsights from './dashboard/AnalyticsInsights';
import AnalyticsReports from './dashboard/AnalyticsReports';
import AdvancedSecurityDashboard from './dashboard/AdvancedSecurityDashboard';
import UserManagement from './UserManagement';
import { useTransactions, useLoans, useBills, useAdminUsers } from '../hooks/useQueries';

const Dashboard: React.FC = () => {
    console.log('Dashboard component is rendering...');
    
    const { currentUser, logout } = useSupabaseATM();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Use React Query hooks for data fetching
    const { data: transactions = [], isLoading: transactionsLoading } = useTransactions(currentUser?.id);
    const { data: loans = [], isLoading: loansLoading } = useLoans(currentUser?.id);
    const { data: bills = [], isLoading: billsLoading } = useBills(currentUser?.id);
    const { data: users = [], isLoading: usersLoading } = useAdminUsers();

    // Process automated payments when dashboard loads
    useEffect(() => {
        const processPayments = async () => {
            try {
                if (currentUser?.id) {
                    await AutomatedPaymentService.processAutomatedPayments(currentUser.id);
                }
            } catch (error) {
                console.error('Error processing automated payments:', error);
            }
        };

        if (currentUser) {
            processPayments();
        }
    }, [currentUser]);

    const overviewStats = {
        recentTransactions: transactions.slice(0, 4),
        totalTransactions: transactions.length
    };

    const handleSidebarToggle = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleMobileSidebarToggle = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'overview':
                return <OverviewScreen stats={overviewStats} currentUser={currentUser} />;
            case 'transactions':
                return <TransactionsScreen transactions={transactions} onTransactionSuccess={() => console.log('Transaction success')} />;
            case 'loans':
                return <LoansScreen loans={loans} onApplyNew={() => console.log('Navigate to apply loan form')} />;
            case 'bills':
                return <BillsScreen bills={bills} onAddBill={() => console.log('Navigate to add bill form')} />;
            case 'settings':
                return <SettingsScreen currentUser={currentUser} onSaveSettings={() => console.log('Save settings')} />;
            case 'analytics':
                return currentUser?.role === 'ADMIN' ? (
                    <AnalyticsDashboard />
                ) : (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
                        <p className="text-gray-400">You don't have permission to access analytics.</p>
                    </div>
                );
            case 'analytics-insights':
                return currentUser?.role === 'ADMIN' ? (
                    <AnalyticsInsights />
                ) : (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
                        <p className="text-gray-400">You don't have permission to access analytics insights.</p>
                    </div>
                );
            case 'analytics-reports':
                return currentUser?.role === 'ADMIN' ? (
                    <AnalyticsReports />
                ) : (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
                        <p className="text-gray-400">You don't have permission to access analytics reports.</p>
                    </div>
                );
            case 'security-dashboard':
                return currentUser?.role === 'ADMIN' ? (
                    <AdvancedSecurityDashboard />
                ) : (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
                        <p className="text-gray-400">You don't have permission to access security dashboard.</p>
                    </div>
                );
            case 'overdrafts':
                return (
                    <div className="animate-fade-in-up">
                        <div className="banking-card p-8 text-center">
                            <h2 className="text-3xl font-bold text-[#F1F1F1] mb-4">Overdraft Management</h2>
                            <p className="text-gray-400 mb-6">Advanced overdraft features coming soon...</p>
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl">🏦</span>
                            </div>
                            <div className="max-w-md mx-auto">
                                <div className="banking-card p-6 bg-gradient-to-br from-blue-500/10 to-green-500/10">
                                    <h3 className="text-lg font-semibold text-[#F1F1F1] mb-2">Current Overdraft Status</h3>
                                    <p className="text-gray-400 text-sm">Available soon based on your transaction history and credit score</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'credit-score':
                return (
                    <div className="animate-fade-in-up">
                        <div className="banking-card p-8 text-center">
                            <h2 className="text-3xl font-bold text-[#F1F1F1] mb-4">Credit Score Tracker</h2>
                            <p className="text-gray-400 mb-6">Monitor and improve your financial health</p>
                            <div className="max-w-2xl mx-auto">
                                <div className="banking-card p-8 bg-gradient-to-br from-green-500/10 to-blue-500/10">
                                    <div className="text-center mb-6">
                                        <div className="text-6xl font-bold gradient-blue-green bg-clip-text text-transparent mb-2">
                                            {currentUser?.creditScore || 400}
                                        </div>
                                        <p className="text-gray-400">Current Credit Score</p>
                                    </div>
                                    <div className="credit-score-bar mb-4">
                                        <div 
                                            className="credit-score-progress" 
                                            style={{ width: `${((currentUser?.creditScore || 400) / 850) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                        <div className="text-center p-4 bg-green-500/10 rounded-xl">
                                            <div className="text-green-400 font-semibold">+15</div>
                                            <p className="text-xs text-gray-400">This Month</p>
                                        </div>
                                        <div className="text-center p-4 bg-blue-500/10 rounded-xl">
                                            <div className="text-blue-400 font-semibold">Good</div>
                                            <p className="text-xs text-gray-400">Rating</p>
                                        </div>
                                        <div className="text-center p-4 bg-yellow-500/10 rounded-xl">
                                            <div className="text-yellow-400 font-semibold">78%</div>
                                            <p className="text-xs text-gray-400">Health Score</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'admin':
                return currentUser?.role === 'ADMIN' ? (
                    <UserManagement 
                        users={users} 
                        onUserCreated={() => console.log('User created')} 
                        onUserDeleted={() => console.log('User deleted')} 
                    />
                ) : (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
                        <p className="text-gray-400">You don't have permission to access the admin panel.</p>
                    </div>
                );
            case 'system-metrics':
                return currentUser?.role === 'ADMIN' ? (
                    <SystemMetricsScreen />
                ) : (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-[#F1F1F1] mb-4">Access Denied</h2>
                        <p className="text-gray-400">You don't have permission to access system metrics.</p>
                    </div>
                );
            default:
                return <OverviewScreen stats={overviewStats} currentUser={currentUser} />;
        }
    };

    return (
        <div className="flex h-screen bg-[#0E0E0E] text-[#F1F1F1] overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <EnhancedSidebar 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    onLogout={logout}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={handleSidebarToggle}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                    <div className="relative">
                        <EnhancedSidebar 
                            activeTab={activeTab} 
                            setActiveTab={(tab) => {
                                setActiveTab(tab);
                                setMobileSidebarOpen(false);
                            }} 
                            onLogout={logout}
                        />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <EnhancedTopNavBar 
                    onToggleSidebar={handleMobileSidebarToggle}
                    onLogout={logout}
                />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0E0E0E]">
                    <div className="container mx-auto p-6 max-w-7xl">
                        <div className="animate-fade-in-up">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
