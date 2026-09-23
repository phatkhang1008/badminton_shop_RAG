import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getProductById, getProducts, patchProduct, postProduct, removeProduct } from "./products.controller.js";

export const productsRouter = Router();
productsRouter.use(authenticate, authorize("admin"));
productsRouter.get("/", asyncHandler(getProducts));
productsRouter.post("/", asyncHandler(postProduct));
productsRouter.get("/:productId", asyncHandler(getProductById));
productsRouter.patch("/:productId", asyncHandler(patchProduct));
productsRouter.delete("/:productId", asyncHandler(removeProduct));
