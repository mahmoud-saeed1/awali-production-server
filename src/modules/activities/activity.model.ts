import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  _id: Types.ObjectId;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'deal_update' | 'document_upload' | 'viewing' | 'system';
  description: string;
  metadata?: Record<string, unknown>;
  client?: Types.ObjectId;
  deal?: Types.ObjectId;
  unit?: Types.ObjectId;
  performedBy: Types.ObjectId;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'note', 'status_change', 'deal_update', 'document_upload', 'viewing', 'system'],
      required: true,
    },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    deal: { type: Schema.Types.ObjectId, ref: 'Deal' },
    unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

activitySchema.index({ client: 1, createdAt: -1 });
activitySchema.index({ deal: 1, createdAt: -1 });
activitySchema.index({ unit: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ performedBy: 1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
