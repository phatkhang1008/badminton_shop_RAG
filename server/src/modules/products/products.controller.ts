import type { Request, Response } from "express";
import {
  createProductSchema,
  listProductsQuerySchema,
  listPublicProductsQuerySchema,
  updateProductSchema,
} from "./products.schemas.js";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getPublicProductBySlug,
  listProducts,
  listPublicProducts,
  updateProduct,
} from "./products.service.js";

const param = (value: string | string[] | undefined) => Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
export async function getProducts(request: Request, response: Response) {
  response.json({ success: true, data: await listProducts(listProductsQuerySchema.parse(request.query)) });
}
export async function getPublicProducts(request: Request, response: Response) {
  response.json({ success: true, data: await listPublicProducts(listPublicProductsQuerySchema.parse(request.query)) });
}
export async function getPublicProduct(request: Request, response: Response) {
  response.json({ success: true, data: { product: await getPublicProductBySlug(param(request.params.slug)) } });
}
export async function getProductById(request: Request, response: Response) {
  response.json({ success: true, data: { product: await getProduct(param(request.params.productId)) } });
}
export async function postProduct(request: Request, response: Response) {
  const product = await createProduct(createProductSchema.parse(request.body));
  response.status(201).json({ success: true, data: { product } });
}
export async function patchProduct(request: Request, response: Response) {
  const product = await updateProduct(param(request.params.productId), updateProductSchema.parse(request.body));
  response.json({ success: true, data: { product } });
}
export async function removeProduct(request: Request, response: Response) {
  await deleteProduct(param(request.params.productId));
  response.json({ success: true, data: null });
}
