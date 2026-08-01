import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { formatINR } from '../utils/currency';
import {
  LogOut,
  RefreshCw,
  Search,
  ChevronDown,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  Edit2,
  Save,
  X,
  Shield
} from 'lucide-react';

const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLORS: Record<OrderStatus, string> = {
  'Pending': 'bg-amber-100 text-amber-800 border-amber-300',
  'Confirmed': 'bg-blue-100 text-blue-800 border-blue-300',
  'Packed': 'bg-purple-100 text-purple-800 border-purple-300',
  'Shipped': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Cancelled': 'bg-rose-100 text-rose-800 border-rose-300'
};

export const OrderManager: React.FC = () => {
  const {
    logout,
    setCurrentPortal,
    addToast,
    refreshDataFlag,
    activeAdminId,
    setActiveAdminId,
    adminProfiles
  } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await api.getOrders({});
      setOrders(allOrders);
    } catch (err) {
      addToast('Error Loading Orders', 'Failed to fetch orders. Please try again.', 'error');
      console.error('Failed to fetch orders:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [refreshDataFlag]);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchQuery ||
      o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (orderId: string) => {
    try {
      // In a real app, this would call an API endpoint
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.order_id === orderId ? { ...o, status: newStatus } : o
        )
      );
      addToast('Order Updated', `Order #${orderId} status changed to ${newStatus}`);
      setEditingOrderId(null);
    } catch (err) {
      addToast('Error Updating Order', 'Failed to update order status.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Division Management Section */}
        <div className="mb-8 p-5 bg-slate-950 rounded-3xl border border-amber-500/30">
          <span className="text-[11px] font-extrabold uppercase text-amber-300/80 tracking-wider block mb-3">
            Active Division Management:
          </span>

          <div className="grid grid-cols-2 gap-2 p-2 bg-slate-900/60 rounded-2xl border border-amber-500/20 mb-4">
            <button
              onClick={() => {
                setActiveAdminId('admin1');
                addToast('Switched Division', `Now viewing ${adminProfiles['admin1']?.business_name || 'Division A'} orders`);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${activeAdminId === 'admin1' ? 'bg-amber-500 text-slate-950 shadow font-black' : 'text-amber-200/70 hover:text-white border border-amber-500/20'}`}
            >
              <Shield className="w-4 h-4" /> Division A
            </button>

            <button
              onClick={() => {
                setActiveAdminId('admin2');
                addToast('Switched Division', `Now viewing ${adminProfiles['admin2']?.business_name || 'Division B'} orders`);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${activeAdminId === 'admin2' ? 'bg-amber-500 text-slate-950 shadow font-black' : 'text-amber-200/70 hover:text-white border border-amber-500/20'}`}
            >
              <Shield className="w-4 h-4" /> Division B
            </button>
          </div>

          <div className="text-[11px] text-amber-100 flex items-center gap-2 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
            <span className="truncate font-semibold">Managing: {adminProfiles[activeAdminId]?.business_name || 'Admin'}</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-serif-display">
              Order Tracking & Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              View and update order statuses across all divisions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
              title="Refresh orders"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (confirm('Sign out from admin account?')) {
                  logout();
                  setCurrentPortal('customer');
                }
              }}
              className="px-4 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, customer name, or email..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <RefreshCw className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-3">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No orders found matching your filters</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.order_id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <span className="font-black text-slate-900 dark:text-white font-mono text-lg">
                        #{order.order_id}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{order.created_at}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400">Customer: </span>
                        <span className="font-medium">{order.customer_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Items: </span>
                        <span className="font-medium">{order.items?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Amount: </span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">{formatINR(order.total_amount || 0)}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 ml-2 transition-transform ${expandedOrder === order.order_id ? 'rotate-180' : ''}`} />
                </button>

                {/* Order Details (Expanded) */}
                {expandedOrder === order.order_id && (
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Customer Email</p>
                        <p className="text-sm text-slate-900 dark:text-white font-mono">{order.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Phone</p>
                        <p className="text-sm text-slate-900 dark:text-white font-mono">{order.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Delivery Address</p>
                        <p className="text-sm text-slate-900 dark:text-white">{order.delivery_address}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Payment Mode</p>
                        <p className="text-sm text-slate-900 dark:text-white font-medium">{order.payment_mode}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Order Items</p>
                      <div className="space-y-1 bg-white dark:bg-slate-800 rounded-2xl p-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            <span>{item.product_name} x {item.quantity}</span>
                            <span className="font-mono font-bold">{formatINR(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex justify-between font-bold text-slate-900 dark:text-white">
                          <span>Total</span>
                          <span className="font-mono">{formatINR(order.total_amount || 0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">Update Status</p>
                      {editingOrderId === order.order_id ? (
                        <div className="flex gap-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          >
                            {ORDER_STATUSES.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleStatusUpdate(order.order_id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" /> Save
                          </button>
                          <button
                            onClick={() => setEditingOrderId(null)}
                            className="px-4 py-2 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl text-sm transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingOrderId(order.order_id);
                            setNewStatus(order.status);
                          }}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm shadow-md transition flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" /> Edit Status
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {!loading && filteredOrders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {ORDER_STATUSES.map(status => {
              const count = filteredOrders.filter(o => o.status === status).length;
              return (
                <div key={status} className={`p-4 rounded-2xl border ${STATUS_COLORS[status]}`}>
                  <p className="text-xs font-bold opacity-80 mb-1">{status}</p>
                  <p className="text-2xl font-black">{count}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
