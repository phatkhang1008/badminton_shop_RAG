import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getCategories, getCategoryById, patchCategory, postCategory, removeCategory } from "./categories.controller.js";

export const categoriesRouter = Router();
categoriesRouter.use(authenticate, authorize("admin"));
categoriesRouter.get("/", asyncHandler(getCategories));
categoriesRouter.post("/", asyncHandler(postCategory));
categoriesRouter.get("/:categoryId", asyncHandler(getCategoryById));
categoriesRouter.patch("/:categoryId", asyncHandler(patchCategory));
categoriesRouter.delete("/:categoryId", asyncHandler(removeCategory));
