import React from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/currency';
import { ShoppingBag, X, Trash2, ArrowRight, ShieldCheck, Tag, Plus, Minus } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateCartQuantity, cartTotal, setIsCheckoutOpen, adminProfiles } = useApp();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const admin1Items = cart.filter((i) => i.product?.admin_owner === 'admin1');
  const admin2Items = cart.filter((i) => i.product?.admin_owner === 'admin2');

  const renderCartGroup = (items: typeof cart, adminKey: 'admin1' | 'admin2') => (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 px-1">
        <Tag className="w-3 h-3 text-amber-500" />
        <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
          {adminProfiles[adminKey]?.business_name || (adminKey === 'admin1' ? 'Admin 1' : 'Admin 2')}
        </span>
      </div>
      {items.map((item) => (
        <div
          key={item.product?.product_id}
          className="flex gap-3 p-3 bg-slate-900/60 rounded-2xl border border-white/5"
        >
          <img
            src={item.product?.image}
            alt={item.product?.product_name}
            className="w-16 h-16 rounded-xl object-contain bg-stone-800 p-1 border border-white/10 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-amber-50 truncate leading-snug">{item.product?.product_name}</h4>
            <p className="text-[11px] text-amber-300 font-mono font-bold mt-0.5">{formatINR(item.product?.price ?? 0)} each</p>

            <div className="flex items-center justify-between mt-2.5">
              {/* Quantity controls */}
              <div className="flex items-center bg-stone-800 rounded-xl overflow-hidden border border-white/10">
                <button
                  onClick={() => updateCartQuantity(item.product?.product_id, -1)}
                  className="w-8 h-8 flex items-center justify-center text-amber-200 hover:bg-amber-500 hover:text-slate-950 transition"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-3 text-white font-mono font-bold text-xs">{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.product?.product_id, 1)}
                  className="w-8 h-8 flex items-center justify-center text-amber-200 hover:bg-amber-500 hover:text-slate-950 transition"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Item subtotal */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 font-mono">
                  {formatINR((item.product?.price ?? 0) * item.quantity)}
                </span>
                <button
                  onClick={() => removeFromCart(item.product?.product_id)}
                  className="w-7 h-7 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={() => setIsCartOpen(false)} />

      <div className="w-full max-w-md bg-slate-950 text-amber-50 h-full shadow-2xl flex flex-col border-l border-amber-500/20 animate-slide-left">

        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow">
              <ShoppingBag className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-white text-base leading-none">Your Bag</h3>
              <p className="text-[10px] text-amber-400/80 font-medium mt-0.5">RILA Basket & Order Route</p>
            </div>
            {cart.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-xs font-black">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
            title="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fulfillment notice */}
        {cart.length > 0 && (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/15 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-[11px] text-amber-200/80 font-medium">
              Dual-division store — items routed to respective sellers automatically.
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-16">
              <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-stone-600" />
              </div>
              <div>
                <p className="font-serif-display font-bold text-amber-100 text-base">Your Bag is Empty</p>
                <p className="text-xs text-stone-500 mt-1">Browse our organic catalog and add delicious items!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {admin1Items.length > 0 && renderCartGroup(admin1Items, 'admin1')}
              {admin2Items.length > 0 && renderCartGroup(admin2Items, 'admin2')}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10 bg-slate-900/60 space-y-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-amber-100">{formatINR(cartTotal ?? 0)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Estimated GST (5%)</span>
                <span className="font-mono font-semibold text-amber-100">+{formatINR((cartTotal ?? 0) * 0.05)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white border-t border-white/10 pt-2.5">
                <span>Grand Total</span>
                <span className="font-mono text-amber-400 text-base">{formatINR((cartTotal ?? 0) * 1.05)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-sm shadow-lg transition flex items-center justify-center gap-2 border border-yellow-300/50"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
