import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { catalogImageUpload } from "./catalog-upload.js";
import { getCatalogImage, postCatalogImage } from "./uploads.controller.js";

export const uploadsRouter = Router();
uploadsRouter.use(authenticate, authorize("admin"));
uploadsRouter.post("/catalog-image", catalogImageUpload.single("image"), asyncHandler(postCatalogImage));

export const catalogImagesRouter = Router();
catalogImagesRouter.get("/:imageId", asyncHandler(getCatalogImage));
