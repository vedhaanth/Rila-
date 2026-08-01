import mongoose, { Schema, Document } from 'mongoose';
import { Expense } from '../types';

export interface ExpenseDocument extends Omit<Expense, 'expense_id'>, Document {
  expense_id: string;
}

const ExpenseSchema: Schema = new Schema(
  {
    expense_id: { type: String, required: true, unique: true },
    admin_id: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    receipt_ref: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model<ExpenseDocument>('Expense', ExpenseSchema);
