import mongoose, { Schema, Document } from 'mongoose';

export interface PasswordResetTokenDocument extends Document {
  email: string;
  user_type: 'customer' | 'admin' | 'employee';
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used: boolean;
}

const PasswordResetTokenSchema = new Schema<PasswordResetTokenDocument>(
  {
    email: { type: String, required: true, index: true },
    user_type: { type: String, enum: ['customer', 'admin', 'employee'], required: true },
    user_id: { type: String, required: true },
    token_hash: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

PasswordResetTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<PasswordResetTokenDocument>('PasswordResetToken', PasswordResetTokenSchema);
