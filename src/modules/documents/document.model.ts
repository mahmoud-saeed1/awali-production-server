import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDocumentMeta extends Document {
  _id: Types.ObjectId;
  name: { en: string; ar: string };
  type: 'contract' | 'deed' | 'id_copy' | 'floor_plan' | 'proposal' | 'invoice' | 'receipt' | 'other';
  url: string;
  key: string;
  mimeType: string;
  size: number;
  relatedClient?: Types.ObjectId;
  relatedDeal?: Types.ObjectId;
  relatedUnit?: Types.ObjectId;
  tags: string[];
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentMetaSchema = new Schema<IDocumentMeta>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, default: '', trim: true },
    },
    type: {
      type: String,
      enum: ['contract', 'deed', 'id_copy', 'floor_plan', 'proposal', 'invoice', 'receipt', 'other'],
      default: 'other',
    },
    url: { type: String, required: true },
    key: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    relatedClient: { type: Schema.Types.ObjectId, ref: 'Client' },
    relatedDeal: { type: Schema.Types.ObjectId, ref: 'Deal' },
    relatedUnit: { type: Schema.Types.ObjectId, ref: 'Unit' },
    tags: [{ type: String }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

documentMetaSchema.index({ relatedClient: 1 });
documentMetaSchema.index({ relatedDeal: 1 });
documentMetaSchema.index({ relatedUnit: 1 });
documentMetaSchema.index({ type: 1 });
documentMetaSchema.index({ createdAt: -1 });

export const DocumentMeta = mongoose.model<IDocumentMeta>('DocumentMeta', documentMetaSchema);
