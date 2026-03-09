import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  action: 'create' | 'update' | 'delete';
  resourceType: string;
  resourceId: string;
  userId: Types.ObjectId;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  changes: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, enum: ['create', 'update', 'delete'], required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    changes: { type: Schema.Types.Mixed, default: null },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
    strict: true,
  }
);

auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
