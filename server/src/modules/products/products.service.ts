import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { sanitizeRichText } from "../../utils/sanitizeRichText.js";
import { slugify } from "../../utils/slugify.js";
import { BrandModel } from "../brands/brand.model.js";
import { CategoryModel, type CategoryAttribute } from "../categories/category.model.js";
import {
  ProductModel,
  type ProductSpecification,
  type ProductVariant,
} from "./product.model.js";
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from "./products.schemas.js";

const duplicateError = (error: unknown) => Boolean(error && typeof error === "object" && "code" in error && error.code === 11000);
function validId(id: string, label: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError(`${label} không hợp lệ.`, 400, "INVALID_REFERENCE_ID");
}

async function catalogReferences(categoryId: string, brandId: string) {
  validId(categoryId, "Danh mục");
  validId(brandId, "Thương hiệu");
  const [category, brand] = await Promise.all([
    CategoryModel.findOne({ _id: categoryId, deletedAt: null }).lean(),
    BrandModel.findOne({ _id: brandId, deletedAt: null }).lean(),
  ]);
  if (!category) throw new AppError("Không tìm thấy danh mục.", 404, "CATEGORY_NOT_FOUND");
  if (!brand) throw new AppError("Không tìm thấy thương hiệu.", 404, "BRAND_NOT_FOUND");
  return category;
}

function validateAttributes(
  definitions: CategoryAttribute[],
  specifications: ProductSpecification[],
  variants: ProductVariant[],
) {
  const definitionMap = new Map(definitions.map((definition) => [definition.key, definition]));
  const specificationMap = new Map(specifications.map((specification) => [specification.key, specification]));
  const skus = new Set<string>();
  const signatures = new Set<string>();

  for (const definition of definitions.filter((item) => item.scope === "specification" && item.required)) {
    if (!specificationMap.has(definition.key)) {
      throw new AppError(`Thiếu thông số bắt buộc: ${definition.label}.`, 400, "MISSING_SPECIFICATION");
    }
  }
  for (const specification of specifications) {
    const definition = definitionMap.get(specification.key);
    if (!definition || definition.scope !== "specification") {
      throw new AppError(`Thông số ${specification.label} không thuộc danh mục đã chọn.`, 400, "INVALID_SPECIFICATION");
    }
    if (definition.dataType === "select" && definition.options.length && !definition.options.includes(String(specification.value))) {
      throw new AppError(`Giá trị ${specification.value} không hợp lệ cho ${definition.label}.`, 400, "INVALID_ATTRIBUTE_OPTION");
    }
    if (definition.dataType === "number" && typeof specification.value !== "number") {
      throw new AppError(`${definition.label} phải là số.`, 400, "INVALID_SPECIFICATION_TYPE");
    }
    if (definition.dataType === "boolean" && typeof specification.value !== "boolean") {
      throw new AppError(`${definition.label} phải là Có/Không.`, 400, "INVALID_SPECIFICATION_TYPE");
    }
  }

  for (const variant of variants) {
    if (skus.has(variant.sku)) throw new AppError(`SKU ${variant.sku} bị trùng.`, 400, "DUPLICATE_SKU");
    skus.add(variant.sku);
    const values = new Map(variant.attributes.map((attribute) => [attribute.key, attribute.value]));
    for (const definition of definitions.filter((item) => item.scope === "variant" && item.required)) {
      if (!values.has(definition.key)) {
        throw new AppError(`Biến thể ${variant.sku} thiếu ${definition.label}.`, 400, "MISSING_VARIANT_ATTRIBUTE");
      }
    }
    for (const attribute of variant.attributes) {
      const definition = definitionMap.get(attribute.key);
      if (!definition || definition.scope !== "variant") {
        throw new AppError(`Thuộc tính ${attribute.label} không hợp lệ với danh mục.`, 400, "INVALID_VARIANT_ATTRIBUTE");
      }
      if (definition.dataType === "select" && definition.options.length && !definition.options.includes(attribute.value)) {
        throw new AppError(`Giá trị ${attribute.value} không hợp lệ cho ${definition.label}.`, 400, "INVALID_ATTRIBUTE_OPTION");
      }
    }
    const signature = [variant.colorName.toLowerCase(), ...variant.attributes.map((item) => `${item.key}:${item.value}`).sort()].join("|");
    if (signatures.has(signature)) throw new AppError("Các biến thể không được trùng màu và thông số.", 400, "DUPLICATE_VARIANT");
    signatures.add(signature);
  }
}

