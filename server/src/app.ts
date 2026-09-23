import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { brandsRouter } from "./modules/brands/brands.routes.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { productsRouter } from "./modules/products/products.routes.js";
import { catalogImagesRouter, uploadsRouter } from "./modules/uploads/uploads.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads/catalog", catalogImagesRouter);

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    data: { service: "badminton-shop-api", status: "ok", timestamp: new Date().toISOString() },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/admin/dashboard", dashboardRouter);
app.use("/api/admin/users", usersRouter);
app.use("/api/admin/categories", categoriesRouter);
app.use("/api/admin/brands", brandsRouter);
app.use("/api/admin/products", productsRouter);
app.use("/api/admin/uploads", uploadsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
