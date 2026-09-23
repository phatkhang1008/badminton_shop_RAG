import { z } from "zod";

const nullablePrice = z.number().min(0).nullable().optional();
const imageUrlSchema = z.union([
  z.string().trim().url(),
  z.string().trim().startsWith("/uploads/"),
]);
const productImageSchema = z.object({
  url: imageUrlSchema,
  alt: z.string().trim().max(180).default(""),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});
const specificationSchema = z.object({
  key: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(100),
  value: z.union([z.string().trim().max(500), z.number(), z.boolean()]),
  unit: z.string().trim().max(30).default(""),
});
const variantAttributeSchema = z.object({
  key: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(100),
  value: z.string().trim().min(1).max(100),
});
const variantSchema = z.object({
  sku: z.string().trim().min(2).max(80).transform((value) => value.toUpperCase()),
  colorName: z.string().trim().min(1).max(60),
  colorHex: z.string().trim().max(20).default(""),
  attributes: z.array(variantAttributeSchema).max(10).default([]),
  price: nullablePrice,
  salePrice: nullablePrice,
  stock: z.number().int().min(0),
  imageUrl: z.union([imageUrlSchema, z.literal("")]).default(""),
});

const productFields = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().max(200).optional(),
  categoryId: z.string().trim().min(1),
  brandId: z.string().trim().min(1),
  shortDescription: z.string().trim().max(300).default(""),
  description: z.string().trim().max(100000).default(""),
  status: z.enum(["draft", "active", "inactive"]).default("draft"),
  basePrice: z.number().min(0),
  salePrice: nullablePrice,
  images: z
    .array(productImageSchema)
    .min(1, "Sản phẩm cần ít nhất một ảnh.")
    .max(12, "Mỗi sản phẩm được tối đa 12 ảnh.")
    .refine((images) => images.filter((image) => image.isPrimary).length === 1, {
      message: "Sản phẩm phải có đúng một ảnh đại diện.",
    }),
  specifications: z.array(specificationSchema).max(30).default([]),
  variants: z.array(variantSchema).min(1).max(200),
});

function validPrices(value: { basePrice?: number; salePrice?: number | null }) {
  return value.salePrice == null || value.basePrice == null || value.salePrice <= value.basePrice;
}

export const createProductSchema = productFields.refine(validPrices, {
  message: "Giá khuyến mãi không được lớn hơn giá bán.",
  path: ["salePrice"],
});
export const updateProductSchema = productFields
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "Không có dữ liệu cập nhật." })
  .refine(validPrices, { message: "Giá khuyến mãi không được lớn hơn giá bán.", path: ["salePrice"] });

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(5).max(100).default(10),
  search: z.string().trim().max(100).default(""),
  categoryId: z.string().trim().default("all"),
  brandId: z.string().trim().default("all"),
  status: z.enum(["all", "draft", "active", "inactive"]).default("all"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
