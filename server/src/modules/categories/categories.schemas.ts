import { z } from "zod";

const attributeSchema = z.object({
  key: z.string().trim().min(1).max(60).regex(/^[a-z][a-zA-Z0-9]*$/, "Key phải ở dạng camelCase."),
  label: z.string().trim().min(1).max(100),
  dataType: z.enum(["text", "number", "select", "boolean"]),
  scope: z.enum(["variant", "specification"]),
  options: z.array(z.string().trim().min(1).max(60)).max(100).default([]),
  unit: z.string().trim().max(30).default(""),
  required: z.boolean().default(false),
  filterable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

const categoryFields = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).default(""),
  imageUrl: z.union([z.string().trim().url(), z.string().trim().startsWith("/uploads/"), z.literal("")]).default(""),
  status: z.enum(["active", "inactive"]).default("active"),
  sortOrder: z.number().int().min(0).default(0),
  attributes: z.array(attributeSchema).max(30).default([]),
});

function uniqueAttributeKeys(attributes: Array<{ key: string }>) {
  return new Set(attributes.map((attribute) => attribute.key)).size === attributes.length;
}

export const createCategorySchema = categoryFields.refine(
  (value) => uniqueAttributeKeys(value.attributes),
  { message: "Key thông số trong danh mục không được trùng.", path: ["attributes"] },
);

export const updateCategorySchema = categoryFields
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "Không có dữ liệu cập nhật." })
  .refine((value) => !value.attributes || uniqueAttributeKeys(value.attributes), {
    message: "Key thông số trong danh mục không được trùng.",
    path: ["attributes"],
  });

export const listCategoriesQuerySchema = z.object({
  search: z.string().trim().max(100).default(""),
  status: z.enum(["all", "active", "inactive"]).default("all"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
