import fs from "fs/promises";
import path from "path";
import type { NextFunction, Request, Response } from "express";
import {
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

export async function serveUploadImages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const filename = path.basename(req.path);
  if (!filename || !isAllowedImageFilename(filename)) {
    next();
    return;
  }

  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    await fs.access(filePath);
  } catch {
    next();
    return;
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
}
