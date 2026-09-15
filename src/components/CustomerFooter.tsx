import React from 'react';
import { useApp } from '../context/AppContext';
import { Truck, Lock, Mail, Phone, MapPin, Sparkles, Heart, ShieldCheck } from 'lucide-react';

export const CustomerFooter: React.FC = () => {
  const { setActiveCustomerTab, adminProfiles } = useApp();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      {/* Value Proposition Badges */}
      <div className="border-b border-stone-800 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-amber-400 border border-stone-700 flex items-center justify-center mb-2">
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-bold text-stone-100 mb-0.5">Express Delivery</h4>
            <p className="text-[11px] text-stone-400">Fast, fresh & reliable</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-amber-400 border border-stone-700 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-bold text-stone-100 mb-0.5">Verified GST Invoices</h4>
            <p className="text-[11px] text-stone-400">Auto tax compliant invoicing</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-amber-400 border border-stone-700 flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-bold text-stone-100 mb-0.5">Healthy Choice</h4>
            <p className="text-[11px] text-stone-400">Quality you can trust</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-amber-400 border border-stone-700 flex items-center justify-center mb-2">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-bold text-stone-100 mb-0.5">Secure Payment</h4>
            <p className="text-[11px] text-stone-400">UPI, Cards &amp; Net Banking</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-700 text-white font-serif-display font-bold flex items-center justify-center text-base">
              R
            </div>
            <span className="font-serif-display font-bold text-base text-white tracking-tight">RILA STORE</span>
          </div>
          <p className="text-stone-400 leading-relaxed font-normal">
            Your trusted destination for healthy, quality products. Browse our curated selection and enjoy fast, reliable delivery to your door.
          </p>
        </div>

        {/* Col 2: Business Divisions */}
        <div className="space-y-3">
          <h4 className="font-bold text-amber-400 uppercase tracking-widest text-[11px]">Business Divisions</h4>
          <div className="space-y-2">
            <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700">
              <span className="font-bold text-stone-200 block">{adminProfiles.admin1?.business_name || 'Admin 1'}</span>
              <span className="text-[10px] text-stone-400 block font-mono">GSTIN: {adminProfiles.admin1?.gstin || ''}</span>
              <span className="text-[10px] text-amber-300 font-medium block mt-0.5">{adminProfiles.admin1?.categories?.join(', ') || 'Electronics & Gadgets'}</span>
            </div>

            <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700">
              <span className="font-bold text-stone-200 block">{adminProfiles.admin2?.business_name || 'Admin 2'}</span>
              <span className="text-[10px] text-stone-400 block font-mono">GSTIN: {adminProfiles.admin2?.gstin || ''}</span>
              <span className="text-[10px] text-amber-300 font-medium block mt-0.5">{adminProfiles.admin2?.categories?.join(', ') || 'Home & Lifestyle'}</span>
            </div>
          </div>
        </div>

        {/* Col 3: Quick Links */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-amber-400 uppercase tracking-widest text-[11px]">Navigation</h4>
          <ul className="space-y-2 text-stone-400 font-normal">
            <li>
              <button onClick={() => setActiveCustomerTab('home')} className="hover:text-stone-100 transition">Home</button>
            </li>
            <li>
              <button onClick={() => setActiveCustomerTab('products')} className="hover:text-stone-100 transition">All Products</button>
            </li>
            <li>
              <button onClick={() => setActiveCustomerTab('about')} className="hover:text-stone-100 transition">About Us</button>
            </li>
            <li>
              <button onClick={() => setActiveCustomerTab('contact')} className="hover:text-stone-100 transition">Contact &amp; Support</button>
            </li>
            <li>
              <button onClick={() => setActiveCustomerTab('feedback')} className="hover:text-stone-100 transition">Reviews &amp; Feedback</button>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div className="space-y-3">
          <h4 className="font-bold text-amber-400 uppercase tracking-widest text-[11px]">Contact &amp; Support</h4>
          <div className="space-y-2 text-stone-400 font-normal">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400" /> +91 98765 12345
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400" /> support@rila.com
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> RILA Store, MG Road, Indiranagar, Bengaluru
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 py-4 text-center text-stone-500 text-[11px]">
        © 2026 RILA STORE. All rights reserved.
      </div>
    </footer>
  );
};
