import mongoose, { Schema, Document } from 'mongoose';
import { Supplier } from '../types';

export interface SupplierDocument extends Omit<Supplier, 'supplier_id'>, Document {
  supplier_id: string;
}

const SupplierSchema: Schema = new Schema(
  {
    supplier_id: { type: String, required: true, unique: true },
    admin_id: { type: String, required: true },
    supplier_name: { type: String, required: true },
    contact_person: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    categories_supplied: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<SupplierDocument>('Supplier', SupplierSchema);
