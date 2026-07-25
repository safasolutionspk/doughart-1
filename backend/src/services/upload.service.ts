import fs from "fs/promises";

import { isAllowedImageFilename } from "../config/upload";

import { ApiError } from "../utils/ApiError";

import { normalizeStoredImagePath } from "../utils/imagePath";

import { getFileStorage, isLocalUploadProvider } from "./storage";

import type { UploadFileInput } from "./storage/types";

export type GalleryImage = {
  filename: string;
  deleteKey: string;
  url: string;
  size: number;
  createdAt: string;
};

export type UploadedImageResponse = {
  filename: string;
  deleteKey: string;
  /** Value to store in MongoDB */
  path: string;
  url: string;
  size: number;
};

function buildUploadedImageResponse(
  result: Awaited<ReturnType<ReturnType<typeof getFileStorage>["uploadFile"]>>,
): UploadedImageResponse {
  const storage = getFileStorage();
  const url = storage.getPublicUrl(result.storedPath);
  const path = normalizeStoredImagePath(result.storedPath) ?? result.storedPath;

  return {
    filename: result.filename,
    deleteKey: result.deleteKey,
    path,
    url,
    size: result.size,
  };
}

/** Shared catalog upload (products, categories, settings, reviews). */
export async function processUploadedFile(
  file: Express.Multer.File,
): Promise<UploadedImageResponse> {
  const storage = getFileStorage();
  const input: UploadFileInput = {
    filePath: file.path,
    originalFilename: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    namespace: "default",
  };

  const result = await storage.uploadFile(input);
  return buildUploadedImageResponse(result);
}

/** @deprecated Use processUploadedFile — kept for internal callers */
export function getUploadedImageResponse(filename: string, size: number) {
  const storage = getFileStorage();
  const storedPath = storage.getPublicUrl(
    storage.provider === "local" ? `/uploads/images/${filename}` : filename,
  );
  const path = normalizeStoredImagePath(storedPath) ?? storedPath;

  return {
    filename,
    deleteKey: filename,
    path,
    url: path,
    size,
  };
}

/**
 * @deprecated Mixed shared-storage listing. Dedicated Gallery uses gallery.service.
 * Kept only for internal/debug callers — do not expose publicly.
 */
export async function listGalleryImages(): Promise<GalleryImage[]> {
  const storage = getFileStorage();
  const files = await storage.listGalleryFiles();

  return files.map((file) => ({
    filename: file.filename,
    deleteKey: file.deleteKey,
    url: storage.getPublicUrl(file.url),
    size: file.size,
    createdAt: file.createdAt,
  }));
}

/** Delete a shared catalog upload by filename / provider key. */
export async function deleteGalleryImage(identifier: string) {
  const decoded = decodeURIComponent(identifier.trim());

  if (!decoded) {
    throw ApiError.badRequest("Invalid image identifier");
  }

  // Refuse gallery-namespace keys here — those must go through gallery.service
  if (decoded.startsWith("gallery/") || decoded.includes("/gallery/")) {
    throw ApiError.badRequest(
      "Gallery images must be deleted via the Gallery API",
    );
  }

  if (isLocalUploadProvider()) {
    if (!isAllowedImageFilename(decoded)) {
      throw ApiError.badRequest("Invalid image filename");
    }

    const storage = getFileStorage();
    const filePath = storage.resolveFilePath?.(decoded);

    if (!filePath) {
      throw ApiError.internal("Local storage path resolver unavailable");
    }

    try {
      await fs.access(filePath);
    } catch {
      throw ApiError.notFound("Image not found");
    }
  }

  const storage = getFileStorage();
  await storage.deleteFile(decoded);

  return { filename: decoded, deleteKey: decoded };
}
