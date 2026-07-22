import fs from "fs/promises";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  UPLOAD_FORMATS_LABEL,
  UPLOAD_MAX_FILE_SIZE,
  type AllowedImageMimeType,
  extensionFromMimeType,
  getExtensionFromFilename,
  isAllowedDeclaredMimeType,
  isAllowedImageExtension,
  isGenericUploadMimeType,
  mimeTypeFromExtension,
  normalizeDeclaredMimeType,
} from "../config/upload";
import { ApiError } from "./ApiError";

const UNSUPPORTED_IMAGE_MESSAGE = `Unsupported image type. Allowed formats: ${UPLOAD_FORMATS_LABEL} (max ${UPLOAD_MAX_FILE_SIZE / (1024 * 1024)}MB).`;

function matchesSignature(buffer: Buffer, signature: number[], offset = 0): boolean {
  if (buffer.length < offset + signature.length) {
    return false;
  }

  return signature.every((byte, index) => buffer[offset + index] === byte);
}

function detectHeifFamilyMimeType(buffer: Buffer): AllowedImageMimeType | null {
  if (buffer.length < 12) {
    return null;
  }

  if (buffer.toString("ascii", 4, 8) !== "ftyp") {
    return null;
  }

  const brand = buffer.toString("ascii", 8, 12);
  const heicBrands = ["heic", "heix", "hevc", "heis", "heim"];
  const heifBrands = ["mif1", "msf1", "heif"];

  if (heicBrands.includes(brand)) {
    return "image/heic";
  }

  if (heifBrands.includes(brand)) {
    return "image/heif";
  }

  return null;
}

export function detectImageMimeType(buffer: Buffer): AllowedImageMimeType | null {
  if (matchesSignature(buffer, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (matchesSignature(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  if (
    matchesSignature(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    matchesSignature(buffer, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }

  if (
    matchesSignature(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    matchesSignature(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return "image/gif";
  }

  const heifFamily = detectHeifFamilyMimeType(buffer);
  if (heifFamily) {
    return heifFamily;
  }

  return null;
}

function extensionMatchesMime(ext: string, mime: AllowedImageMimeType): boolean {
  const expected = extensionFromMimeType(mime);
  if (!expected) {
    return false;
  }
  if (ext === expected) {
    return true;
  }
  if (mime === "image/jpeg" && (ext === ".jpg" || ext === ".jpeg")) {
    return true;
  }
  return false;
}

export async function assertValidImageFile(
  filePath: string,
  declaredMimeType: string,
  originalFilename: string,
): Promise<void> {
  const handle = await fs.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(32);
    await handle.read(buffer, 0, 32, 0);

    const detected = detectImageMimeType(buffer);
    if (detected) {
      return;
    }

    const ext = getExtensionFromFilename(originalFilename);
    const normalizedDeclared = normalizeDeclaredMimeType(declaredMimeType);

    if (isGenericUploadMimeType(declaredMimeType)) {
      if (isAllowedImageExtension(ext)) {
        return;
      }
      throw ApiError.badRequest(UNSUPPORTED_IMAGE_MESSAGE);
    }

    if (isAllowedDeclaredMimeType(normalizedDeclared) && isAllowedImageExtension(ext)) {
      const mimeFromExt = mimeTypeFromExtension(ext);
      if (
        mimeFromExt &&
        (normalizedDeclared === mimeFromExt ||
          extensionMatchesMime(ext, normalizedDeclared as AllowedImageMimeType))
      ) {
        return;
      }
    }

    throw ApiError.badRequest(
      "Could not verify image content. Use a valid JPG, PNG, WebP, GIF, HEIC, or HEIF file.",
    );
  } finally {
    await handle.close();
  }
}

export async function removeFileQuietly(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore cleanup errors
  }
}

export function unsupportedImageTypeMessage(): string {
  return `Only ${UPLOAD_FORMATS_LABEL} images are allowed (max ${UPLOAD_MAX_FILE_SIZE / (1024 * 1024)}MB).`;
}

export const ALLOWED_EXTENSIONS_PATTERN = ALLOWED_IMAGE_EXTENSIONS.map((ext) =>
  ext.replace(".", ""),
).join("|");
