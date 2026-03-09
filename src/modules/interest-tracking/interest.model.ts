import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInterestLog extends Document {
  _id: Types.ObjectId;
  type: 'view' | 'search' | 'inquiry' | 'share' | 'favorite';
  unit?: Types.ObjectId;
  searchQuery?: string;
  searchFilters?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  userId?: Types.ObjectId;
  sessionId?: string;
  referrer?: string;
  duration?: number;
  createdAt: Date;
}

const interestLogSchema = new Schema<IInterestLog>(
  {
    type: { type: String, enum: ['view', 'search', 'inquiry', 'share', 'favorite'], required: true },
    unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
    searchQuery: { type: String },
    searchFilters: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String },
    referrer: { type: String },
    duration: { type: Number },
  },
  { timestamps: true }
);

interestLogSchema.index({ type: 1, createdAt: -1 });
interestLogSchema.index({ unit: 1, createdAt: -1 });
interestLogSchema.index({ userId: 1, createdAt: -1 });
interestLogSchema.index({ sessionId: 1 });
interestLogSchema.index({ searchQuery: 'text' });

export const InterestLog = mongoose.model<IInterestLog>('InterestLog', interestLogSchema);
