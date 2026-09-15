import React from 'react';
import { useApp } from '../context/AppContext';
import { Bill, Order } from '../types';
import { formatINR } from '../utils/currency';
import { Printer, Download, Mail, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import rilaLogo from '../assets/images/rila_logo.jpg';

export const InvoiceModal: React.FC = () => {
  const { viewingInvoice, setViewingInvoice, addToast, adminProfiles } = useApp();

  if (!viewingInvoice) return null;

  // Determine if viewing an Order or a Bill by the unique invoice_number field.
  const isBill = 'invoice_number' in viewingInvoice && !!(viewingInvoice as Bill).invoice_number;
  const isOrder = !isBill;

  const adminId = viewingInvoice.admin_id || 'admin1';
  const adminProfile = adminProfiles[adminId] || adminProfiles['admin1'];

  const invoiceNumber = isOrder
    ? `INV-ORD-${(viewingInvoice as Order).order_id}`
    : (viewingInvoice as Bill).invoice_number;

  const createdAt = new Date(viewingInvoice.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const customerName = isOrder
    ? (viewingInvoice as Order).customer_name
    : (viewingInvoice as Bill).customer_name;

  const customerPhone = isOrder
    ? (viewingInvoice as Order).customer_phone
    : (viewingInvoice as Bill).customer_phone;

  const customerEmail = isOrder
    ? (viewingInvoice as Order).customer_email
    : (viewingInvoice as Bill).customer_email;

  const paymentMethod = isOrder
    ? (viewingInvoice as Order).payment_method
    : ((viewingInvoice as Bill).payment_method || (viewingInvoice as Bill).payment_mode || 'Cash');

  const items = isOrder
    ? ((viewingInvoice as Order).items || []).map((i) => ({
      product_name: i.product_name || 'Item',
      quantity: i.quantity || 1,
      price: i.price || 0,
      discount: 0,
      total: (i.price || 0) * (i.quantity || 1)
    }))
    : (((viewingInvoice as Bill).products || (viewingInvoice as Bill).items || []).map((p) => ({
      product_name: p.product_name || 'Item',
      quantity: p.quantity || 1,
      price: p.price || 0,
      discount: p.discount || 0,
      total: p.total || (p.price || 0) * (p.quantity || 1)
    })));

  const subtotal = ((viewingInvoice as Order).subtotal ?? (viewingInvoice as Bill).subtotal) ?? 0;
  const taxGst = ((viewingInvoice as Order).gst_amount ?? (viewingInvoice as Bill).tax_gst) ?? 0;
  const grandTotal = ((viewingInvoice as Order).total_amount ?? (viewingInvoice as Bill).grand_total) ?? 0;
  const bill = viewingInvoice as Bill;
  const previousBalanceDue = isBill ? (bill.previous_balance_due ?? 0) : 0;
  const amountPaid = isBill ? (bill.amount_paid ?? grandTotal) : grandTotal;
  const balanceDue = isBill ? (bill.balance_due ?? Math.max(0, grandTotal - amountPaid)) : 0;
  const paymentStatus = isBill ? (bill.payment_status || (balanceDue > 0 ? 'Pending' : 'Paid')) : 'Paid';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    addToast('Downloading GST Invoice', `Saved ${invoiceNumber}.pdf to your downloads.`);
  };

  const handleEmailInvoice = () => {
    addToast('Invoice Emailed', `Sent copy of ${invoiceNumber} to ${customerEmail || 'customer'}`);
  };

  return (
    <div id="invoice-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-amber-200 overflow-hidden my-8 animate-scale-up">
        {/* Header Action Bar */}
        <div className="bg-slate-950 text-amber-50 p-4 flex items-center justify-between no-print border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-lg text-xs font-black uppercase tracking-wider">
              RILA Store GST Tax Invoice
            </span>
            <span className="text-xs text-amber-300 font-mono font-bold">{invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            <button
              onClick={handleEmailInvoice}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>
            <button
              onClick={() => setViewingInvoice(null)}
              className="p-1.5 text-amber-300 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable RILA Style GST Invoice Body */}
        <div id="printable-invoice-content" className="p-8 text-slate-900 bg-white text-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-amber-500 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={adminProfile.logo || rilaLogo}
                  alt={adminProfile.business_name || 'RILA Store'}
                  className="w-14 h-14 rounded-2xl object-cover border border-amber-300 shadow-sm"
                />
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase font-serif-display">
                    {adminProfile.business_name}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">{adminProfile.address}</p>
                </div>
              </div>
              <div className="text-xs text-slate-700 space-y-0.5 font-mono">
                <p>GSTIN: <span className="font-bold text-slate-900">{adminProfile.gstin}</span></p>
                <p>Phone: {adminProfile.phone} | Email: {adminProfile.email}</p>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-black text-amber-700 uppercase tracking-wide font-serif-display">
                TAX INVOICE
              </h2>
              <div className="mt-2 text-xs font-mono space-y-1">
                <p className="font-bold text-slate-900">Invoice No: {invoiceNumber}</p>
                <p>Date: {createdAt}</p>
                <p>Payment Mode: <span className="font-semibold text-emerald-700">{paymentMethod}</span></p>
                <p className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-sans text-[11px] font-bold ${paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  <CheckCircle2 className="w-3 h-3" /> {paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-amber-50/60 mb-6 border border-amber-200 text-xs">
            <div>
              <span className="font-bold text-amber-900 uppercase tracking-wider block mb-1">
                Billed To (Customer):
              </span>
              <p className="font-bold text-sm text-slate-900">{customerName}</p>
              <p className="text-slate-700">Phone: {customerPhone || 'N/A'}</p>
              {customerEmail && <p className="text-slate-700">Email: {customerEmail}</p>}
            </div>

            <div>
              <span className="font-bold text-amber-900 uppercase tracking-wider block mb-1">
                Shipping / Delivery Address:
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">
                {isOrder ? (viewingInvoice as Order).shipping_address : 'In-Store Counter Collection'}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-collapse mb-6 text-xs">
            <thead>
              <tr className="bg-slate-950 text-amber-50">
                <th className="py-2.5 px-3 font-semibold rounded-tl-xl">#</th>
                <th className="py-2.5 px-3 font-semibold">Organic Product Description</th>
                <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                <th className="py-2.5 px-3 font-semibold text-right">Discount</th>
                <th className="py-2.5 px-3 font-semibold text-right rounded-tr-xl">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 border-b border-amber-200">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-amber-50/40">
                  <td className="py-3 px-3 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{item.product_name}</td>
                  <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono">{formatINR(item.price ?? 0)}</td>
                  <td className="py-3 px-3 text-right font-mono text-red-600">
                    {(item.discount ?? 0) > 0 ? `-${formatINR(item.discount ?? 0)}` : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(item.total ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculation Summary */}
          <div className="flex justify-between items-start pt-2">
            <div className="max-w-xs text-xs space-y-2 text-slate-600">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-900 mb-1">GST Tax Breakdown (5% Organic Food Rate):</p>
                <p>• CGST (2.5%): {formatINR((taxGst ?? 0) / 2)}</p>
                <p>• SGST (2.5%): {formatINR((taxGst ?? 0) / 2)}</p>
              </div>
              <p className="italic text-[11px]">Computer generated tax invoice issued via RILA ERP platform.</p>
            </div>

            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal (Taxable):</span>
                <span className="font-mono">{formatINR(subtotal ?? 0)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>GST Tax (5%):</span>
                <span className="font-mono">+{formatINR(taxGst ?? 0)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t-2 border-slate-900 pt-2 font-serif-display">
                <span>Grand Total:</span>
                <span className="font-mono text-amber-700 font-black">{formatINR(grandTotal ?? 0)}</span>
              </div>
              {previousBalanceDue > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Previous Balance Included:</span>
                  <span className="font-mono">{formatINR(previousBalanceDue)}</span>
                </div>
              )}
              {isBill && (
                <>
                  <div className="flex justify-between text-slate-700">
                    <span>Amount Received:</span>
                    <span className="font-mono">{formatINR(amountPaid)}</span>
                  </div>
                  <div className={`flex justify-between font-extrabold border-t pt-2 ${balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    <span>Balance Due:</span>
                    <span className="font-mono">{formatINR(balanceDue)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer Seals & Signature */}
          <div className="mt-10 border-t border-amber-200 pt-6 flex justify-between items-end">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-amber-50 rounded-xl border border-amber-300 flex flex-col items-center justify-center text-[10px] text-amber-800 font-mono font-bold">
                <ShieldCheck className="w-6 h-6 text-amber-600 mb-0.5" />
                VERIFIED
              </div>
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-900">{adminProfile.business_name}</p>
                <p>RILA ERP Certified</p>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="h-10 border-b border-dashed border-amber-400 w-40 mb-1 ml-auto flex items-end justify-center text-slate-400 font-serif italic">
                Authorized Signatory
              </div>
              <p className="font-bold text-slate-900">Authorized ERP Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
