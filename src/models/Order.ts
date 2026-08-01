import mongoose, { Schema, Document } from 'mongoose';
import { Order } from '../types';

export interface OrderDocument extends Omit<Order, 'order_id'>, Document {
  order_id: string;
}

const OrderItemSchema = new Schema(
  {
    product_id: { type: String, required: true },
    product_name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    admin_owner: { type: String, required: true },
    image: { type: String, default: '' }
  },
  { _id: false }
);

const TimelineSchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: String, required: true },
    note: { type: String, required: true }
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema(
  {
    order_id: { type: String, required: true, unique: true },
    master_order_id: { type: String, required: true },
    customer_id: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_phone: { type: String, required: true },
    shipping_address: { type: String, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    gst_amount: { type: Number, required: true },
    discount_amount: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    admin_id: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    payment_method: { type: String, required: true },
    payment_status: { type: String, required: true, enum: ['Paid', 'Pending'], default: 'Paid' },
    created_at: { type: String, required: true },
    tracking_number: { type: String, default: '' },
    timeline: [TimelineSchema]
  },
  { timestamps: true }
);

export default mongoose.model<OrderDocument>('Order', OrderSchema);
