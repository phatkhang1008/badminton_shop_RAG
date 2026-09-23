import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getBrandById, getBrands, patchBrand, postBrand, removeBrand } from "./brands.controller.js";

export const brandsRouter = Router();
brandsRouter.use(authenticate, authorize("admin"));
brandsRouter.get("/", asyncHandler(getBrands));
brandsRouter.post("/", asyncHandler(postBrand));
brandsRouter.get("/:brandId", asyncHandler(getBrandById));
brandsRouter.patch("/:brandId", asyncHandler(patchBrand));
brandsRouter.delete("/:brandId", asyncHandler(removeBrand));
