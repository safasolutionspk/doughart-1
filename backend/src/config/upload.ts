import fs from "fs";
import path from "path";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
] as const;

export type AllowedImageExtension = (typeof ALLOWED_IMAGE_EXTENSIONS)[number];

/** Browsers / phones often send these instead of a real image MIME */
export const GENERIC_UPLOAD_MIME_TYPES = [
  "application/octet-stream",
  "binary/octet-stream",
] as const;

export const MIME_TYPE_ALIASES: Record<string, AllowedImageMimeType> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
};

export const EXTENSION_TO_MIME: Record<AllowedImageExtension, AllowedImageMimeType> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

export const MIME_TO_EXTENSION: Record<AllowedImageMimeType, AllowedImageExtension> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

export const UPLOAD_FORMATS_LABEL = "JPG, JPEG, PNG, WebP, GIF, HEIC, HEIF";

/** 5 MB default */
export const UPLOAD_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "images");

export const UPLOAD_PUBLIC_PREFIX = "/uploads/images";

export function ensureUploadDir(): void {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function buildPublicImageUrl(filename: string): string {
  return `${UPLOAD_PUBLIC_PREFIX}/${filename}`;
}

export function resolveUploadFilePath(filename: string): string {
  const safeName = path.basename(filename);
  const resolved = path.resolve(UPLOAD_DIR, safeName);

  if (!resolved.startsWith(UPLOAD_DIR)) {
    throw new Error("Invalid filename");
  }

  return resolved;
}

export function normalizeDeclaredMimeType(mime: string): string {
  const trimmed = mime.trim().toLowerCase();
  return MIME_TYPE_ALIASES[trimmed] ?? trimmed;
}

export function isGenericUploadMimeType(mime: string): boolean {
  const normalized = mime.trim().toLowerCase();
  return (
    normalized === "" ||
    GENERIC_UPLOAD_MIME_TYPES.includes(
      normalized as (typeof GENERIC_UPLOAD_MIME_TYPES)[number],
    )
  );
}

export function getExtensionFromFilename(filename: string): string {
  return path.extname(filename).toLowerCase() as AllowedImageExtension | "";
}

export function isAllowedImageExtension(ext: string): ext is AllowedImageExtension {
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext as AllowedImageExtension);
}

export function isAllowedDeclaredMimeType(mime: string): boolean {
  const normalized = normalizeDeclaredMimeType(mime);
  return ALLOWED_IMAGE_MIME_TYPES.includes(normalized as AllowedImageMimeType);
}

export function mimeTypeFromExtension(ext: string): AllowedImageMimeType | null {
  if (!isAllowedImageExtension(ext)) {
    return null;
  }
  return EXTENSION_TO_MIME[ext];
}

export function extensionFromMimeType(mime: string): AllowedImageExtension | null {
  const normalized = normalizeDeclaredMimeType(mime);
  if (!isAllowedDeclaredMimeType(normalized)) {
    return null;
  }
  return MIME_TO_EXTENSION[normalized as AllowedImageMimeType];
}

/** Legacy multer names without extension: `timestamp-hex` */
export function isExtensionlessUploadBasename(basename: string): boolean {
  const ext = path.extname(basename);
  if (ext && isAllowedImageExtension(ext)) {
    return false;
  }
  return /^\d+-[a-f0-9]+$/i.test(basename);
}

export function isAllowedImageFilename(filename: string): boolean {
  const base = path.basename(filename);
  if (isExtensionlessUploadBasename(base)) {
    return true;
  }
  const ext = path.extname(base).toLowerCase();
  return isAllowedImageExtension(ext);
}

export function isUploadAcceptedByMulter(mimetype: string, originalname: string): boolean {
  if (isAllowedDeclaredMimeType(mimetype)) {
    return true;
  }
  if (isGenericUploadMimeType(mimetype)) {
    return isAllowedImageExtension(getExtensionFromFilename(originalname));
  }
  return false;
}
