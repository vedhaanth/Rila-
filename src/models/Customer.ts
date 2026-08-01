import mongoose, { Schema } from 'mongoose';

const CustomerSchema = new Schema(
  {
    user_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    saved_addresses: [{ type: String }],
    role: { type: String, default: 'customer' }
  },
  { timestamps: true }
);

const CustomerModel = mongoose.model('Customer', CustomerSchema);
export default CustomerModel;
