import type { Request, Response } from "express";

import * as galleryService from "../services/gallery.service";
import * as uploadService from "../services/upload.service";

import { ApiError } from "../utils/ApiError";

import { sendSuccess } from "../utils/ApiResponse";

import { asyncHandler } from "../utils/asyncHandler";

import {
  assertValidImageFile,
  removeFileQuietly,
} from "../utils/imageValidation";

async function handleValidatedUpload(req: Request) {
  if (!req.file) {
    throw ApiError.badRequest("Image file is required");
  }

  try {
    await assertValidImageFile(
      req.file.path,
      req.file.mimetype,
      req.file.originalname,
    );
  } catch (error) {
    await removeFileQuietly(req.file.path);
    throw error;
  }

  return uploadService.processUploadedFile(req.file);
}

/** Public upload for custom-cake reference/design images. */
export const uploadPublicReferenceImage = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await handleValidatedUpload(req);
    sendSuccess(res, data, "Image uploaded", 201);
  },
);

/** Shared catalog upload (products, categories, settings, reviews) — NOT Gallery. */
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const data = await handleValidatedUpload(req);
  sendSuccess(res, data, "Image uploaded", 201);
});

/**
 * @deprecated Prefer GET /api/gallery
 * Compatibility shim — dedicated GalleryImage records only (no mixed storage listing).
 */
export const listGallery = asyncHandler(async (_req: Request, res: Response) => {
  const images = await galleryService.listAdminGalleryImages();
  sendSuccess(res, images, "Gallery images retrieved");
});

/**
 * @deprecated Prefer GET /api/gallery/public
 * Compatibility shim — dedicated GalleryImage records only (no mixed storage listing).
 */
export const listPublicGallery = asyncHandler(
  async (_req: Request, res: Response) => {
    const images = await galleryService.listPublicGalleryImages();
    sendSuccess(res, images, "Gallery images retrieved");
  },
);

/** Delete a shared catalog upload by filename / provider key (not Gallery DB records). */
export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const result = await uploadService.deleteGalleryImage(
    String(req.params.filename),
  );
  sendSuccess(res, result, "Image deleted");
});
