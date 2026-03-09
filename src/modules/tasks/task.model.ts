import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: { en: string; ar: string };
  description?: string;
  type: 'follow_up' | 'meeting' | 'call' | 'viewing' | 'document_request' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  dueDate: Date;
  completedAt?: Date;
  assignedTo: Types.ObjectId;
  relatedClient?: Types.ObjectId;
  relatedDeal?: Types.ObjectId;
  relatedUnit?: Types.ObjectId;
  reminderDate?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, default: '', trim: true },
    },
    description: { type: String },
    type: {
      type: String,
      enum: ['follow_up', 'meeting', 'call', 'viewing', 'document_request', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'],
      default: 'pending',
    },
    dueDate: { type: Date, required: true },
    completedAt: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    relatedClient: { type: Schema.Types.ObjectId, ref: 'Client' },
    relatedDeal: { type: Schema.Types.ObjectId, ref: 'Deal' },
    relatedUnit: { type: Schema.Types.ObjectId, ref: 'Unit' },
    reminderDate: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ relatedClient: 1 });
taskSchema.index({ relatedDeal: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
