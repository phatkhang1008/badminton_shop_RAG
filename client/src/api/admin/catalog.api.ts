import { http } from "../core/http";

export type EntityStatus = "active" | "inactive";
export type ProductStatus = "draft" | "active" | "inactive";
export type AttributeDataType = "text" | "number" | "select" | "boolean";
export type AttributeScope = "variant" | "specification";

export interface CategoryAttribute {
  key: string;
  label: string;
  dataType: AttributeDataType;
  scope: AttributeScope;
  options: string[];
  unit: string;
  required: boolean;
  filterable: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: EntityStatus;
  sortOrder: number;
  attributes: CategoryAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  status: EntityStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryInput = Omit<Category, "id" | "slug" | "createdAt" | "updatedAt"> & { slug?: string };
export type BrandInput = Omit<Brand, "id" | "slug" | "createdAt" | "updatedAt"> & { slug?: string };

interface RawCategory extends Omit<Category, "id"> { _id: string }
interface RawBrand extends Omit<Brand, "id"> { _id: string }

const normalizeCategory = ({ _id, ...category }: RawCategory): Category => ({ id: _id, ...category });
const normalizeBrand = ({ _id, ...brand }: RawBrand): Brand => ({ id: _id, ...brand });

export async function getCategories(params: { search?: string; status?: string } = {}): Promise<Category[]> {
  const response = await http.get<{ success: true; data: { categories: RawCategory[] } }>(
    "/admin/categories",
    { params },
  );
  return response.data.data.categories.map(normalizeCategory);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const response = await http.post<{ success: true; data: { category: RawCategory } }>("/admin/categories", input);
  return normalizeCategory(response.data.data.category);
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const response = await http.patch<{ success: true; data: { category: RawCategory } }>(`/admin/categories/${id}`, input);
  return normalizeCategory(response.data.data.category);
}

export async function deleteCategory(id: string): Promise<void> {
  await http.delete(`/admin/categories/${id}`);
}

export async function getBrands(params: { search?: string; status?: string } = {}): Promise<Brand[]> {
  const response = await http.get<{ success: true; data: { brands: RawBrand[] } }>("/admin/brands", { params });
  return response.data.data.brands.map(normalizeBrand);
}

export async function createBrand(input: BrandInput): Promise<Brand> {
  const response = await http.post<{ success: true; data: { brand: RawBrand } }>("/admin/brands", input);
  return normalizeBrand(response.data.data.brand);
}

export async function updateBrand(id: string, input: Partial<BrandInput>): Promise<Brand> {
  const response = await http.patch<{ success: true; data: { brand: RawBrand } }>(`/admin/brands/${id}`, input);
  return normalizeBrand(response.data.data.brand);
}

export async function deleteBrand(id: string): Promise<void> {
  await http.delete(`/admin/brands/${id}`);
}

export interface UploadedImage {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export async function uploadCatalogImage(file: File): Promise<UploadedImage> {
  const body = new FormData();
  body.append("image", file);
  const response = await http.post<{ success: true; data: { image: UploadedImage } }>(
    "/admin/uploads/catalog-image",
    body,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.data.image;
}

export interface ProductSpecification {
  key: string;
  label: string;
  value: string | number | boolean;
  unit: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface VariantAttribute { key: string; label: string; value: string }
export interface ProductVariant {
  _id?: string;
  sku: string;
  colorName: string;
  colorHex: string;
  attributes: VariantAttribute[];
  price?: number | null;
  salePrice?: number | null;
  stock: number;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: { _id: string; name: string; slug: string; attributes?: CategoryAttribute[] };
  brand: { _id: string; name: string; slug: string };
  shortDescription: string;
  description: string;
  status: ProductStatus;
  basePrice: number;
  salePrice?: number | null;
  images: ProductImage[];
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  totalStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  slug?: string;
  categoryId: string;
  brandId: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  basePrice: number;
  salePrice?: number | null;
  images: ProductImage[];
  specifications: ProductSpecification[];
  variants: ProductVariant[];
}

export interface ProductListParams {
  page: number;
  limit: number;
  search: string;
  categoryId: string;
  brandId: string;
  status: "all" | ProductStatus;
}

export interface ProductListResult {
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function getProducts(params: ProductListParams): Promise<ProductListResult> {
  const response = await http.get<{ success: true; data: ProductListResult }>("/admin/products", { params });
  return response.data.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await http.get<{ success: true; data: { product: Product } }>(`/admin/products/${id}`);
  return response.data.data.product;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const response = await http.post<{ success: true; data: { product: Product } }>("/admin/products", input);
  return response.data.data.product;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const response = await http.patch<{ success: true; data: { product: Product } }>(`/admin/products/${id}`, input);
  return response.data.data.product;
}

export async function deleteProduct(id: string): Promise<void> {
  await http.delete(`/admin/products/${id}`);
}
