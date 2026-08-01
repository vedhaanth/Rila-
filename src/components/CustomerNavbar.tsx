import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/currency';
import {
  ShoppingBag,
  Search,
  User,
  Mail,
  LogOut,
  PackageCheck,
  ChevronDown,
  Menu,
  X,
  MapPin,
  Clock,
  Heart
} from 'lucide-react';

import rilaLogo from '../assets/images/rila_logo.jpg';

export const CustomerNavbar: React.FC<{
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}> = ({ searchQuery, setSearchQuery }) => {
  const {
    activeCustomerTab,
    setActiveCustomerTab,
    cartItemCount,
    cartTotal,
    cartSubtotal,
    setIsCartOpen,
    currentUser,
    setIsLoginModalOpen,
    logout,
    setIsEmailLogModalOpen
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'All Products' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
    { id: 'feedback', label: 'Reviews' },
    ...(currentUser ? [{ id: 'orders', label: 'My Orders' }] : [])
  ];

  return (
    <header className={`sticky top-0 z-40 bg-white text-slate-900 font-sans transition-shadow duration-200 ${isScrolled ? 'shadow-md' : 'shadow-sm border-b border-stone-200/80'}`}>

      {/* Utility top bar */}
      <div className="bg-stone-950 text-stone-300 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <MapPin className="w-3 h-3" />
              <span>Indiranagar, Bengaluru</span>
            </div>
            <span className="text-stone-600 hidden sm:block">|</span>
            <span className="hidden sm:flex items-center gap-1 text-stone-300 font-medium">
              <Clock className="w-3 h-3 text-amber-400" />
              10–15 Min Delivery · Free over ₹499
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEmailLogModalOpen(true)}
              className="flex items-center gap-1 text-stone-400 hover:text-amber-400 transition font-medium"
            >
              <Mail className="w-3 h-3" />
              <span className="hidden sm:inline">Email Logs</span>
            </button>
            <span className="text-stone-600 hidden sm:block">|</span>
            <span className="hidden sm:inline text-stone-400 font-medium">
              🇮🇳 100% A2 Desi Ghee · FSSAI Certified
            </span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <button
          onClick={() => setActiveCustomerTab('home')}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <img src={rilaLogo} alt="RILA Logo" className="h-10 w-auto object-contain rounded-lg border border-stone-200" />
          <div className="hidden sm:block text-left">
            <span className="font-serif-display font-bold text-lg text-stone-900 leading-none block tracking-tight">RILA</span>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest leading-none">Healthy Choice</span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeCustomerTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveCustomerTab(link.id as any)}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                  ? 'text-stone-900 font-semibold bg-amber-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder='Search products...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeCustomerTab !== 'products') setActiveCustomerTab('products');
              }}
              className="pl-9 pr-3 py-2 text-sm rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20 w-52 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Profile */}
          {currentUser ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition"
              >
                <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-semibold text-xs">{currentUser.name.split(' ')[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-100 py-1.5 z-50 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <p className="font-bold text-stone-900 text-sm">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => { setActiveCustomerTab('orders'); setIsProfileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-stone-50 flex items-center gap-2.5 text-sm font-medium text-stone-700 transition"
                  >
                    <PackageCheck className="w-4 h-4 text-amber-600" /> My Orders
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Sign out from your account?')) {
                        logout();
                        setIsProfileMenuOpen(false);
                      }
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-rose-50 flex items-center gap-2.5 text-sm font-medium text-rose-600 transition border-t border-stone-100"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3 py-2 bg-stone-950 hover:bg-stone-800 text-white rounded-xl transition group"
            title="View Cart"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline text-sm font-semibold text-amber-50">
              {formatINR(cartSubtotal ?? cartTotal ?? 0)}
            </span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center border border-white shadow">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-xl transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/40 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 bg-white border-t border-stone-200 shadow-xl z-40 lg:hidden animate-fade-in">
            <div className="p-4 space-y-1">
              {/* Mobile search */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeCustomerTab !== 'products') setActiveCustomerTab('products');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                />
              </div>
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => { setActiveCustomerTab(link.id as any); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${activeCustomerTab === link.id
                    ? 'bg-stone-950 text-amber-400 font-bold'
                    : 'text-stone-700 hover:bg-stone-50'
                    }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
