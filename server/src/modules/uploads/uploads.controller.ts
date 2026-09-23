import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../../utils/AppError.js";

function bucket() {
  const database = mongoose.connection.db;
  if (!database) throw new AppError("Database chưa sẵn sàng.", 503, "DATABASE_UNAVAILABLE");
  return new mongoose.mongo.GridFSBucket(database, { bucketName: "catalogImages" });
}

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function postCatalogImage(request: Request, response: Response): Promise<void> {
  if (!request.file) {
    throw new AppError("Vui lòng chọn một file ảnh.", 400, "IMAGE_REQUIRED");
  }

  const uploadStream = bucket().openUploadStream(
    `${randomUUID()}${extensionByMimeType[request.file.mimetype] ?? ""}`,
    {
      metadata: {
        originalName: request.file.originalname,
        contentType: request.file.mimetype,
        uploadedBy: request.auth?.userId,
        usage: "catalog",
      },
    },
  );

  await new Promise<void>((resolve, reject) => {
    Readable.from(request.file!.buffer).pipe(uploadStream).on("finish", resolve).on("error", reject);
  });

  response.status(201).json({
    success: true,
    data: {
      image: {
        url: `/uploads/catalog/${uploadStream.id.toString()}`,
        originalName: request.file.originalname,
        mimeType: request.file.mimetype,
        size: request.file.size,
      },
    },
  });
}

export async function getCatalogImage(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const rawId = Array.isArray(request.params.imageId)
    ? request.params.imageId[0]
    : request.params.imageId;
  if (!rawId || !mongoose.Types.ObjectId.isValid(rawId)) {
    throw new AppError("Mã ảnh không hợp lệ.", 400, "INVALID_IMAGE_ID");
  }

  const imageId = new mongoose.Types.ObjectId(rawId);
  const image = await bucket().find({ _id: imageId }).next();
  if (!image) throw new AppError("Không tìm thấy ảnh.", 404, "IMAGE_NOT_FOUND");

  const contentType = image.metadata?.contentType;
  response.setHeader("Content-Type", typeof contentType === "string" ? contentType : "application/octet-stream");
  response.setHeader("Content-Length", image.length.toString());
  response.setHeader("Cache-Control", "public, max-age=604800, immutable");
  bucket().openDownloadStream(imageId).on("error", next).pipe(response);
}
