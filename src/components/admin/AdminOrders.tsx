import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { formatINR } from '../../utils/currency';
import {
  ShoppingBag,
  Clock,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Receipt,
  Mail,
  User,
  MapPin,
  ChevronDown
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { activeAdminId, refreshDataFlag, triggerRefresh, addToast, setViewingInvoice } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const list = await api.getOrders({ admin_id: activeAdminId });
    setOrders(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [activeAdminId, refreshDataFlag]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      addToast('Order Status Updated', `Order #${orderId} changed to ${newStatus}. Notification email sent to customer.`);
      triggerRefresh();
    } catch (err: any) {
      addToast('Status Update Failed', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-serif-display">
          Assigned Store Orders & Dispatch
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Order fulfillment queue automatically routed by multi-admin engine ({orders.length} orders total)
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div
            key={o.order_id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/80 dark:border-slate-800 shadow-sm overflow-hidden hover:border-amber-400 transition"
          >
            {/* Header */}
            <div className="p-4 bg-amber-50/50 dark:bg-slate-800/50 border-b border-amber-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-amber-800/70 block font-mono text-[10px]">Sub-Order ID:</span>
                <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">#{o.order_id}</span>
                <span className="text-slate-400 block text-[10px] mt-0.5 font-mono">Master: #{o.master_order_id}</span>
              </div>

              <div>
                <span className="text-amber-800/70 block text-[10px]">Customer Name & Contact:</span>
                <span className="font-bold text-slate-900 dark:text-white block">{o.customer_name}</span>
                <span className="text-slate-500 text-[11px] font-mono">{o.customer_phone} | {o.customer_email}</span>
              </div>

              <div>
                <span className="text-amber-800/70 block text-[10px]">Total Bill Value:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {formatINR(o.total_amount ?? 0)}
                </span>
                <span className="text-[10px] text-emerald-700 font-extrabold block">{o.payment_method}</span>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-amber-800/70 block text-[10px]">Update Order Status:</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateStatus(o.order_id, e.target.value as OrderStatus)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 rounded-xl font-black text-xs text-amber-900 dark:text-amber-300 focus:ring-2 focus:ring-amber-500 shadow-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Packed">Packed at Hub</option>
                    <option value="Shipped">Out for Shipping</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  onClick={() => setViewingInvoice(o)}
                  className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl shadow text-xs font-black flex items-center gap-1 self-end mb-0.5 border border-yellow-300 transition"
                  title="View GST Tax Invoice"
                >
                  <Receipt className="w-4 h-4" /> Invoice
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="p-4 space-y-2 text-xs">
              <span className="font-extrabold text-amber-800/80 uppercase text-[10px] tracking-wider block">
                Purchased Products ({(o.items || []).length} items):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(o.items || []).map((it) => (
                  <div key={it.product_id} className="p-2.5 bg-stone-50/80 dark:bg-slate-800/40 rounded-2xl border border-amber-100 flex items-center gap-3">
                    <img src={it.image} alt={it.product_name} className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-amber-200" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white font-serif-display">{it.product_name}</h4>
                      <span className="text-slate-600 font-mono text-[11px] font-bold">
                        {formatINR(it.price ?? 0)} x {it.quantity ?? 1} = {formatINR((it.price ?? 0) * (it.quantity ?? 1))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="px-4 py-2.5 bg-amber-50/30 dark:bg-slate-800/20 border-t border-amber-100 dark:border-slate-800 text-[11px] text-slate-600 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span><b>Shipping Address:</b> {o.shipping_address}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
