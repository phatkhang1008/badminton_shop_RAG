import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPublicProduct, getPublicProducts } from "./products.controller.js";

export const publicProductsRouter = Router();

publicProductsRouter.get("/", asyncHandler(getPublicProducts));
publicProductsRouter.get("/:slug", asyncHandler(getPublicProduct));
