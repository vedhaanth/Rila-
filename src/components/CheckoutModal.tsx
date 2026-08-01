import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/currency';
import { api } from '../services/api';
import { Bill } from '../types';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Receipt,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';
import rilaLogo from '../assets/images/rila_logo.jpg';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    currentUser,
    cartTotal,
    addToast,
    triggerRefresh,
    setViewingInvoice,
    adminProfiles
  } = useApp();

  const { setIsLoginModalOpen } = useApp();

  const [shippingAddress, setShippingAddress] = useState(currentUser?.address || '');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash on Delivery'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderResult, setPlacedOrderResult] = useState<{ master_order_id: string; bills: Bill[] } | null>(null);

  if (!isCheckoutOpen) return null;

  const admin1Items = cart.filter((i) => i.product?.admin_owner === 'admin1');
  const admin2Items = cart.filter((i) => i.product?.admin_owner === 'admin2');

  const subtotal = cartTotal;
  const gstTax = subtotal * 0.05;
  const grandTotal = subtotal + gstTax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser) {
      addToast('Please Sign In', 'You must be logged in to place an order.', 'info');
      setIsSubmitting(false);
      setIsCheckoutOpen(false);
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const orderPayload = {
        customer_id: currentUser?.user_id || 'CUST-001',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        items: cart.map((i) => ({
          product_id: i.product.product_id,
          product_name: i.product.product_name,
          price: i.product.price,
          quantity: i.quantity,
          admin_owner: i.product.admin_owner,
          image: i.product.image
        })),
        payment_method: paymentMethod
      };

      const result = await api.createOrder(orderPayload);
      setPlacedOrderResult({ master_order_id: result.master_order_id, bills: result.bills });
      clearCart();
      triggerRefresh();
      addToast('Order Placed Successfully!', `Master Order #${result.master_order_id} created.`);
    } catch (err: any) {
      console.error(err);
      addToast('Order Placement Failed', err.message || 'Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setPlacedOrderResult(null);
  };

  return (
    <div id="checkout-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-amber-200/80 flex flex-col my-8 animate-scale-up" style={{ maxHeight: '90vh' }}>

        {!placedOrderResult ? (
          <div className="flex flex-col min-h-0">
            {/* Sticky Modal Header */}
            <div className="flex-shrink-0 p-6 bg-slate-950 text-amber-50 border-b border-amber-500/30 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={rilaLogo} alt="RILA Logo" className="h-8 w-auto object-contain rounded-lg border border-slate-800 bg-white p-0.5" />
                  <h3 className="font-serif-display font-extrabold text-xl tracking-tight text-white">RILA Checkout</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-amber-300 hover:text-white p-2.5 rounded-xl hover:bg-slate-800 transition flex-shrink-0"
                  title="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-xs text-amber-200/80 font-medium mt-1">
                Dual division order routing with automated GST tax invoicing
              </p>
            </div>

            <form onSubmit={handlePlaceOrder} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Multi Admin Split Info Box */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-slate-900 space-y-1 shadow-sm">
                <span className="font-extrabold text-amber-800 block">🏬 Dual Fulfillment Routing:</span>
                {admin1Items.length > 0 && (
                  <p className="font-medium">• {admin1Items.length} item(s) routed to <b>{adminProfiles.admin1?.business_name || 'Admin 1'}</b></p>
                )}
                {admin2Items.length > 0 && (
                  <p className="font-medium">• {admin2Items.length} item(s) routed to <b>{adminProfiles.admin2?.business_name || 'Admin 2'}</b></p>
                )}
                <p className="text-[11px] text-slate-600 italic pt-1">
                  Both partners will generate separate GST tax invoices automatically upon order dispatch.
                </p>
              </div>

              {/* Shipping & Contact Details */}
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800 mb-3">
                  Delivery & Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-amber-300 bg-amber-50/30 text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-amber-300 bg-amber-50/30 text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">Email Address (for Tax Invoice)</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-amber-300 bg-amber-50/30 text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">Delivery Address</label>
                    <textarea
                      required
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-amber-300 bg-amber-50/30 text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800 mb-3">
                  Select Payment Method
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3.5 rounded-2xl border flex items-center gap-2.5 font-extrabold transition ${paymentMethod === 'UPI' ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' : 'border-amber-200 text-slate-800 hover:bg-amber-50/50'}`}
                  >
                    <QrCode className="w-4 h-4 text-amber-600" />
                    Instant UPI / QR Code
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Credit Card')}
                    className={`p-3.5 rounded-2xl border flex items-center gap-2.5 font-extrabold transition ${paymentMethod === 'Credit Card' ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' : 'border-amber-200 text-slate-800 hover:bg-amber-50/50'}`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    Credit / Debit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Net Banking')}
                    className={`p-3.5 rounded-2xl border flex items-center gap-2.5 font-extrabold transition ${paymentMethod === 'Net Banking' ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' : 'border-amber-200 text-slate-800 hover:bg-amber-50/50'}`}
                  >
                    <Building2 className="w-4 h-4 text-amber-600" />
                    Net Banking
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Debit Card')}
                    className={`p-3.5 rounded-2xl border flex items-center gap-2.5 font-extrabold transition ${paymentMethod === 'Debit Card' ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' : 'border-amber-200 text-slate-800 hover:bg-amber-50/50'}`}
                  >
                    <Lock className="w-4 h-4 text-amber-600" />
                    Razorpay Gateway
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-3.5 rounded-2xl border flex items-center gap-2.5 font-extrabold transition ${paymentMethod === 'Cash on Delivery' ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' : 'border-amber-200 text-slate-800 hover:bg-amber-50/50'}`}
                  >
                    <Receipt className="w-4 h-4 text-amber-600" />
                    Cash on Delivery
                  </button>
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="mt-3 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs flex items-center gap-4">
                    <div className="w-16 h-16 bg-white p-1.5 border border-amber-200 rounded-xl shadow flex items-center justify-center shrink-0">
                      <QrCode className="w-12 h-12 text-slate-900" />
                    </div>
                    <div className="flex-1">
                      <label className="block font-bold text-slate-800 mb-1">Enter Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-slate-900 font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 bg-slate-950 text-amber-50 rounded-2xl space-y-2 text-xs font-medium border border-amber-500/30">
                <div className="flex justify-between text-amber-200/80">
                  <span>Cart Items Subtotal:</span>
                  <span className="font-mono font-bold">{formatINR(subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between text-amber-200/80">
                  <span>Estimated GST Tax (5% CGST+SGST):</span>
                  <span className="font-mono font-bold">+{formatINR(gstTax ?? 0)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white border-t border-amber-500/30 pt-2.5">
                  <span>Total Payable:</span>
                  <span className="font-mono text-amber-400 font-black">{formatINR(grandTotal ?? 0)}</span>
                </div>
              </div>

              {/* Submit + Cancel */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-shrink-0 px-5 py-4 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-2xl transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:bg-slate-300 text-slate-950 text-xs font-black rounded-2xl shadow-xl transition flex items-center justify-center gap-2 border border-yellow-300"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-950" />
                      Pay {formatINR(grandTotal ?? 0)} & Place Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Order Confirmation View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner border border-amber-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-serif-display text-3xl font-extrabold text-slate-900">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Master Order ID: <span className="font-mono font-bold text-slate-900">#{placedOrderResult.master_order_id}</span>
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto font-medium">
              Your organic items have been routed to partner business fulfillment hubs. Confirmation emails and GST tax invoices have been sent to <b>{customerEmail}</b>.
            </p>

            {/* Generated Invoices */}
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-left space-y-2.5 text-xs">
              <span className="font-extrabold text-amber-900 block mb-1">Generated GST Tax Invoices:</span>
              {placedOrderResult.bills.map((bill) => (
                <div key={bill.bill_id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200">
                  <div>
                    <span className="font-extrabold font-mono text-slate-900 text-xs">{bill.invoice_number}</span>
                    <span className="text-slate-600 block text-[11px] font-medium">
                      Seller: {adminProfiles[bill.admin_id]?.business_name} | {formatINR(bill?.grand_total ?? 0)}
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingInvoice(bill)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-black text-[11px] flex items-center gap-1 shadow-sm border border-yellow-300"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-950" /> View Invoice
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-slate-950 text-amber-300 text-xs font-extrabold rounded-2xl shadow transition"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
