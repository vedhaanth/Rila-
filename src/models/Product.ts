import mongoose, { Schema, Document } from 'mongoose';
import { Product } from '../types';

export interface ProductDocument extends Omit<Product, 'product_id'>, Document {
  product_id: string;
}

const ProductSchema: Schema = new Schema(
  {
    product_id: { type: String, required: true, unique: true },
    barcode: { type: String, default: '' },
    product_name: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    original_price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    min_stock_alert: { type: Number },
    admin_owner: { type: String, required: true },
    description: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    reviews_count: { type: Number, default: 0 },
    specifications: { type: Schema.Types.Mixed, default: {} },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<ProductDocument>('Product', ProductSchema);
