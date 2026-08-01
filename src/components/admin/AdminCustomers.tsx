import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { UserProfile } from '../../types';
import { Users, Mail, Phone, MapPin, PackageCheck, ShoppingBag } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { activeAdminId, refreshDataFlag } = useApp();
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    const list = await api.getCustomers();
    setCustomers(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [activeAdminId, refreshDataFlag]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Customer Directory & CRM
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Directory of buyers and corporate clients registered across Made Pure & Natural Foods ERP
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-extrabold text-[10px]">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Email</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Shipping Address</th>
                <th className="py-3 px-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.map((c) => (
                <tr key={c.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{c.user_id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">{c.email}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{c.phone}</td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{c.address}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">July 2026</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
