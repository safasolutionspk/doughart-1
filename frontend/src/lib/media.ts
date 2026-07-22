import { siteImages } from "@/lib/images";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

const UPLOAD_PREFIX = "/uploads/images";

/** Legacy uploads without file extension */
const EXTENSIONLESS_UPLOAD_PATTERN = /^\/uploads\/images\/\d+-[a-f0-9]+$/i;

const categoryFallbacks: Record<string, string> = {
  birthday: siteImages.categories.birthday,
  wedding: siteImages.categories.wedding,
  kids: siteImages.categories.kids,
  anniversary: siteImages.categories.anniversary,
  all: siteImages.categories.all,
};

const DEFAULT_FALLBACK_IMAGE = siteImages.categories.all;

function normalizeStoredImagePath(
  value: string | undefined | null,
): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const { pathname } = new URL(trimmed);
      if (pathname.startsWith(UPLOAD_PREFIX)) {
        return pathname;
      }
      // CDN URLs (e.g. Cloudinary) — use full URL
      return trimmed;
    } catch {
      return undefined;
    }
  }

  if (trimmed.startsWith(UPLOAD_PREFIX) && isUploadStoragePath(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("uploads/")) {
    const withSlash = `/${trimmed}`;
    return isUploadStoragePath(withSlash) ? withSlash : undefined;
  }

  return undefined;
}

/**
 * Resolve catalog/upload image paths for Next.js Image.
 * - `/uploads/...` → backend API origin
 * - `/images/...` and other site paths → local public assets
 * - `http(s)://` → as-is
 */
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

export function resolveImageSrc(path?: string | null): string | undefined {
  if (!path?.trim()) {
    return undefined;
  }

  const trimmed = path.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const pathname = getPathname(trimmed);
  const stored = normalizeStoredImagePath(trimmed) ?? pathname;

  if (stored.startsWith(UPLOAD_PREFIX) || stored.startsWith(`uploads/`)) {
    const uploadPath = stored.startsWith("/") ? stored : `/${stored}`;
    const basename = uploadPath.slice(UPLOAD_PREFIX.length + 1);
    if (basename && !basename.includes("..") && !basename.includes("/")) {
      return `${API_BASE_URL}${uploadPath.split("?")[0]}`;
    }
  }

  if (isUploadStoragePath(stored)) {
    return `${API_BASE_URL}${stored}`;
  }

  if (pathname.startsWith("/images") || pathname.startsWith("/")) {
    return pathname;
  }

  return undefined;
}

export function hasCatalogImage(image?: string | null): boolean {
  if (!image?.trim()) {
    return false;
  }
  return isUploadStoragePath(image) || Boolean(normalizeStoredImagePath(image));
}

export function getCategoryFallbackImage(slug: string): string {
  return categoryFallbacks[slug] ?? DEFAULT_FALLBACK_IMAGE;
}

export function isBackendUploadImageUrl(src: string): boolean {
  const trimmed = src.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed.startsWith(`${API_BASE_URL}/uploads/`)) {
    return true;
  }
  return isUploadStoragePath(trimmed);
}

/**
 * Resolve catalog/cake image from API for display.
 * Returns null when empty or unresolvable.
 */
export function resolveCakeApiImage(image?: string | null): string | null {
  const stored = image?.trim();
  if (!stored) {
    return null;
  }

  if (stored.startsWith("http://") || stored.startsWith("https://")) {
    return stored;
  }

  const resolved = resolveImageSrc(stored);
  if (resolved) {
    return resolved;
  }

  const normalized = stored.startsWith("/") ? stored : `/${stored}`;

  if (normalized.startsWith(UPLOAD_PREFIX)) {
    const basename = normalized.slice(UPLOAD_PREFIX.length + 1);
    if (basename && !basename.includes("..") && !basename.includes("/")) {
      return `${API_BASE_URL}${normalized.split("?")[0]}`;
    }
  }

  if (normalized.startsWith("/images")) {
    return normalized;
  }

  return null;
}

/** @alias resolveCakeApiImage */
export function resolveCategoryApiImage(
  image: string | undefined | null,
): string | undefined {
  return resolveCakeApiImage(image) ?? undefined;
}

export type CatalogImageSources = {
  /** Resolved API upload URL when cake/category.image is set */
  apiImage?: string;
  /** Per-slug fallback when API image is missing or fails to load */
  fallback: string;
};

/** Display URLs: API image when set, otherwise per-slug fallback only */
export function getCatalogImageDisplay(
  image: string | undefined | null,
  fallbackSlug: string,
): CatalogImageSources {
  const fallback = getCategoryFallbackImage(fallbackSlug);
  const apiImage = resolveCakeApiImage(image);

  if (apiImage) {
    return { apiImage, fallback };
  }

  return { fallback };
}

export function getCakeImageSrc(
  image: string | undefined | null,
  categorySlug: string,
): CatalogImageSources {
  return getCatalogImageDisplay(image, categorySlug);
}

/** @deprecated Use resolveImageSrc */
export function resolveUploadImageUrl(path?: string | null): string | undefined {
  return resolveImageSrc(path);
}

export function getDefaultFallbackImage(): string {
  return DEFAULT_FALLBACK_IMAGE;
}
