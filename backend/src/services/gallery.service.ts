import mongoose from "mongoose";
import { GalleryImage, type GalleryStorageProvider } from "../models";
import { ApiError } from "../utils/ApiError";
import { normalizeStoredImagePath } from "../utils/imagePath";
import { getFileStorage } from "./storage";
import type { UploadFileInput } from "./storage/types";

export type AdminGalleryImageDto = {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType?: string;
  altText?: string;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicGalleryImageDto = {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType?: string;
  altText?: string;
  width?: number;
  height?: number;
  createdAt: string;
};

function assertObjectId(id: string): void {
  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest("Invalid gallery image ID");
  }
}

function toAdminDto(doc: {
  _id: mongoose.Types.ObjectId;
  filename: string;
  url: string;
  size: number;
  mimeType?: string;
  altText?: string;
  width?: number;
  height?: number;
  createdAt?: Date;
  updatedAt?: Date;
}): AdminGalleryImageDto {
  return {
    id: String(doc._id),
    filename: doc.filename,
    url: doc.url,
    size: doc.size,
    mimeType: doc.mimeType,
    altText: doc.altText,
    width: doc.width,
    height: doc.height,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

function toPublicDto(doc: {
  _id: mongoose.Types.ObjectId;
  filename: string;
  url: string;
  size: number;
  mimeType?: string;
  altText?: string;
  width?: number;
  height?: number;
  createdAt?: Date;
}): PublicGalleryImageDto {
  return {
    id: String(doc._id),
    filename: doc.filename,
    url: doc.url,
    size: doc.size,
    mimeType: doc.mimeType,
    altText: doc.altText,
    width: doc.width,
    height: doc.height,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  };
}

/** Admin list — dedicated GalleryImage records only (newest first). */
export async function listAdminGalleryImages(): Promise<AdminGalleryImageDto[]> {
  const images = await GalleryImage.find()
    .sort({ createdAt: -1 })
    .select("filename url size mimeType altText width height createdAt updatedAt")
    .lean();

  return images.map((image) => toAdminDto(image));
}

/** Public list — safe fields only; never includes storageKey. */
export async function listPublicGalleryImages(): Promise<PublicGalleryImageDto[]> {
  const images = await GalleryImage.find()
    .sort({ createdAt: -1 })
    .select("filename url size mimeType altText width height createdAt")
    .lean();

  return images.map((image) => toPublicDto(image));
}

export async function uploadGalleryImage(
  file: Express.Multer.File,
): Promise<AdminGalleryImageDto> {
  const storage = getFileStorage();

  const input: UploadFileInput = {
    filePath: file.path,
    originalFilename: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    namespace: "gallery",
  };

  const uploaded = await storage.uploadFile(input);
  const url =
    normalizeStoredImagePath(uploaded.storedPath) ??
    storage.getPublicUrl(uploaded.storedPath);

  try {
    const created = await GalleryImage.create({
      filename: uploaded.filename,
      url,
      storageKey: uploaded.deleteKey,
      storageProvider: storage.provider as GalleryStorageProvider,
      size: uploaded.size,
      mimeType: file.mimetype,
      altText: "DoughArt custom cake gallery photo",
    });

    return toAdminDto(created.toObject());
  } catch (error) {
    // Roll back the storage asset if the DB write fails
    try {
      await storage.deleteFile(uploaded.deleteKey);
    } catch {
      // ignore cleanup failure; log-safe identifier only
      console.error(
        "[gallery] Failed to roll back storage after DB create error",
        uploaded.filename,
      );
    }
    throw error;
  }
}

/**
 * Delete by Gallery database ID only.
 * Uses the server-side storageKey from the record — never a client-supplied path.
 */
export async function deleteGalleryImageById(
  id: string,
): Promise<{ id: string }> {
  assertObjectId(id);

  const image = await GalleryImage.findById(id);
  if (!image) {
    throw ApiError.notFound("Gallery image not found");
  }

  const storage = getFileStorage();
  const storageKey = image.storageKey;
  const filename = image.filename;

  try {
    await storage.deleteFile(storageKey);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const alreadyGone =
      /ENOENT|not found|not_found/i.test(message) ||
      (error as NodeJS.ErrnoException)?.code === "ENOENT";

    if (!alreadyGone) {
      console.error("[gallery] Storage delete failed for", filename);
      throw ApiError.internal("Failed to delete gallery image from storage");
    }

    console.warn(
      "[gallery] Storage asset already missing; removing stale DB record for",
      filename,
    );
  }

  await image.deleteOne();
  return { id };
}
