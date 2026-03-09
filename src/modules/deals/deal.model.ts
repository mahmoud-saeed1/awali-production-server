import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDeal extends Document {
  _id: Types.ObjectId;
  title: string;
  client: Types.ObjectId;
  unit: Types.ObjectId;
  stage: 'inquiry' | 'viewing' | 'negotiation' | 'proposal' | 'contract' | 'closed_won' | 'closed_lost';
  value: { amount: number; currency: string };
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  assignedTo: Types.ObjectId;
  notes?: string;
  lostReason?: string;
  payments: Array<{
    amount: number;
    date: Date;
    method: 'cash' | 'bank_transfer' | 'cheque' | 'credit_card';
    reference?: string;
    notes?: string;
  }>;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const STAGE_PROBABILITY: Record<string, number> = {
  inquiry: 10,
  viewing: 25,
  negotiation: 50,
  proposal: 70,
  contract: 90,
  closed_won: 100,
  closed_lost: 0,
};

const dealSchema = new Schema<IDeal>(
  {
    title: { type: String, required: true, trim: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    stage: {
      type: String,
      enum: ['inquiry', 'viewing', 'negotiation', 'proposal', 'contract', 'closed_won', 'closed_lost'],
      default: 'inquiry',
    },
    value: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'SAR' },
    },
    probability: { type: Number, default: 10, min: 0, max: 100 },
    expectedCloseDate: { type: Date },
    actualCloseDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
    lostReason: { type: String },
    payments: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        method: {
          type: String,
          enum: ['cash', 'bank_transfer', 'cheque', 'credit_card'],
          required: true,
        },
        reference: String,
        notes: String,
      },
    ],
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

// Auto-calculate probability based on stage
dealSchema.pre('save', function () {
  if (this.isModified('stage')) {
    this.probability = STAGE_PROBABILITY[this.stage] ?? this.probability;
  }
});

dealSchema.index({ client: 1 });
dealSchema.index({ unit: 1 });
dealSchema.index({ stage: 1 });
dealSchema.index({ assignedTo: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ createdAt: -1 });

dealSchema.pre(/^find/, function (this: mongoose.Query<unknown, unknown>) {
  if (!(this.getFilter() as Record<string, unknown>).isDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export const Deal = mongoose.model<IDeal>('Deal', dealSchema);
export { STAGE_PROBABILITY };
