import { Schema, model, type HydratedDocument, type Model } from "mongoose";

export type AttributeDataType = "text" | "number" | "select" | "boolean";
export type AttributeScope = "variant" | "specification";

export interface CategoryAttribute {
  key: string;
  label: string;
  dataType: AttributeDataType;
  scope: AttributeScope;
  options: string[];
  unit?: string;
  required: boolean;
  filterable: boolean;
  sortOrder: number;
}

export interface Category {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  status: "active" | "inactive";
  sortOrder: number;
  attributes: CategoryAttribute[];
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type CategoryModel = Model<Category>;
export type CategoryDocument = HydratedDocument<Category>;

const categoryAttributeSchema = new Schema<CategoryAttribute>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    dataType: { type: String, enum: ["text", "number", "select", "boolean"], required: true },
    scope: { type: String, enum: ["variant", "specification"], required: true },
    options: { type: [String], default: [] },
    unit: { type: String, trim: true, default: "" },
    required: { type: Boolean, default: false },
    filterable: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

const categorySchema = new Schema<Category, CategoryModel>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    imageUrl: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    sortOrder: { type: Number, default: 0 },
    attributes: { type: [categoryAttributeSchema], default: [] },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const CategoryModel = model<Category, CategoryModel>("Category", categorySchema);
