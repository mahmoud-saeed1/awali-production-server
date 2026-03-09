import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBuildingType extends Document {
  _id: Types.ObjectId;
  nameEn: string;
  nameAr: string;
  description?: { en: string; ar: string };
  icon?: string;
  isActive: boolean;
  order: number;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const buildingTypeSchema = new Schema<IBuildingType>(
  {
    nameEn: { type: String, required: true, unique: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
    description: {
      en: { type: String, default: "" },
      ar: { type: String, default: "" },
    },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
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
  },
);

buildingTypeSchema.index({ isActive: 1 });
buildingTypeSchema.index({ order: 1 });

export const BuildingType = mongoose.model<IBuildingType>(
  "BuildingType",
  buildingTypeSchema,
);
