import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";
import { ProductModel } from "../products/product.model.js";
import { CategoryModel } from "./category.model.js";
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from "./categories.schemas.js";

function duplicateError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === 11000);
}

function validId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Mã danh mục không hợp lệ.", 400, "INVALID_CATEGORY_ID");
}

export async function listCategories(query: ListCategoriesQuery) {
  const filter: Record<string, unknown> = { deletedAt: null };
  if (query.status !== "all") filter.status = query.status;
  if (query.search) filter.name = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  return CategoryModel.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
}

export async function getCategory(id: string) {
  validId(id);
  const category = await CategoryModel.findOne({ _id: id, deletedAt: null }).lean();
  if (!category) throw new AppError("Không tìm thấy danh mục.", 404, "CATEGORY_NOT_FOUND");
  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    return await CategoryModel.create({ ...input, slug: slugify(input.slug || input.name) });
  } catch (error) {
    if (duplicateError(error)) throw new AppError("Slug danh mục đã tồn tại.", 409, "CATEGORY_EXISTS");
    throw error;
  }
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  validId(id);
  const update = { ...input };
  if (input.slug !== undefined || input.name !== undefined) {
    update.slug = slugify(input.slug || input.name || "");
  }
  try {
    const category = await CategoryModel.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!category) throw new AppError("Không tìm thấy danh mục.", 404, "CATEGORY_NOT_FOUND");
    return category;
  } catch (error) {
    if (duplicateError(error)) throw new AppError("Slug danh mục đã tồn tại.", 409, "CATEGORY_EXISTS");
    throw error;
  }
}

export async function deleteCategory(id: string) {
  validId(id);
  const used = await ProductModel.exists({ category: id, deletedAt: null });
  if (used) throw new AppError("Không thể xóa danh mục đang có sản phẩm.", 409, "CATEGORY_IN_USE");
  const category = await CategoryModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { status: "inactive", deletedAt: new Date() },
  );
  if (!category) throw new AppError("Không tìm thấy danh mục.", 404, "CATEGORY_NOT_FOUND");
}
