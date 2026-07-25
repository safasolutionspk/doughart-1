import fs from "fs/promises";
import path from "path";
import type { NextFunction, Request, Response } from "express";
import {
  GALLERY_UPLOAD_DIR,
  UPLOAD_DIR,
  getExtensionFromFilename,
  isAllowedImageExtension,
  isAllowedImageFilename,
  isExtensionlessUploadBasename,
  mimeTypeFromExtension,
} from "../config/upload";
import { detectImageMimeType } from "../utils/imageValidation";

function contentTypeForFilename(filename: string): string | undefined {
  const ext = getExtensionFromFilename(filename);
  if (ext && isAllowedImageExtension(ext)) {
    return mimeTypeFromExtension(ext) ?? undefined;
  }
  return undefined;
}

async function serveFromDir(
  dir: string,
  filename: string,
  res: Response,
  next: NextFunction,
): Promise<boolean> {
  if (!filename || !isAllowedImageFilename(filename)) {
    return false;
  }

  const filePath = path.join(dir, filename);
  if (!filePath.startsWith(dir)) {
    return false;
  }

  try {
    await fs.access(filePath);
  } catch {
    return false;
  }

  let contentType = contentTypeForFilename(filename);

  if (!contentType && isExtensionlessUploadBasename(filename)) {
    const handle = await fs.open(filePath, "r");
    try {
      const buffer = Buffer.alloc(32);
      await handle.read(buffer, 0, 32, 0);
      const detected = detectImageMimeType(buffer);
      if (detected) {
        contentType = detected;
      }
    } finally {
      await handle.close();
    }
  }

  if (contentType) {
    res.type(contentType);
  }

  res.sendFile(filePath, (error) => {
    if (error) {
      next(error);
    }
  });

  return true;
}

export async function serveUploadImages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const filename = path.basename(req.path);
  const served = await serveFromDir(UPLOAD_DIR, filename, res, next);
  if (!served) {
    next();
  }
}

export async function serveGalleryUploadImages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const filename = path.basename(req.path);
  const served = await serveFromDir(GALLERY_UPLOAD_DIR, filename, res, next);
  if (!served) {
    next();
  }
}
