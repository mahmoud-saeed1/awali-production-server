import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICommunication extends Document {
  _id: Types.ObjectId;
  client: Types.ObjectId;
  type: 'phone_call' | 'email' | 'whatsapp' | 'meeting' | 'sms' | 'other';
  direction: 'inbound' | 'outbound';
  subject: string;
  content: string;
  duration?: number;
  outcome: 'successful' | 'no_answer' | 'voicemail' | 'callback_requested' | 'not_interested' | 'follow_up_needed';
  nextAction?: string;
  nextActionDate?: Date;
  relatedDeal?: Types.ObjectId;
  performedBy: Types.ObjectId;
  createdAt: Date;
}

const communicationSchema = new Schema<ICommunication>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    type: {
      type: String,
      enum: ['phone_call', 'email', 'whatsapp', 'meeting', 'sms', 'other'],
      required: true,
    },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    subject: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    duration: { type: Number },
    outcome: {
      type: String,
      enum: ['successful', 'no_answer', 'voicemail', 'callback_requested', 'not_interested', 'follow_up_needed'],
      default: 'successful',
    },
    nextAction: { type: String },
    nextActionDate: { type: Date },
    relatedDeal: { type: Schema.Types.ObjectId, ref: 'Deal' },
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

communicationSchema.index({ client: 1, createdAt: -1 });
communicationSchema.index({ type: 1 });
communicationSchema.index({ performedBy: 1 });
communicationSchema.index({ createdAt: -1 });

export const Communication = mongoose.model<ICommunication>('Communication', communicationSchema);
