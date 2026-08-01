import mongoose, { Schema } from 'mongoose';

const AdminSchema = new Schema(
  {
    admin_id: { type: String, required: true, unique: true },
    admin_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    business_name: { type: String, required: true },
    phone: { type: String, required: true },
    gstin: { type: String, default: '' },
    address: { type: String, default: '' },
    logo: { type: String, default: '' },
    categories: [{ type: String }]
  },
  { timestamps: true }
);

const AdminModel = mongoose.model('Admin', AdminSchema);
export default AdminModel;
