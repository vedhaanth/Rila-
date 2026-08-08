import mongoose, { Schema } from 'mongoose';

const EmployeeSchema = new Schema(
  {
    employee_id: { type: String, required: true, unique: true },
    admin_id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'order_manager' },
    phone: { type: String, default: '' }
  },
  { timestamps: true }
);

const EmployeeModel = mongoose.model('Employee', EmployeeSchema);
export default EmployeeModel;
