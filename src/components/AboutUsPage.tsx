import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ShieldCheck, Utensils, Layers, Sparkles, CheckCircle2, Heart } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  const { adminProfiles } = useApp();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-stone-50/50">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-800 font-extrabold text-xs uppercase tracking-widest inline-block border border-amber-300 shadow-sm">
          About RILA Store
        </span>
        <h1 className="font-serif-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Your Trusted Destination for Quality &amp; Healthy Choices
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-medium max-w-xl mx-auto">
          RILA Store is committed to bringing you the finest quality products across a wide range of categories. We believe in transparency, freshness, and delivering an exceptional shopping experience every time.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-950 text-amber-50 rounded-2xl space-y-4 border border-amber-500/30 shadow-xl">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl w-fit border border-amber-400/30">
            <Utensils className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="font-serif-display text-2xl font-extrabold text-white">Quality First Promise</h3>
          <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
            We source only the finest products and verify every item for quality, safety, and authenticity. No compromises — guaranteed.
          </p>
        </div>

        <div className="p-8 bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 text-slate-950 rounded-2xl space-y-4 shadow-xl">
          <div className="p-3 bg-slate-950/20 text-slate-950 rounded-2xl w-fit">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <h3 className="font-serif-display text-2xl font-extrabold text-slate-950">Express Delivery</h3>
          <p className="text-xs text-slate-900/90 leading-relaxed font-bold">
            Order with confidence and enjoy fast, reliable delivery across major metros. We handle your orders with care, every single time.
          </p>
        </div>
      </div>

      {/* Dual Business Admin Profiles */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-serif-display text-3xl font-extrabold text-slate-900">Verified Business Divisions</h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Operating under the RILA dual management ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin 1 */}
          <div className="p-6 bg-white rounded-2xl border border-amber-200/80 shadow-md flex gap-4">
            <img
              src={adminProfiles.admin1?.logo || ''}
              alt={adminProfiles.admin1?.business_name || 'Admin 1'}
              className="w-16 h-16 rounded-2xl object-cover border border-amber-300 shrink-0"
            />
            <div className="space-y-1.5 text-xs">
              <span className="font-serif-display font-extrabold text-lg text-slate-900 block">
                {adminProfiles.admin1?.business_name || 'Admin 1'}
              </span>
              <p className="text-slate-600 font-medium">{adminProfiles.admin1?.address}</p>
              <p className="font-mono text-amber-700 font-black">GSTIN: {adminProfiles.admin1?.gstin}</p>
              <p className="text-slate-700 pt-1 font-medium">
                Specializes in {adminProfiles.admin1?.categories?.join(', ') || 'Electronics & Gadgets'}.
              </p>
            </div>
          </div>

          {/* Admin 2 */}
          <div className="p-6 bg-white rounded-2xl border border-amber-200/80 shadow-md flex gap-4">
            <img
              src={adminProfiles.admin2?.logo || ''}
              alt={adminProfiles.admin2?.business_name || 'Admin 2'}
              className="w-16 h-16 rounded-2xl object-cover border border-amber-300 shrink-0"
            />
            <div className="space-y-1.5 text-xs">
              <span className="font-serif-display font-extrabold text-lg text-slate-900 block">
                {adminProfiles.admin2?.business_name || 'Admin 2'}
              </span>
              <p className="text-slate-600 font-medium">{adminProfiles.admin2?.address}</p>
              <p className="font-mono text-amber-700 font-black">GSTIN: {adminProfiles.admin2?.gstin}</p>
              <p className="text-slate-700 pt-1 font-medium">
                Specializes in {adminProfiles.admin2?.categories?.join(', ') || 'Home & Lifestyle'}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
