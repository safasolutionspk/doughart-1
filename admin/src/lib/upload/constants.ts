export const IMAGE_UPLOAD_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif";

export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const IMAGE_UPLOAD_HINT =
  "JPG, PNG, WebP, GIF, HEIC, or HEIF up to 5MB";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/jpg",
  "image/pjpeg",
  "image/x-png",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
]);

function extensionFromFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export function validateImageUploadFile(file: File): string | null {
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return `Image must be ${IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024)}MB or smaller`;
  }

  const mime = file.type.trim().toLowerCase();
  const ext = extensionFromFilename(file.name);

  if (mime && ALLOWED_MIME_TYPES.has(mime)) {
    return null;
  }

  if (ext && ALLOWED_EXTENSIONS.has(ext)) {
    return null;
  }

  if (
    (mime === "application/octet-stream" || mime === "binary/octet-stream") &&
    ext &&
    ALLOWED_EXTENSIONS.has(ext)
  ) {
    return null;
  }

  return IMAGE_UPLOAD_HINT;
}
