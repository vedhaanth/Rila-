import mongoose, { Schema, Document } from 'mongoose';
import { EmailLog } from '../types';

export interface EmailLogDocument extends Omit<EmailLog, 'log_id'>, Document {
  log_id: string;
}

const EmailLogSchema: Schema = new Schema(
  {
    log_id: { type: String, required: true, unique: true },
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, required: true },
    sent_at: { type: String, required: true },
    status: { type: String, enum: ['Sent', 'Failed'], default: 'Sent' }
  },
  { timestamps: true }
);

export default mongoose.model<EmailLogDocument>('EmailLog', EmailLogSchema);
