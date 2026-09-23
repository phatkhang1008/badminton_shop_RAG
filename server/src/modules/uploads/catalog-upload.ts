import multer from "multer";
import { AppError } from "../../utils/AppError.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const catalogImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.", 400, "INVALID_IMAGE_TYPE"));
      return;
    }
    callback(null, true);
  },
});
