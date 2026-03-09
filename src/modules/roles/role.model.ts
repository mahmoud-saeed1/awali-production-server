import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRole extends Document {
  _id: Types.ObjectId;
  nameEn: string;
  nameAr: string;
  description?: { en: string; ar: string };
  permissions: Record<string, Record<string, boolean>>;
  isSystem: boolean;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    nameEn: { type: String, required: true, unique: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
    description: {
      en: { type: String, default: '' },
      ar: { type: String, default: '' },
    },
    permissions: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
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

roleSchema.index({ nameEn: 1 }, { unique: true });
roleSchema.index({ isActive: 1 });
roleSchema.index({ isSystem: 1 });

export const Role = mongoose.model<IRole>('Role', roleSchema);
