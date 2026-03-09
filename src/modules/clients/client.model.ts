import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClient extends Document {
  _id: Types.ObjectId;
  name: { en: string; ar: string };
  email?: string;
  phone: string;
  secondaryPhone?: string;
  nationalId?: string;
  type: 'individual' | 'company';
  companyName?: string;
  source: 'website' | 'phone' | 'walk_in' | 'referral' | 'social_media' | 'advertising' | 'exhibition' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'negotiation' | 'won' | 'lost' | 'inactive';
  rating: 'hot' | 'warm' | 'cold';
  assignedTo?: Types.ObjectId;
  interestedIn: Types.ObjectId[];
  budget: { min: number; max: number; currency: string };
  preferences: {
    buildingTypes: Types.ObjectId[];
    unitTypes: Types.ObjectId[];
    minBedrooms?: number;
    minArea?: number;
    facades: string[];
    features: Types.ObjectId[];
  };
  notes?: string;
  tags: string[];
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  lostReason?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, default: '', trim: true },
    },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    phone: { type: String, required: true, trim: true },
    secondaryPhone: { type: String, trim: true },
    nationalId: { type: String, trim: true },
    type: { type: String, enum: ['individual', 'company'], default: 'individual' },
    companyName: { type: String, trim: true },
    source: {
      type: String,
      enum: ['website', 'phone', 'walk_in', 'referral', 'social_media', 'advertising', 'exhibition', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'negotiation', 'won', 'lost', 'inactive'],
      default: 'new',
    },
    rating: { type: String, enum: ['hot', 'warm', 'cold'], default: 'warm' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    interestedIn: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'SAR' },
    },
    preferences: {
      buildingTypes: [{ type: Schema.Types.ObjectId, ref: 'BuildingType' }],
      unitTypes: [{ type: Schema.Types.ObjectId, ref: 'UnitType' }],
      minBedrooms: Number,
      minArea: Number,
      facades: [String],
      features: [{ type: Schema.Types.ObjectId, ref: 'Feature' }],
    },
    notes: { type: String },
    tags: [{ type: String }],
    lastContactDate: { type: Date },
    nextFollowUpDate: { type: Date },
    lostReason: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
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

clientSchema.index({ phone: 1 });
clientSchema.index({ email: 1 }, { sparse: true });
clientSchema.index({ status: 1 });
clientSchema.index({ rating: 1 });
clientSchema.index({ source: 1 });
clientSchema.index({ assignedTo: 1 });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ 'name.en': 'text', 'name.ar': 'text', email: 'text', phone: 'text' });

clientSchema.pre(/^find/, function (this: mongoose.Query<unknown, unknown>) {
  if (!(this.getFilter() as Record<string, unknown>).isDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export const Client = mongoose.model<IClient>('Client', clientSchema);