function validatePrices(basePrice: number, salePrice: number | null | undefined, variants: ProductVariant[]) {
  if (salePrice != null && salePrice > basePrice) {
    throw new AppError("Giá khuyến mãi không được lớn hơn giá bán.", 400, "INVALID_SALE_PRICE");
  }
  for (const variant of variants) {
    const regularPrice = variant.price ?? basePrice;
    if (variant.salePrice != null && variant.salePrice > regularPrice) {
      throw new AppError(`Giá khuyến mãi của SKU ${variant.sku} không hợp lệ.`, 400, "INVALID_SALE_PRICE");
    }
  }
}

function productPayload(input: CreateProductInput | UpdateProductInput) {
  const { categoryId, brandId, ...fields } = input;
  return {
    ...fields,
    ...(fields.description !== undefined ? { description: sanitizeRichText(fields.description) } : {}),
    ...(categoryId !== undefined ? { category: categoryId } : {}),
    ...(brandId !== undefined ? { brand: brandId } : {}),
  };
}

export async function listProducts(query: ListProductsQuery) {
  const filter: Record<string, unknown> = { deletedAt: null };
  if (query.status !== "all") filter.status = query.status;
  if (query.categoryId !== "all") filter.category = query.categoryId;
  if (query.brandId !== "all") filter.brand = query.brandId;
  if (query.search) {
    const regex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: regex }, { "variants.sku": regex }];
  }
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    ProductModel.find(filter)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    ProductModel.countDocuments(filter),
  ]);
  return {
    products: items.map((item) => ({
      ...item,
      id: item._id.toString(),
      totalStock: item.variants.reduce((sum, variant) => sum + variant.stock, 0),
    })),
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) },
  };
}

export async function getProduct(id: string) {
  validId(id, "Mã sản phẩm");
  const product = await ProductModel.findOne({ _id: id, deletedAt: null })
    .populate("category", "name slug attributes")
    .populate("brand", "name slug")
    .lean();
  if (!product) throw new AppError("Không tìm thấy sản phẩm.", 404, "PRODUCT_NOT_FOUND");
  return { ...product, id: product._id.toString(), totalStock: product.variants.reduce((sum, variant) => sum + variant.stock, 0) };
}

export async function createProduct(input: CreateProductInput) {
  const category = await catalogReferences(input.categoryId, input.brandId);
  validateAttributes(category.attributes, input.specifications, input.variants);
  validatePrices(input.basePrice, input.salePrice, input.variants);
  try {
    return await ProductModel.create({ ...productPayload(input), slug: slugify(input.slug || input.name) });
  } catch (error) {
    if (duplicateError(error)) throw new AppError("Slug sản phẩm hoặc SKU đã tồn tại.", 409, "PRODUCT_EXISTS");
    throw error;
  }
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  validId(id, "Mã sản phẩm");
  const current = await ProductModel.findOne({ _id: id, deletedAt: null }).lean();
  if (!current) throw new AppError("Không tìm thấy sản phẩm.", 404, "PRODUCT_NOT_FOUND");
  const categoryId = input.categoryId ?? current.category.toString();
  const brandId = input.brandId ?? current.brand.toString();
  const category = await catalogReferences(categoryId, brandId);
  const specifications = input.specifications ?? current.specifications;
  const variants = input.variants ?? current.variants;
  validateAttributes(category.attributes, specifications, variants);
  validatePrices(input.basePrice ?? current.basePrice, input.salePrice === undefined ? current.salePrice : input.salePrice, variants);
  const update: Record<string, unknown> = productPayload(input);
  if (input.slug !== undefined || input.name !== undefined) update.slug = slugify(input.slug || input.name || current.name);
  try {
    const product = await ProductModel.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!product) throw new AppError("Không tìm thấy sản phẩm.", 404, "PRODUCT_NOT_FOUND");
    return product;
  } catch (error) {
    if (duplicateError(error)) throw new AppError("Slug sản phẩm hoặc SKU đã tồn tại.", 409, "PRODUCT_EXISTS");
    throw error;
  }
}

export async function deleteProduct(id: string) {
  validId(id, "Mã sản phẩm");
  const product = await ProductModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { status: "inactive", deletedAt: new Date() },
  );
  if (!product) throw new AppError("Không tìm thấy sản phẩm.", 404, "PRODUCT_NOT_FOUND");
}
