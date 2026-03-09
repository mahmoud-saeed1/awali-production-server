import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFeature extends Document {
  _id: Types.ObjectId;
  nameEn: string;
  nameAr: string;
  category: 'amenity' | 'characteristic' | 'facility' | 'service';
  valueType: 'boolean' | 'string' | 'number';
  icon?: string;
  isActive: boolean;
  order: number;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const featureSchema = new Schema<IFeature>(
  {
    nameEn: { type: String, required: true, unique: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['amenity', 'characteristic', 'facility', 'service'],
      required: true,
    },
    valueType: {
      type: String,
      enum: ['boolean', 'string', 'number'],
      default: 'boolean',
    },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
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

featureSchema.index({ category: 1 });
featureSchema.index({ isActive: 1 });
featureSchema.index({ order: 1 });

export const Feature = mongoose.model<IFeature>('Feature', featureSchema);
