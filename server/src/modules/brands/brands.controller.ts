import type { Request, Response } from "express";
import { createBrandSchema, listBrandsQuerySchema, updateBrandSchema } from "./brands.schemas.js";
import { createBrand, deleteBrand, getBrand, listBrands, updateBrand } from "./brands.service.js";

const param = (value: string | string[] | undefined) => Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
export async function getBrands(request: Request, response: Response) {
  response.json({ success: true, data: { brands: await listBrands(listBrandsQuerySchema.parse(request.query)) } });
}
export async function getBrandById(request: Request, response: Response) {
  response.json({ success: true, data: { brand: await getBrand(param(request.params.brandId)) } });
}
export async function postBrand(request: Request, response: Response) {
  const brand = await createBrand(createBrandSchema.parse(request.body));
  response.status(201).json({ success: true, data: { brand } });
}
export async function patchBrand(request: Request, response: Response) {
  const brand = await updateBrand(param(request.params.brandId), updateBrandSchema.parse(request.body));
  response.json({ success: true, data: { brand } });
}
export async function removeBrand(request: Request, response: Response) {
  await deleteBrand(param(request.params.brandId));
  response.json({ success: true, data: null });
}
