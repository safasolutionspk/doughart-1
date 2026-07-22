import { API_BASE_URL } from "@/lib/api";

const UPLOAD_PREFIX = "/uploads/images";

/** Legacy uploads without file extension */
const EXTENSIONLESS_UPLOAD_PATTERN = /^\/uploads\/images\/\d+-[a-f0-9]+$/i;

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

export function isUploadStoragePath(value: string): boolean {
  const pathname = getPathname(value.trim());
  if (!pathname.startsWith(UPLOAD_PREFIX)) {
    return false;
  }
  const basename = pathname.slice(UPLOAD_PREFIX.length + 1);
  return (
    /^[a-zA-Z0-9._-]+$/.test(basename) &&
    (basename.includes(".") || EXTENSIONLESS_UPLOAD_PATTERN.test(pathname))
  );
}

/**
 * Normalize image values for MongoDB — store `/uploads/images/...` when possible.
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
      if (pathname.startsWith(UPLOAD_PREFIX)) {
        return pathname;
      }
      // CDN URLs (e.g. Cloudinary) — store full URL
      return trimmed;
    } catch {
      return undefined;
    }
  }

  if (trimmed.startsWith(UPLOAD_PREFIX) && isUploadStoragePath(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("uploads/")) {
    const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return isUploadStoragePath(withSlash) ? withSlash : undefined;
  }

  const basename = trimmed.replace(/^\/+/, "");
  if (/^[a-zA-Z0-9._-]+$/.test(basename)) {
    const path = `${UPLOAD_PREFIX}/${basename}`;
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
