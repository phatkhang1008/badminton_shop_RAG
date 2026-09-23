import { z } from "zod";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(5).max(100).default(10),
  search: z.string().trim().max(100).default(""),
  status: z.enum(["all", "active", "blocked"]).default("all"),
  role: z.enum(["all", "admin", "customer"]).default("all"),
  sort: z.enum(["newest", "oldest", "name_asc", "name_desc"]).default("newest"),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(8).max(128),
  role: z.enum(["admin", "customer"]),
  status: z.enum(["active", "blocked"]).default("active"),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().toLowerCase().email().max(160).optional(),
    role: z.enum(["admin", "customer"]).optional(),
    status: z.enum(["active", "blocked"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Cần có ít nhất một thông tin để cập nhật.",
  });

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "blocked"]),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
