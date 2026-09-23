import { Schema, model, type Model } from "mongoose";

export interface Brand {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  status: "active" | "inactive";
  sortOrder: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type BrandModel = Model<Brand>;
const brandSchema = new Schema<Brand, BrandModel>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    logoUrl: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    sortOrder: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const BrandModel = model<Brand, BrandModel>("Brand", brandSchema);
