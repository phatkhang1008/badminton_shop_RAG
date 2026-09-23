import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";
import { ProductModel } from "../products/product.model.js";
import { BrandModel } from "./brand.model.js";
import type { CreateBrandInput, ListBrandsQuery, UpdateBrandInput } from "./brands.schemas.js";

const duplicateError = (error: unknown) => Boolean(error && typeof error === "object" && "code" in error && error.code === 11000);
function validId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Mã thương hiệu không hợp lệ.", 400, "INVALID_BRAND_ID");
}

export async function listBrands(query: ListBrandsQuery) {
  const filter: Record<string, unknown> = { deletedAt: null };
  if (query.status !== "all") filter.status = query.status;
  if (query.search) filter.name = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  return BrandModel.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
}

export async function getBrand(id: string) {
  validId(id);
  const brand = await BrandModel.findOne({ _id: id, deletedAt: null }).lean();
  if (!brand) throw new AppError("Không tìm thấy thương hiệu.", 404, "BRAND_NOT_FOUND");
  return brand;
}

export async function createBrand(input: CreateBrandInput) {
  try {
    return await BrandModel.create({ ...input, slug: slugify(input.slug || input.name) });
  } catch (error) {
    if (duplicateError(error)) throw new AppError("Thương hiệu đã tồn tại.", 409, "BRAND_EXISTS");
    throw error;
  }
}

export async function updateBrand(id: string, input: UpdateBrandInput) {
  validId(id);
  const update = { ...input };
  if (input.slug !== undefined || input.name !== undefined) update.slug = slugify(input.slug || input.name || "");
  try {
    const brand = await BrandModel.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!brand) throw new AppError("Không tìm thấy thương hiệu.", 404, "BRAND_NOT_FOUND");
    return brand;
  } catch (error) {
    if (duplicateError(error)) throw new AppError("Thương hiệu đã tồn tại.", 409, "BRAND_EXISTS");
    throw error;
  }
}

export async function deleteBrand(id: string) {
  validId(id);
  if (await ProductModel.exists({ brand: id, deletedAt: null })) {
    throw new AppError("Không thể xóa thương hiệu đang có sản phẩm.", 409, "BRAND_IN_USE");
  }
  const brand = await BrandModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { status: "inactive", deletedAt: new Date() },
  );
  if (!brand) throw new AppError("Không tìm thấy thương hiệu.", 404, "BRAND_NOT_FOUND");
}
