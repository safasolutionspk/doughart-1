import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { GalleryImage } from "@/lib/upload/types";

export async function GET() {
  const result = await backendFetch<GalleryImage[]>("/api/uploads/gallery");
  return respondWithBackendResult(result);
}
