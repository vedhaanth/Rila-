import mongoose, { Schema, Document } from 'mongoose';
import { Bill } from '../types';

export interface BillDocument extends Omit<Bill, 'bill_id'>, Document {
  bill_id: string;
}

const BillProductItemSchema = new Schema(
  {
    product_id: { type: String, required: true },
    product_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst_rate: { type: Number },
    total: { type: Number, required: true }
  },
  { _id: false }
);

const BillSchema: Schema = new Schema(
  {
    bill_id: { type: String, required: true, unique: true },
    invoice_number: { type: String, required: true },
    bill_type: { type: String, enum: ['Online', 'Manual'], default: 'Manual' },
    master_order_id: { type: String },
    order_id: { type: String },
    customer_id: { type: String },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    customer_email: { type: String, default: '' },
    customer_gstin: { type: String },
    shipping_address: { type: String },
    products: [BillProductItemSchema],
    items: [BillProductItemSchema],
    subtotal: { type: Number, required: true },
    tax_gst: { type: Number, default: 0 },
    cgst: { type: Number },
    sgst: { type: Number },
    discount: { type: Number, default: 0 },
    discount_total: { type: Number, default: 0 },
    grand_total: { type: Number, required: true },
    current_total: { type: Number },
    payment_method: { type: String, default: 'Cash' },
    payment_mode: { type: String },
    payment_status: { type: String, enum: ['Paid', 'Partially Paid', 'Pending'], default: 'Paid' },
    amount_paid: { type: Number, default: 0 },
    cash_amount_paid: { type: Number, default: 0 },
    upi_amount_paid: { type: Number, default: 0 },
    previous_balance_due: { type: Number, default: 0 },
    balance_due: { type: Number, default: 0 },
    sale_type: { type: String, enum: ['Retail', 'Wholesale'], default: 'Retail' },
    status: { type: String },
    admin_id: { type: String, required: true },
    created_at: { type: String, required: true },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model<BillDocument>('Bill', BillSchema);
