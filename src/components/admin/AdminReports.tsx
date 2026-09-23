import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Bill, ProfitLossReport } from '../../types';
import { formatINR } from '../../utils/currency';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Wallet,
  Printer,
  Calendar,
  FileSpreadsheet,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const AdminReports: React.FC = () => {
  const { activeAdminId, refreshDataFlag, adminProfiles } = useApp();
  const [report, setReport] = useState<ProfitLossReport | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const adminProfile = adminProfiles[activeAdminId];

  const fetchReport = async () => {
    setLoading(true);
    const [data, billData] = await Promise.all([
      api.getPnLReport(activeAdminId),
      api.getBills(activeAdminId)
    ]);
    setReport(data);
    setBills(billData);
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, [activeAdminId, refreshDataFlag]);

  const handlePrintPnlStatement = () => {
    window.print();
  };

  const gstBills = bills.filter((bill) => Boolean(String(bill.customer_gstin || '').trim()));
  const nonGstBills = bills.filter((bill) => !String(bill.customer_gstin || '').trim());

  const exportTaxReport = (reportBills: Bill[], label: string) => {
    if (reportBills.length === 0) return;

    const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Invoice Number', 'Date', 'Customer', 'Customer GSTIN', 'Subtotal', 'GST', 'Grand Total', 'Amount Paid', 'Payment Method'],
      ...reportBills.map((bill) => [
        bill.invoice_number,
        bill.created_at,
        bill.customer_name,
        bill.customer_gstin || '',
        bill.subtotal ?? 0,
        bill.tax_gst ?? 0,
        bill.grand_total ?? 0,
        bill.amount_paid ?? 0,
        bill.payment_method || bill.payment_mode || ''
      ])
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const anchor = document.createElement('a');
    anchor.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    anchor.download = `${label.toLowerCase().replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.csv`;
    anchor.click();
  };

  const marginPercent = report && report.sales_revenue > 0
    ? ((report.net_profit / report.sales_revenue) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Profit & Loss (P&L) Executive Statement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified financial P&L audit for <b>{adminProfile?.business_name}</b> (GSTIN: {adminProfile?.gstin})
          </p>
        </div>

        <button
          onClick={handlePrintPnlStatement}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print Statement
        </button>
      </div>

      {/* Main P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-extrabold uppercase text-slate-400">Gross Revenue</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
            {formatINR(report?.finance_metrics?.grossRevenue ?? report?.sales_revenue ?? 0)}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">Gross Order & POS Invoices</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-extrabold uppercase text-slate-400">Total Expenses</span>
          <span className="text-2xl font-black text-rose-600 font-mono block">
            {formatINR(-(report?.expenses ?? 0))}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">Overheads + Purchases</span>
        </div>

        <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg space-y-1">
          <span className="text-xs font-extrabold uppercase text-indigo-400">Net Profit</span>
          <span className="text-2xl font-black text-emerald-400 font-mono block">
            {formatINR(report?.finance_metrics?.netProfit ?? report?.net_profit ?? 0)}
          </span>
          <span className="text-[10px] text-slate-300 block font-mono">Revenue - Expenses</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-extrabold uppercase text-slate-400">Gross Profit</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono block">
            {formatINR(report?.finance_metrics?.grossProfit ?? 0)}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">Revenue - Purchase Cost</span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Daily Sales vs Expense Trend</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report?.daily_sales || []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="sales" fill="#6366f1" name="Sales (₹)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses (₹)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#10b981" name="Profit (₹)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Separate GST and non-GST invoice reports */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {[
          { title: 'GST Invoice Report', label: 'GST', reportBills: gstBills, accent: 'indigo' },
          { title: 'Non-GST Invoice Report', label: 'Non-GST', reportBills: nonGstBills, accent: 'slate' }
        ].map(({ title, label, reportBills, accent }) => {
          const reportTotal = reportBills.reduce((sum, bill) => sum + (bill.grand_total ?? 0), 0);
          const reportTax = reportBills.reduce((sum, bill) => sum + (bill.tax_gst ?? 0), 0);

          return (
            <div key={label} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{reportBills.length} invoice(s) based on customer GSTIN</p>
                </div>
                <button
                  type="button"
                  onClick={() => exportTaxReport(reportBills, label)}
                  disabled={reportBills.length === 0}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${accent === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-700 hover:bg-slate-800'} text-white disabled:bg-slate-300 disabled:cursor-not-allowed`}
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500 block">Invoice Total</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(reportTotal)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500 block">GST Collected</span>
                  <span className="font-mono font-bold text-emerald-600">{formatINR(reportTax)}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr><th className="py-2 pr-3">Invoice</th><th className="py-2 pr-3">Customer</th><th className="py-2 text-right">Total</th></tr>
                  </thead>
                  <tbody>
                    {reportBills.slice(0, 8).map((bill) => (
                      <tr key={bill.bill_id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-3 font-mono">{bill.invoice_number}</td>
                        <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">{bill.customer_name}</td>
                        <td className="py-2 text-right font-mono font-bold">{formatINR(bill.grand_total ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportBills.length > 8 && <p className="text-[10px] text-slate-400 mt-2">Showing first 8 invoices. Export CSV contains all invoices.</p>}
                {reportBills.length === 0 && <p className="text-xs text-slate-500 py-3">No invoices in this report.</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed P&L Statement Table */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 dark:text-white text-base border-b pb-3">
          Vyapar Financial Income Statement
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b font-bold text-slate-900 dark:text-white">
            <span>A. Gross Sales Revenue (Online + Counter POS):</span>
            <span className="font-mono">{formatINR(report?.sales_revenue ?? 0)}</span>
          </div>

          <div className="pt-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
            B. Deductions & Operating Expenses:
          </div>

          {(report?.expense_breakdown || []).map((item) => (
            <div key={item.category} className="flex justify-between py-1 px-4 text-slate-600 dark:text-slate-300">
              <span>• {item.category}:</span>
              <span className="font-mono text-rose-600">-{formatINR(item?.amount ?? 0)}</span>
            </div>
          ))}

          <div className="flex justify-between py-2 border-t font-bold text-slate-900 dark:text-white text-sm">
            <span>Total Deductions (Total Expenses):</span>
            <span className="font-mono text-rose-600">{formatINR(-(report?.expenses ?? 0))}</span>
          </div>

          <div className="flex justify-between py-3 bg-emerald-50 dark:bg-emerald-950/40 px-4 rounded-xl border border-emerald-200 dark:border-emerald-900 font-extrabold text-slate-900 dark:text-white text-base">
            <span>NET OPERATING PROFIT:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {formatINR(report?.finance_metrics?.netProfit ?? report?.net_profit ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
