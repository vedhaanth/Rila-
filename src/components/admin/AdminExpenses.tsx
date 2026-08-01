import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Expense, Supplier, ProfitLossReport } from '../../types';
import { formatINR, formatINRCompact } from '../../utils/currency';
import {
  Wallet,
  Plus,
  Trash2,
  X,
  DollarSign,
  Calendar,
  Tag,
  Search,
  Filter,
  FileText,
  Building2,
  ReceiptText,
  TrendingUp,
  CircleDollarSign
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const AdminExpenses: React.FC = () => {
  const { activeAdminId, refreshDataFlag, triggerRefresh, addToast } = useApp();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [report, setReport] = useState<ProfitLossReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Product Purchase',
    title: '',
    vendor: '',
    invoiceNumber: '',
    purchaseOrderNumber: '',
    amount: 500,
    gst: 0,
    discount: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    description: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Product Purchase', 'Raw Materials', 'Transportation', 'Employee Salary', 'Shop Rent', 'Electricity Bill', 'Internet Bill', 'Packaging', 'Marketing', 'Advertisement', 'Equipment Maintenance', 'Office Supplies', 'Miscellaneous'];
  const paymentMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque', 'Wallet'];

  const fetchExpenses = async () => {
    setLoading(true);
    const [list, suppList, pnl] = await Promise.all([
      api.getExpenses({ admin_id: activeAdminId }),
      api.getSuppliers(activeAdminId),
      api.getPnLReport(activeAdminId)
    ]);
    setExpenses(list);
    setSuppliers(suppList);
    setReport(pnl);
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, [activeAdminId, refreshDataFlag]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense({
        ...formData,
        category: formData.category as any,
        admin_id: activeAdminId,
        vendor: formData.vendor || 'Internal Vendor',
        invoice_number: formData.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
        purchase_order_number: formData.purchaseOrderNumber || `PO-${Date.now().toString().slice(-4)}`,
        gst: Number(formData.gst || 0),
        discount: Number(formData.discount || 0),
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentStatus as any,
        description: formData.description || formData.title,
        notes: formData.notes
      });
      addToast('Expense Logged', `Recorded ${formatINR(Number(formData.amount))} under ${formData.category}`);
      setIsModalOpen(false);
      setFormData({
        category: 'Product Purchase',
        title: '',
        vendor: '',
        invoiceNumber: '',
        purchaseOrderNumber: '',
        amount: 500,
        gst: 0,
        discount: 0,
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
        description: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      triggerRefresh();
    } catch (err: any) {
      addToast('Expense Error', err.message, 'error');
    }
  };

  const handleDeleteExpense = async (id: string, desc: string) => {
    if (confirm(`Delete expense record "${desc}"?`)) {
      await api.deleteExpense(id);
      addToast('Expense Deleted', 'Record removed.');
      triggerRefresh();
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingAmount = expenses.filter((e) => e.payment_status === 'Pending').reduce((sum, e) => sum + (e.amount || 0), 0);
  const paidAmount = expenses.filter((e) => e.payment_status === 'Paid').reduce((sum, e) => sum + (e.amount || 0), 0);
  const cashExpenses = expenses.filter((e) => e.payment_method === 'Cash').reduce((sum, e) => sum + (e.amount || 0), 0);
  const bankExpenses = expenses.filter((e) => e.payment_method && ['Credit Card', 'Debit Card', 'Net Banking', 'Cheque'].includes(e.payment_method)).reduce((sum, e) => sum + (e.amount || 0), 0);

  const categoryChartData = Object.values(expenses.reduce<Record<string, { category: string; amount: number }>>((acc, curr) => {
    if (!acc[curr.category]) { acc[curr.category] = { category: curr.category, amount: 0 }; }
    acc[curr.category].amount += curr.amount || 0;
    return acc;
  }, {}));

  const filteredExpenses = expenses.filter((expense) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || expense.description.toLowerCase().includes(term) || expense.vendor?.toLowerCase().includes(term) || expense.invoice_number?.toLowerCase().includes(term) || expense.purchase_order_number?.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;
    const matchesVendor = vendorFilter === 'All' || expense.vendor === vendorFilter;
    const matchesPayment = paymentFilter === 'All' || expense.payment_method === paymentFilter;
    const matchesStatus = statusFilter === 'All' || expense.payment_status === statusFilter;
    return matchesSearch && matchesCategory && matchesVendor && matchesPayment && matchesStatus;
  });

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Expense Management & Finance Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create, manage, and analyze every expense for the selected division without sharing records across admins.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Today', value: `${formatINRCompact(report?.finance_metrics?.totalExpenses || totalExpenseAmount)}` },
          { label: 'Weekly', value: `${formatINRCompact(report?.finance_metrics?.totalExpenses || totalExpenseAmount)}` },
          { label: 'Monthly', value: `${formatINRCompact(report?.finance_metrics?.totalExpenses || totalExpenseAmount)}` },
          { label: 'Yearly', value: `${formatINRCompact(report?.finance_metrics?.totalExpenses || totalExpenseAmount)}` }
        ].map((card) => (
          <div key={card.label} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] uppercase text-slate-400 font-extrabold">{card.label} Expenses</p>
            <p className="text-xl font-black text-rose-600 font-mono">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"><p className="text-[10px] uppercase text-slate-400 font-extrabold">Total Expenses</p><p className="text-xl font-black text-slate-900 font-mono">{formatINR(totalExpenseAmount)}</p></div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"><p className="text-[10px] uppercase text-slate-400 font-extrabold">Pending Payments</p><p className="text-xl font-black text-amber-600 font-mono">{formatINR(pendingAmount)}</p></div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"><p className="text-[10px] uppercase text-slate-400 font-extrabold">Paid Expenses</p><p className="text-xl font-black text-emerald-600 font-mono">{formatINR(paidAmount)}</p></div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"><p className="text-[10px] uppercase text-slate-400 font-extrabold">Cash / Bank</p><p className="text-xl font-black text-slate-900 font-mono">{formatINR(cashExpenses)} / {formatINR(bankExpenses)}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Expense Ledger</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500"><Filter className="w-3.5 h-3.5" /> Filtered {filteredExpenses.length} records</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search vendor / invoice" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 text-sm" /></div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 text-sm"><option value="All">All Categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
            <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 text-sm"><option value="All">All Vendors</option>{suppliers.map((supplier) => <option key={supplier.supplier_id} value={supplier.supplier_name}>{supplier.supplier_name}</option>)}</select>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 text-sm"><option value="All">All Payments</option>{paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead><tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-extrabold text-[10px]"><th className="py-2.5 px-3">Expense ID</th><th className="py-2.5 px-3">Date</th><th className="py-2.5 px-3">Category</th><th className="py-2.5 px-3">Vendor</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Status</th><th className="py-2.5 px-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.expense_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{expense.expense_id}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{expense.date}</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">{expense.category}</span></td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{expense.vendor || 'Internal'}</td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-600">{formatINR(expense.amount || 0)}</td>
                    <td className="py-3 px-3"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${expense.payment_status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{expense.payment_status || 'Paid'}</span></td>
                    <td className="py-3 px-3 text-right"><button onClick={() => handleDeleteExpense(expense.expense_id, expense.description)} className="text-rose-500 hover:text-rose-700 p-1"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Expense Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {categoryChartData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryChartData} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={72}>{categoryChartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }} /></PieChart></ResponsiveContainer> : <span className="text-xs text-slate-400">No expense records found.</span>}
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border text-xs text-slate-600 space-y-1">
            <p className="font-extrabold text-slate-900">Financial Insight</p>
            <p>Live profit reports are driven by recorded expenses, purchases, bills, and tax assessments.</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border p-6 space-y-4 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Create Expense Entry</h3>
            <form onSubmit={handleCreateExpense} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Date</label><input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" /></div>
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"><option value="">Select</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Title</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500" /></div>
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vendor / Supplier</label><input type="text" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500" /></div>
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Invoice Number</label><input type="text" value={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500" /></div>
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Purchase Order Number</label><input type="text" value={formData.purchaseOrderNumber} onChange={(e) => setFormData({ ...formData, purchaseOrderNumber: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500" /></div>
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount</label><input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500" /></div>
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GST / Tax</label><input type="number" step="0.01" value={formData.gst} onChange={(e) => setFormData({ ...formData, gst: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500" /></div>
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount</label><input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500" /></div>
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label><select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">{paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select></div>
              <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Status</label><select value={formData.paymentStatus} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Partially Paid">Partially Paid</option></select></div>
              <div className="md:col-span-2"><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500" rows={3} /></div>
              <div className="md:col-span-2"><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500" rows={2} /></div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">Cancel</button><button type="submit" className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl shadow">Save Expense</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
