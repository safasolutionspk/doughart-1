import { API_BASE_URL } from "@/lib/api";

const CATALOG_UPLOAD_PREFIX = "/uploads/images";
const GALLERY_UPLOAD_PREFIX = "/uploads/gallery";

/** Legacy uploads without file extension */
const EXTENSIONLESS_CATALOG_PATTERN = /^\/uploads\/images\/\d+-[a-f0-9]+$/i;
const EXTENSIONLESS_GALLERY_PATTERN = /^\/uploads\/gallery\/\d+-[a-f0-9]+$/i;

function getPathname(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      return new URL(value).pathname;
    } catch {
      return value;
    }
  }
  return value.startsWith("/") ? value : `/${value}`;
}

function isSafeUploadBasename(basename: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(basename);
}

export function isUploadStoragePath(value: string): boolean {
  const pathname = getPathname(value.trim());

  if (pathname.startsWith(CATALOG_UPLOAD_PREFIX)) {
    const basename = pathname.slice(CATALOG_UPLOAD_PREFIX.length + 1);
    return (
      isSafeUploadBasename(basename) &&
      (basename.includes(".") || EXTENSIONLESS_CATALOG_PATTERN.test(pathname))
    );
  }

  if (pathname.startsWith(GALLERY_UPLOAD_PREFIX)) {
    const basename = pathname.slice(GALLERY_UPLOAD_PREFIX.length + 1);
    return (
      isSafeUploadBasename(basename) &&
      (basename.includes(".") || EXTENSIONLESS_GALLERY_PATTERN.test(pathname))
    );
  }

  return false;
}

/**
 * Normalize image values for MongoDB — store `/uploads/images/...` or
 * `/uploads/gallery/...` when possible.
 */
export function normalizeStoredImagePath(
  value: string | undefined | null,
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const { pathname } = new URL(trimmed);
      if (
        pathname.startsWith(CATALOG_UPLOAD_PREFIX) ||
        pathname.startsWith(GALLERY_UPLOAD_PREFIX)
      ) {
        return pathname;
      }
      // CDN URLs (e.g. Cloudinary) — store full URL
      return trimmed;
    } catch {
      return undefined;
    }
  }

  if (
    (trimmed.startsWith(CATALOG_UPLOAD_PREFIX) ||
      trimmed.startsWith(GALLERY_UPLOAD_PREFIX)) &&
    isUploadStoragePath(trimmed)
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("uploads/")) {
    const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return isUploadStoragePath(withSlash) ? withSlash : undefined;
  }

  const basename = trimmed.replace(/^\/+/, "");
  if (isSafeUploadBasename(basename)) {
    const path = `${CATALOG_UPLOAD_PREFIX}/${basename}`;
    return isUploadStoragePath(path) ? path : undefined;
  }

  return undefined;
}

export function hasStoredImage(image?: string | null): boolean {
  if (!image?.trim()) {
    return false;
  }
  return isUploadStoragePath(image) || Boolean(normalizeStoredImagePath(image));
}

/** Resolve stored paths to absolute URLs for previews. */
export function resolveImageSrc(
  path?: string | null,
  cacheKey?: number | string,
): string {
  if (!path?.trim()) {
    return "";
  }

  const trimmed = path.trim();
  let resolved: string;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    resolved = trimmed;
  } else {
    const pathname = getPathname(trimmed);
    const stored = normalizeStoredImagePath(trimmed) ?? pathname;

    if (isUploadStoragePath(stored)) {
      resolved = `${API_BASE_URL}${stored}`;
    } else if (pathname.startsWith("/")) {
      resolved = pathname;
    } else {
      return "";
    }
  }

  if (cacheKey === undefined || cacheKey === "") {
    return resolved;
  }

  const separator = resolved.includes("?") ? "&" : "?";
  return `${resolved}${separator}v=${encodeURIComponent(String(cacheKey))}`;
}
