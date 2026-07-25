import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { GalleryImage } from "@/lib/upload/types";

/**
 * @deprecated Prefer /api/gallery
 * Compatibility shim — proxies to dedicated Gallery API.
 */
export async function GET() {
  const result = await backendFetch<GalleryImage[]>("/api/gallery");
  return respondWithBackendResult(result);
}
