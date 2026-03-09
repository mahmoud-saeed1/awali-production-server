import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUnit extends Document {
  _id: Types.ObjectId;
  unitNumber: string;
  buildingType: Types.ObjectId;
  unitType: Types.ObjectId;
  description: { en: string; ar: string };
  status: "available" | "reserved" | "sold" | "unavailable" | "maintenance";
  price: { amount: number; currency: string };
  area: { plot: number; built: number; unit: string };
  specifications: { bedrooms: number; bathrooms: number; floors: number };
  facade: string;
  images: Array<{
    url: string;
    key: string;
    alt: { en: string; ar: string };
    isPrimary: boolean;
    order: number;
  }>;
  documents: Array<{
    url: string;
    key: string;
    name: { en: string; ar: string };
    type: string;
    order: number;
  }>;
  hasVirtualTour: boolean;
  virtualTourUrl?: string;
  publication: { isPublished: boolean; publishedAt?: Date | null };
  features: Types.ObjectId[];
  map?: { svgElementId: string };
  viewCount: number;
  searchCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const unitSchema = new Schema<IUnit>(
  {
    unitNumber: {
      type: String,
      required: [true, "Unit number is required"],
      unique: true,
      trim: true,
    },
    buildingType: {
      type: Schema.Types.ObjectId,
      ref: "BuildingType",
      required: [true, "Building type is required"],
    },
    unitType: {
      type: Schema.Types.ObjectId,
      ref: "UnitType",
      required: [true, "Unit type is required"],
    },
    description: {
      en: { type: String, default: "" },
      ar: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["available", "reserved", "sold", "unavailable", "maintenance"],
      default: "available",
    },
    price: {
      amount: { type: Number, required: [true, "Price is required"] },
      currency: { type: String, default: "SAR" },
    },
    area: {
      plot: { type: Number, default: 0 },
      built: { type: Number, default: 0 },
      unit: { type: String, enum: ["sqm", "sqft"], default: "sqm" },
    },
    specifications: {
      bedrooms: { type: Number, default: 0 },
      bathrooms: { type: Number, default: 0 },
      floors: { type: Number, default: 1 },
    },
    facade: {
      type: String,
      enum: [
        "north",
        "south",
        "east",
        "west",
        "north_east",
        "north_west",
        "south_east",
        "south_west",
      ],
    },
    images: [
      {
        url: String,
        key: String,
        alt: {
          en: { type: String, default: "" },
          ar: { type: String, default: "" },
        },
        isPrimary: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
      },
    ],
    documents: [
      {
        url: String,
        key: String,
        name: { en: String, ar: String },
        type: {
          type: String,
          enum: ["floor_plan", "deed", "contract", "brochure", "other"],
        },
        order: { type: Number, default: 0 },
      },
    ],
    hasVirtualTour: { type: Boolean, default: false },
    virtualTourUrl: { type: String },
    publication: {
      isPublished: { type: Boolean, default: false },
      publishedAt: { type: Date, default: null },
    },
    features: [{ type: Schema.Types.ObjectId, ref: "Feature" }],
    map: {
      svgElementId: { type: String },
    },
    viewCount: { type: Number, default: 0 },
    searchCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
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

// Indexes
unitSchema.index({ unitNumber: 1 }, { unique: true });
unitSchema.index({ status: 1, "publication.isPublished": 1, isDeleted: 1 });
unitSchema.index({ buildingType: 1, unitType: 1 });
unitSchema.index({ "price.amount": 1 });
unitSchema.index({ facade: 1 });
unitSchema.index({ createdAt: -1 });
unitSchema.index({ "specifications.bedrooms": 1 });
unitSchema.index({
  unitNumber: "text",
  "description.en": "text",
  "description.ar": "text",
});

// Default query: exclude soft-deleted
unitSchema.pre(/^find/, function (this: mongoose.Query<unknown, unknown>) {
  if (!(this.getFilter() as Record<string, unknown>).isDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export const Unit = mongoose.model<IUnit>("Unit", unitSchema);
