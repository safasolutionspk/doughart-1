import { UPLOAD_PUBLIC_PREFIX } from "../config/upload";

/**
 * Normalize image values for MongoDB.
 * - Local uploads: `/uploads/images/...`
 * - API-hosted full URLs pointing at `/uploads/images/...` → relative path
 * - External CDN URLs (e.g. Cloudinary): store full HTTPS URL as-is
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
      if (pathname.startsWith(UPLOAD_PUBLIC_PREFIX)) {
        return pathname;
      }
      // Cloudinary and other CDN assets — keep full URL
      return trimmed;
    } catch {
      return undefined;
    }
  }

  if (trimmed.startsWith(UPLOAD_PUBLIC_PREFIX)) {
    return trimmed;
  }

  if (trimmed.startsWith("uploads/")) {
    const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    if (withSlash.startsWith(UPLOAD_PUBLIC_PREFIX)) {
      return withSlash;
    }
  }

  const basename = trimmed.replace(/^\/+/, "");
  if (/^[a-zA-Z0-9._-]+$/.test(basename)) {
    return `${UPLOAD_PUBLIC_PREFIX}/${basename}`;
  }

  return undefined;
}
