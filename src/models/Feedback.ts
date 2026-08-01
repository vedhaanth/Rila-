import mongoose, { Schema, Document } from 'mongoose';
import { Feedback } from '../types';

export interface FeedbackDocument extends Omit<Feedback, 'feedback_id'>, Document {
  feedback_id: string;
}

const FeedbackSchema: Schema = new Schema(
  {
    feedback_id: { type: String, required: true, unique: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    rating: { type: Number, required: true, default: 5 },
    type: { type: String, enum: ['Review', 'Suggestion', 'Complaint'], default: 'Review' },
    message: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Resolved', 'Published'], default: 'Published' },
    created_at: { type: String, required: true },
    admin_reply: { type: String },
    product_id: { type: String },
    product_name: { type: String },
    title: { type: String },
    verified_purchase: { type: Boolean, default: true },
    helpful_count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<FeedbackDocument>('Feedback', FeedbackSchema);
