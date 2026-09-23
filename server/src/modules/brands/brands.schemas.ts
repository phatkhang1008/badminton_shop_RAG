import { z } from "zod";

const brandFields = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).default(""),
  logoUrl: z.union([z.string().trim().url(), z.string().trim().startsWith("/uploads/"), z.literal("")]).default(""),
  status: z.enum(["active", "inactive"]).default("active"),
  sortOrder: z.number().int().min(0).default(0),
});

export const createBrandSchema = brandFields;
export const updateBrandSchema = brandFields.partial().refine((value) => Object.keys(value).length > 0, {
  message: "Không có dữ liệu cập nhật.",
});
export const listBrandsQuerySchema = z.object({
  search: z.string().trim().max(100).default(""),
  status: z.enum(["all", "active", "inactive"]).default("all"),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type ListBrandsQuery = z.infer<typeof listBrandsQuerySchema>;
