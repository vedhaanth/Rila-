import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/currency';
import { api } from '../services/api';
import { Order, OrderStatus, Product } from '../types';
import {
  PackageCheck,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  FileText,
  Building2,
  ExternalLink,
  Heart,
  ShoppingBag,
  Trash2,
  Plus,
  Star,
  MapPin,
  Sparkles,
  Check
} from 'lucide-react';

const STEPPER_STAGES: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Pending', label: 'Order Received', desc: 'Received at Halwai' },
  { status: 'Confirmed', label: 'Confirmed', desc: 'Ingredients Verified' },
  { status: 'Packed', label: 'Freshly Packed', desc: 'Sealed for Freshness' },
  { status: 'Shipped', label: 'Dispatched', desc: 'Out with Delivery Partner' },
  { status: 'Delivered', label: 'Delivered', desc: 'Handed to Customer' },
];

const getStatusIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'Pending': return 0;
    case 'Confirmed': return 1;
    case 'Packed': return 2;
    case 'Shipped': return 3;
    case 'Delivered': return 4;
    case 'Cancelled': return -1;
    default: return 0;
  }
};

export const OrdersPage: React.FC = () => {
  const { currentUser, setViewingInvoice, refreshDataFlag, wishlist, toggleWishlist, addToCart, setSelectedProductForView, adminProfiles } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    // Prefer logged-in user email, fallback to persisted localStorage user email
    let emailToUse: string | null = null;
    if (currentUser?.email) {
      emailToUse = currentUser.email;
    } else {
      try {
        const saved = localStorage.getItem('rila_current_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) emailToUse = parsed.email;
        }
      } catch (e) {
        // ignore parse errors
      }
      // Also support debug query param ?customer_email=... in the URL
      try {
        const params = new URLSearchParams(window.location.search);
        const qEmail = params.get('customer_email');
        if (qEmail) emailToUse = qEmail;
      } catch (e) {
        // ignore
      }
    }

    if (emailToUse) {
      const list = await api.getOrders({ customer_email: emailToUse });
      setOrders(list);
    }
    const allProducts = await api.getProducts();
    setProducts(allProducts);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentUser, refreshDataFlag]);

  const savedProducts = products.filter((p) => wishlist.includes(p.product_id));

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 border border-amber-300"><Clock className="w-3.5 h-3.5" /> Order Pending</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Confirmed</span>;
      case 'Packed':
        return <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5" /> Packed at Hub</span>;
      case 'Shipped':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Out for Shipping</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight font-serif-display">
            My Account & Activity
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            View order tracking history, download tax invoices, and manage saved wishlist items.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-700 border border-stone-200 shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'orders' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'hover:text-stone-900'
              }`}
          >
            <PackageCheck className="w-3.5 h-3.5 text-teal-700" /> My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'wishlist' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'hover:text-stone-900'
              }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" /> Saved Wishlist ({wishlist.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-xs">Loading account data...</div>
      ) : activeTab === 'orders' ? (
        /* Orders View */
        orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <PackageCheck className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <h3 className="font-bold text-stone-800 text-base">No Orders Placed Yet</h3>
            <p className="text-xs text-stone-500 mt-1">When you place orders, they will appear here with live tracking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const adminInfo = adminProfiles[order.admin_id];

              return (
                <div
                  key={order.order_id}
                  className="bg-white rounded-xl border border-stone-200/80 shadow-2xs overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-3.5 bg-[#FAF7F2] border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-stone-500 block text-[10px]">Order ID:</span>
                      <span className="font-bold font-mono text-xs text-stone-900">#{order.order_id}</span>
                    </div>

                    <div>
                      <span className="text-stone-500 block text-[10px]">Seller:</span>
                      <span className="font-semibold text-teal-800">
                        {adminInfo?.business_name || order.admin_id}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-500 block text-[10px]">Date:</span>
                      <span className="font-medium text-stone-700">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-500 block text-[10px]">Status:</span>
                      {getStatusBadge(order.status)}
                    </div>

                    <div>
                      <button
                        onClick={() => setViewingInvoice(order)}
                        className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium text-xs shadow-2xs transition flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" /> Invoice
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4 divide-y divide-stone-100">
                    {(order.items || []).map((it) => (
                      <div key={it.product_id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={it.image}
                            alt={it.product_name}
                            className="w-10 h-10 rounded-lg object-contain bg-[#FAF7F2] p-1 border border-stone-200"
                          />
                          <div>
                            <h4 className="font-bold text-stone-900">{it.product_name}</h4>
                            <span className="text-stone-500 font-mono text-[11px]">{formatINR(it.price ?? 0)} x {it.quantity ?? 1}</span>
                          </div>
                        </div>

                        <div className="text-right font-mono font-bold text-stone-900">
                          {formatINR((it.price ?? 0) * (it.quantity ?? 1))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Visual Order Status Stepper */}
                  <div className="p-4 bg-[#FAF8F5] border-t border-stone-200/80">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-stone-900">
                        <Truck className="w-4 h-4 text-amber-700" />
                        <span>Live Delivery Tracker</span>
                        {order.status === 'Shipped' && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                            Out for 15-Min Express Delivery
                          </span>
                        )}
                      </div>
                      {order.tracking_number && (
                        <span className="font-mono text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                          Tracking ID: <span className="font-bold text-stone-900">{order.tracking_number}</span>
                        </span>
                      )}
                    </div>

                    {order.status === 'Cancelled' ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>This order was cancelled. If you were charged, your refund will be processed automatically within 24 hours.</span>
                      </div>
                    ) : (
                      <div className="py-2">
                        {/* Stepper Progress Bar & Circles */}
                        <div className="relative flex items-center justify-between max-w-2xl mx-auto px-2">
                          {/* Background Track Line */}
                          <div className="absolute top-4 left-6 right-6 h-1 bg-stone-200 -z-0 rounded-full" />

                          {/* Active Progress Fill Line */}
                          <div
                            className="absolute top-4 left-6 h-1 bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500 -z-0 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, (getStatusIndex(order.status) / (STEPPER_STAGES.length - 1)) * 100))}%`,
                              maxWidth: 'calc(100% - 3rem)',
                            }}
                          />

                          {STEPPER_STAGES.map((stage, idx) => {
                            const currentIndex = getStatusIndex(order.status);
                            const isCompleted = idx < currentIndex;
                            const isCurrent = idx === currentIndex;

                            return (
                              <div key={stage.status} className="flex flex-col items-center relative z-10 text-center">
                                {/* Step Circle */}
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-2xs ${isCompleted
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                    : isCurrent
                                      ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                                      : 'bg-stone-100 text-stone-400 border border-stone-300'
                                    }`}
                                >
                                  {isCompleted ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : isCurrent ? (
                                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                                  ) : (
                                    <span>{idx + 1}</span>
                                  )}
                                </div>

                                {/* Step Label & Desc */}
                                <span className={`mt-2 text-[11px] font-bold ${isCompleted ? 'text-emerald-900' : isCurrent ? 'text-amber-900 font-extrabold' : 'text-stone-400'
                                  }`}>
                                  {stage.label}
                                </span>
                                <span className="text-[9px] text-stone-400 hidden sm:block max-w-[80px] leading-tight mt-0.5">
                                  {stage.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Timeline Log Records */}
                    <div className="mt-4 pt-3 border-t border-stone-200/60 flex flex-wrap gap-2 text-stone-600">
                      <span className="font-semibold text-stone-700 uppercase text-[10px] tracking-wider block w-full">
                        Status Log History
                      </span>
                      {order.timeline.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-stone-800">{item.status}:</span>
                          <span className="text-stone-500">{item.note || item.timestamp}</span>
                          <span className="text-stone-400 text-[10px]">({item.timestamp})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Wishlist View */
        savedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <Heart className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <h3 className="font-bold text-stone-800 text-base">Your Wishlist is Empty</h3>
            <p className="text-xs text-stone-500 mt-1">Explore our products and tap the heart icon to save items for later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {savedProducts.map((p) => (
              <div
                key={p.product_id}
                className="bg-white rounded-xl border border-stone-200 p-3 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => setSelectedProductForView(p)}
                    className="cursor-pointer bg-[#FAF7F2] rounded-lg p-2 mb-2 flex items-center justify-center h-36 relative"
                  >
                    <img src={p.image} alt={p.product_name} className="max-h-28 w-auto object-contain" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p.product_id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider block">
                    {p.category}
                  </span>
                  <h3
                    onClick={() => setSelectedProductForView(p)}
                    className="cursor-pointer font-bold text-xs text-stone-900 line-clamp-1 hover:text-teal-700 mt-0.5"
                  >
                    {p.product_name}
                  </h3>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 mb-2">{p.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2 pt-1 border-t border-stone-100">
                    <span className="text-sm font-bold text-stone-900 font-mono">{formatINR(p.price ?? 0)}</span>
                    <div className="flex items-center gap-1 text-[10px] text-stone-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-stone-800">{p.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => addToCart(p, 1)}
                      disabled={p.stock === 0}
                      className="py-1.5 bg-teal-700 hover:bg-teal-800 disabled:bg-stone-200 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add To Bag
                    </button>
                    <button
                      onClick={() => toggleWishlist(p.product_id)}
                      className="py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs rounded-lg transition border border-stone-200 flex items-center justify-center gap-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

