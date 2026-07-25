import { contactInfo } from "@/lib/contact";
import { siteImages } from "@/lib/images";
import { resolveImageSrc } from "@/lib/media";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

export const galleryCopy = {
  subtitle: "Follow Us On Instagram",
  heading: "A Little Happiness In Every Slice",
  instagramLabel: "Follow on Instagram",
  instagramHref: contactInfo.social.instagram,
} as const;

export type GalleryDisplayImage = {
  id: string;
  alt: string;
  src: string;
  createdAt?: string;
};

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiFailure = {
  success: false;
  message: string;
};

type PublicGalleryApiItem = {
  filename: string;
  url: string;
  size?: number;
  createdAt: string;
};

/**
 * Static fallback used only when the public gallery API is unreachable
 * or returns no uploads yet. Prefer Admin-uploaded images whenever present.
 */
export const staticGalleryFallback: GalleryDisplayImage[] = [
  {
    id: "gallery-1",
    alt: "Elegant wedding tiered cake",
    src: siteImages.gallery[0],
  },
  {
    id: "gallery-2",
    alt: "Colourful birthday cake with candles",
    src: siteImages.gallery[1],
  },
  {
    id: "gallery-3",
    alt: "Beautiful custom decorated cake",
    src: siteImages.gallery[2],
  },
  {
    id: "gallery-4",
    alt: "Romantic anniversary cake",
    src: siteImages.gallery[3],
  },
  {
    id: "gallery-5",
    alt: "Assorted custom cake collection",
    src: siteImages.gallery[4],
  },
];

/** @deprecated Prefer fetchPublicGalleryImages — kept for any legacy imports. */
export const galleryImages = staticGalleryFallback;

function toDisplayImage(item: PublicGalleryApiItem): GalleryDisplayImage | null {
  const resolved =
    resolveImageSrc(item.url) ??
    (item.url.startsWith("http://") || item.url.startsWith("https://")
      ? item.url
      : item.url.startsWith("/")
        ? `${API_BASE_URL}${item.url}`
        : undefined);

  if (!resolved) {
    return null;
  }

  return {
    id: item.filename,
    alt: "DoughArt custom cake gallery photo",
    src: resolved,
    createdAt: item.createdAt,
  };
}

/**
 * Fetches every non-deleted Admin gallery upload for the public `/gallery` page.
 * Ordering matches the backend (newest first). No pagination truncation.
 */
export async function fetchPublicGalleryImages(): Promise<GalleryDisplayImage[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/uploads/public/gallery`, {
      next: { revalidate: 60 },
    });

    let body: ApiSuccess<PublicGalleryApiItem[]> | ApiFailure;
    try {
      body = (await response.json()) as
        | ApiSuccess<PublicGalleryApiItem[]>
        | ApiFailure;
    } catch {
      return [];
    }

    if (!response.ok || !body.success || !Array.isArray(body.data)) {
      return [];
    }

    const seen = new Set<string>();
    const images: GalleryDisplayImage[] = [];

    for (const item of body.data) {
      const display = toDisplayImage(item);
      if (!display || seen.has(display.id)) {
        continue;
      }
      seen.add(display.id);
      images.push(display);
    }

    return images;
  } catch {
    return [];
  }
}
