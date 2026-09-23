import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/database.js";

const legacyDirectory = fileURLToPath(new URL("../../uploads/catalog", import.meta.url));
const legacyUrlPattern = /^\/uploads\/catalog\/([^/]+\.(?:jpe?g|png|webp))$/i;
const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function migrateCatalogImages() {
  await connectDatabase();
  const database = mongoose.connection.db!;
  const bucket = new mongoose.mongo.GridFSBucket(database, { bucketName: "catalogImages" });
  const [categories, brands] = await Promise.all([
    database.collection("categories").find({ imageUrl: legacyUrlPattern }).toArray(),
    database.collection("brands").find({ logoUrl: legacyUrlPattern }).toArray(),
  ]);

  const migratedUrls = new Map<string, string>();
  let migrated = 0;
  let missing = 0;

  for (const record of [
    ...categories.map((document) => ({ collection: "categories", field: "imageUrl", document })),
    ...brands.map((document) => ({ collection: "brands", field: "logoUrl", document })),
  ]) {
    const oldUrl = String(record.document[record.field]);
    let newUrl = migratedUrls.get(oldUrl);
    if (!newUrl) {
      const match = oldUrl.match(legacyUrlPattern);
      const filename = match?.[1];
      const filePath = filename ? path.join(legacyDirectory, filename) : "";
      if (!filename || !existsSync(filePath)) {
        console.warn(`Legacy image not found: ${oldUrl}`);
        missing += 1;
        continue;
      }

      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          contentType: mimeTypes[path.extname(filename).toLowerCase()] ?? "application/octet-stream",
          originalName: filename,
          usage: "catalog",
          migratedFrom: oldUrl,
        },
      });
      await new Promise<void>((resolve, reject) => {
        createReadStream(filePath).pipe(uploadStream).on("finish", resolve).on("error", reject);
      });
      newUrl = `/uploads/catalog/${uploadStream.id.toString()}`;
      migratedUrls.set(oldUrl, newUrl);
    }

    await database.collection(record.collection).updateOne(
      { _id: record.document._id },
      { $set: { [record.field]: newUrl } },
    );
    migrated += 1;
  }

  console.log(`Catalog image migration complete: ${migrated} references migrated, ${missing} missing.`);
  console.log("Legacy files were retained as a local backup and remain ignored by Git.");
}

migrateCatalogImages()
  .catch((error) => {
    console.error("Unable to migrate catalog images:", error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
