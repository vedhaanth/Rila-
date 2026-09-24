import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Settings, Shield, Building2, Mail, Phone, Save, QrCode } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { activeAdminId, addToast, adminProfiles, triggerRefresh } = useApp();
  const profile = adminProfiles[activeAdminId];

  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [adminName, setAdminName] = useState(profile?.admin_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [gstin, setGstin] = useState(profile?.gstin || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [upiVpa, setUpiVpa] = useState(`${activeAdminId}@icici`);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || '');
      setAdminName(profile.admin_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setGstin(profile.gstin || '');
      setAddress(profile.address || '');
      setUpiVpa(`${activeAdminId}@icici`);
    }
  }, [profile, activeAdminId]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdmin(activeAdminId, {
        business_name: businessName,
        admin_name: adminName,
        email: email,
        phone: phone,
        gstin: gstin,
        address: address
      });
      triggerRefresh();
      addToast('Settings Saved', `Updated configuration for ${businessName}`);
    } catch (err) {
      addToast('Error', 'Failed to save settings', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Admin ERP Store Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business details, GSTIN tax identifiers, payment VPA, and Nodemailer email rules
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b pb-2 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-500" />
          Business Profile & GST Registration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Business Legal Trade Name
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Admin Owner Name
            </label>
            <input
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              GSTIN Registration Number
            </label>
            <input
              type="text"
              required
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Store Contact Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Store Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Warehouse / Store Counter Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b pt-4 pb-2 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-indigo-500" />
          UPI Merchant VPA Configuration
        </h3>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Virtual Payment Address (VPA) for UPI QR Payments
          </label>
          <input
            type="text"
            required
            value={upiVpa}
            onChange={(e) => setUpiVpa(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 font-mono"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Store Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
