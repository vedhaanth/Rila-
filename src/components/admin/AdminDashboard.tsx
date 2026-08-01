import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Order, Product, ProfitLossReport } from '../../types';
import { formatINR } from '../../utils/currency';
import {
  ShoppingBag,
  Wallet,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Boxes,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { currentPortal, activeAdminId, adminProfiles, refreshDataFlag, setActiveAdminTab, setViewingInvoice } = useApp();
  const [pnlReport, setPnlReport] = useState<ProfitLossReport | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const adminProfile = adminProfiles[activeAdminId];

  const fetchDashboardData = async () => {
    setLoading(true);
    const [pnl, ords, prods] = await Promise.all([
      api.getPnLReport(activeAdminId),
      api.getOrders({ admin_id: activeAdminId }),
      api.getProducts({ admin_owner: activeAdminId })
    ]);
    setPnlReport(pnl);
    setOrders(ords);
    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeAdminId, refreshDataFlag]);

  const lowStockProducts = products.filter((p) => p.stock < 10);

  const COLORS = ['#d97706', '#10b981', '#f59e0b', '#0284c7', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-serif-display">
            ERP Business Executive Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Financial performance & operational metrics for <b className="text-amber-800 dark:text-amber-400">{adminProfile?.business_name}</b>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-300/60 font-mono text-xs font-black">
            GSTIN: {adminProfile?.gstin}
          </span>
        </div>
      </div>

      {/* Low Stock Banner Alert */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/50 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <b className="font-extrabold">Inventory Notice:</b> {lowStockProducts.length} product(s) are running below safety threshold (&lt;10 units).
            </span>
          </div>
          <button
            onClick={() => setActiveAdminTab('inventory')}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow transition"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Revenue */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-2 hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-amber-800/80 dark:text-slate-400 tracking-wider">Sales Revenue</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300/40 font-black text-sm">
              ₹
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
            {formatINR(pnlReport?.sales_revenue ?? 0)}
          </span>
          <div className="flex items-center text-[11px] text-emerald-700 dark:text-emerald-400 font-bold gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% organic growth
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-2 hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-amber-800/80 dark:text-slate-400 tracking-wider">Total Orders</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
            {pnlReport?.total_orders || 0}
          </span>
          <div className="text-[11px] text-slate-500 font-medium">
            E-Commerce + Counter POS
          </div>
        </div>

        {/* Card 3: Expenses */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-2 hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-amber-800/80 dark:text-slate-400 tracking-wider">Business Expenses</span>
            <div className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-300/40">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
            {formatINR(pnlReport?.expenses ?? 0)}
          </span>
          <div className="text-[11px] text-slate-500 font-medium">
            Inventory, logistics & salary
          </div>
        </div>

        {/* Card 4: Net Profit */}
        <div className="p-5 bg-slate-950 text-amber-50 rounded-3xl border border-amber-500/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">Net Profit</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono block text-emerald-400">
            {formatINR(pnlReport?.net_profit ?? 0)}
          </span>
          <div className="text-[11px] text-amber-200/70 font-medium">
            Formula: Revenue - Expenses
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Sales vs Expenses vs Profit */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold font-serif-display text-slate-900 dark:text-white text-base">Sales Revenue & Profit Performance</h3>
              <p className="text-xs text-slate-500 font-medium">Daily financial breakdown for current period</p>
            </div>
            <button
              onClick={() => setActiveAdminTab('reports')}
              className="text-xs text-amber-800 dark:text-amber-400 font-extrabold hover:underline"
            >
              Full P&L Report
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlReport?.daily_sales || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #f59e0b40', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="sales" fill="#d97706" name="Sales Revenue (₹)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses (₹)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" name="Net Profit (₹)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expenses Breakdown */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold font-serif-display text-slate-900 dark:text-white text-base">Expense Allocation</h3>
            <p className="text-xs text-slate-500 font-medium">Category distribution analysis</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {pnlReport?.expense_breakdown && pnlReport.expense_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pnlReport.expense_breakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ category }) => category}
                  >
                    {pnlReport.expense_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #f59e0b40', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400 font-medium">No expense records found.</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-serif-display text-slate-900 dark:text-white text-base">Recent Assigned Customer Orders</h3>
            <button
              onClick={() => setActiveAdminTab('orders')}
              className="text-xs text-amber-800 dark:text-amber-400 font-extrabold hover:underline"
            >
              View All Orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-amber-200/60 dark:border-slate-800 text-amber-800/70 dark:text-slate-400 uppercase font-extrabold text-[10px]">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-slate-800">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.order_id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">#{o.order_id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{o.customer_name}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">{formatINR(o.total_amount ?? 0)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-300/50 text-[10px] font-black uppercase">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setViewingInvoice(o)}
                        className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-xl transition"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Widget */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-serif-display text-slate-900 dark:text-white text-base">Low Stock Warnings</h3>
            <button
              onClick={() => setActiveAdminTab('inventory')}
              className="text-xs text-amber-800 dark:text-amber-400 font-extrabold hover:underline"
            >
              Inventory
            </button>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                All stock levels healthy!
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.product_id}
                  className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={p.image} alt={p.product_name} className="w-10 h-10 rounded object-contain bg-white p-1 border" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.product_name}</h4>
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono font-bold">
                        Only {p.stock} units left
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
