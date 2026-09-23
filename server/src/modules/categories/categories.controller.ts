import type { Request, Response } from "express";
import { createCategorySchema, listCategoriesQuerySchema, updateCategorySchema } from "./categories.schemas.js";
import { createCategory, deleteCategory, getCategory, listCategories, updateCategory } from "./categories.service.js";

const param = (value: string | string[] | undefined) => Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

export async function getCategories(request: Request, response: Response) {
  response.json({ success: true, data: { categories: await listCategories(listCategoriesQuerySchema.parse(request.query)) } });
}
export async function getCategoryById(request: Request, response: Response) {
  response.json({ success: true, data: { category: await getCategory(param(request.params.categoryId)) } });
}
export async function postCategory(request: Request, response: Response) {
  const category = await createCategory(createCategorySchema.parse(request.body));
  response.status(201).json({ success: true, data: { category } });
}
export async function patchCategory(request: Request, response: Response) {
  const category = await updateCategory(param(request.params.categoryId), updateCategorySchema.parse(request.body));
  response.json({ success: true, data: { category } });
}
export async function removeCategory(request: Request, response: Response) {
  await deleteCategory(param(request.params.categoryId));
  response.json({ success: true, data: null });
}
