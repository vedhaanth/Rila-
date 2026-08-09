import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminId } from '../../types';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Receipt,
  Wallet,
  BarChart3,
  Users,
  Settings,
  Shield,
  LogOut,
  Mail,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import rilaLogo from '../../assets/images/rila_logo.jpg';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    activeAdminId,
    setActiveAdminId,
    setCurrentPortal,
    setIsEmailLogModalOpen,
    currentUser,
    addToast,
    adminProfiles
  } = useApp();

  const { logout } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const activeAdminProfile = adminProfiles[activeAdminId];

  const menuItems = [
    { id: 'dashboard', label: 'ERP Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products Catalog', icon: Package },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory Stock', icon: Boxes },
    { id: 'billing', label: 'Billing & POS', icon: Receipt },
    { id: 'expenses', label: 'Expense Tracker', icon: Wallet },
    { id: 'reports', label: 'P&L Reports', icon: BarChart3 },
    { id: 'customers', label: 'Customer Directory', icon: Users },
    { id: 'employees', label: 'Staff & Employees', icon: Shield },
    { id: 'settings', label: 'Division Settings', icon: Settings }
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSwitchAdmin = (newId: AdminId) => {
    setActiveAdminId(newId);
    setActiveAdminTab('dashboard');
    addToast('Switched Division Portal', `Now managing ${adminProfiles[newId]?.business_name || newId}`);
  };

  return (
    <div className={`min-h-screen bg-stone-50 text-slate-900 flex font-sans ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-950 text-amber-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 border-r border-amber-500/30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={rilaLogo} alt="RILA Logo" className="h-9 w-auto object-contain rounded-lg border border-slate-800 bg-white p-0.5" />
              <div>
                <span className="font-serif-display font-black text-sm tracking-tight text-white block">RILA ERP</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">
                  Dual Admin Management
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-amber-300 p-1 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveAdminTab(item.id as any);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${isActive ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold border border-yellow-300' : 'text-amber-100/80 hover:bg-slate-900 hover:text-white'}`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-amber-500/20 space-y-3">
          <button
            onClick={() => setCurrentPortal('customer')}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-2xl text-xs font-extrabold transition flex items-center justify-center gap-2 shadow"
          >
            Exit to Customer Storefront
          </button>

          <button
            onClick={() => {
              if (confirm('Sign out from admin account?')) {
                logout();
              }
            }}
            className="w-full mt-2 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-extrabold transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>

          <div className="flex items-center justify-between text-xs text-amber-300/80 pt-1">
            <span className="font-mono text-[10px]">v2.6 RILA ERP</span>
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-xl bg-slate-900 text-amber-300 hover:text-white border border-amber-500/20"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-300" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="bg-white border-b border-amber-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-800 hover:bg-amber-50 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mb-0.5">
                <span>Admin ERP</span>
                <span className="text-slate-300">›</span>
                <span className="text-amber-800 font-bold capitalize">{activeAdminTab}</span>
              </div>
              <h2 className="font-serif-display font-extrabold text-base text-slate-900 capitalize">
                {menuItems.find(m => m.id === activeAdminTab)?.label || activeAdminTab}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Managing <span className="font-bold text-amber-800">{activeAdminProfile?.business_name}</span> ({activeAdminId.toUpperCase()})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-1">
              {(['admin1', 'admin2'] as AdminId[]).map((adminId) => {
                const isActive = activeAdminId === adminId;
                const label = adminId === 'admin1' ? 'Division A' : 'Division B';

                return (
                  <button
                    key={adminId}
                    onClick={() => handleSwitchAdmin(adminId)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${isActive ? 'bg-slate-950 text-amber-400 shadow' : 'text-slate-700 hover:bg-white hover:text-slate-900'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Quick Action Shortcuts */}
            <button
              onClick={() => setActiveAdminTab('billing')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-2xl text-xs font-black shadow transition border border-yellow-300"
            >
              <Plus className="w-3.5 h-3.5 text-slate-950" /> New POS Bill
            </button>

            <button
              onClick={() => setIsEmailLogModalOpen(true)}
              className="p-2 text-slate-700 hover:bg-amber-50 rounded-xl relative border border-amber-200"
              title="Nodemailer Email Simulator"
            >
              <Mail className="w-4 h-4 text-amber-700" />
            </button>

            <div className="h-6 w-px bg-amber-200"></div>

            {/* Logged in admin profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 border border-amber-500/40 font-black text-xs flex items-center justify-center">
                {activeAdminId === 'admin1' ? 'A1' : 'A2'}
              </div>
              <div className="hidden md:block text-xs text-left">
                <span className="font-bold block text-slate-900">{activeAdminProfile?.admin_name}</span>
                <span className="text-[10px] text-slate-500 font-mono">GST: {activeAdminProfile?.gstin}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
