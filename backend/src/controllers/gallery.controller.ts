import type { Request, Response } from "express";
import * as galleryService from "../services/gallery.service";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {
  assertValidImageFile,
  removeFileQuietly,
} from "../utils/imageValidation";
import { getValidatedParam } from "../utils/validatedRequest";

async function handleValidatedGalleryUpload(req: Request) {
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

  return galleryService.uploadGalleryImage(req.file);
}

export const listAdminGallery = asyncHandler(
  async (_req: Request, res: Response) => {
    const images = await galleryService.listAdminGalleryImages();
    sendSuccess(res, images, "Gallery images retrieved");
  },
);

export const listPublicGallery = asyncHandler(
  async (_req: Request, res: Response) => {
    const images = await galleryService.listPublicGalleryImages();
    sendSuccess(res, images, "Gallery images retrieved");
  },
);

export const uploadGallery = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await handleValidatedGalleryUpload(req);
    sendSuccess(res, data, "Gallery image uploaded", 201);
  },
);

export const deleteGallery = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await galleryService.deleteGalleryImageById(
      getValidatedParam(req, "id"),
    );
    sendSuccess(res, result, "Gallery image deleted");
  },
);
