import { Schema, Types, model, type Model } from "mongoose";

export type ProductStatus = "draft" | "active" | "inactive";

export interface ProductSpecification {
  key: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface VariantAttribute {
  key: string;
  label: string;
  value: string;
}

export interface ProductVariant {
  sku: string;
  colorName: string;
  colorHex?: string;
  attributes: VariantAttribute[];
  price?: number | null;
  salePrice?: number | null;
  stock: number;
  imageUrl?: string;
}

export interface Product {
  name: string;
  slug: string;
  category: Types.ObjectId;
  brand: Types.ObjectId;
  shortDescription?: string;
  description?: string;
  status: ProductStatus;
  basePrice: number;
  salePrice?: number | null;
  images: ProductImage[];
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type ProductModel = Model<Product>;

const specificationSchema = new Schema<ProductSpecification>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    unit: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const productImageSchema = new Schema<ProductImage>(
  {
    url: { type: String, required: true, trim: true, maxlength: 500 },
    alt: { type: String, trim: true, maxlength: 180, default: "" },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const variantAttributeSchema = new Schema<VariantAttribute>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const productVariantSchema = new Schema<ProductVariant>(
  {
    sku: { type: String, required: true, trim: true, uppercase: true },
    colorName: { type: String, required: true, trim: true },
    colorHex: { type: String, trim: true, default: "" },
    attributes: { type: [variantAttributeSchema], default: [] },
    price: { type: Number, min: 0, default: null },
    salePrice: { type: Number, min: 0, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, trim: true, default: "" },
  },
  { _id: true },
);

const productSchema = new Schema<Product, ProductModel>(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    shortDescription: { type: String, trim: true, maxlength: 300, default: "" },
    description: { type: String, trim: true, maxlength: 100000, default: "" },
    status: { type: String, enum: ["draft", "active", "inactive"], default: "draft", index: true },
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0, default: null },
    images: { type: [productImageSchema], required: true },
    specifications: { type: [specificationSchema], default: [] },
    variants: { type: [productVariantSchema], required: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, versionKey: false },
);

productSchema.index({ "variants.sku": 1 }, { unique: true });

export const ProductModel = model<Product, ProductModel>("Product", productSchema);
