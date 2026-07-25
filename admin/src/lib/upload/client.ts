import { adminFetch, parseAdminJson } from "@/lib/api/client";
import { normalizeStoredImagePath } from "@/lib/upload/path";
import type { GalleryImage, UploadedImage } from "./types";

/** Shared catalog upload (products, categories, settings, reviews). */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await adminFetch("/api/uploads/image", {
    method: "POST",
    body: formData,
  });

  const result = await parseAdminJson<UploadedImage>(response);
  const path =
    normalizeStoredImagePath(result.path ?? result.url) ??
    result.url ??
    result.path ??
    "";

  return {
    ...result,
    path,
    url: path,
  };
}

/** Dedicated Gallery list — MongoDB GalleryImage records only. */
export async function fetchGallery(): Promise<GalleryImage[]> {
  const response = await adminFetch("/api/gallery", { cache: "no-store" });
  return parseAdminJson<GalleryImage[]>(response);
}

/** Dedicated Gallery upload — creates a GalleryImage DB record. */
export async function uploadGalleryImage(file: File): Promise<GalleryImage> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await adminFetch("/api/gallery", {
    method: "POST",
    body: formData,
  });

  return parseAdminJson<GalleryImage>(response);
}

/** Delete by Gallery database record ID only. */
export async function deleteGalleryImage(id: string): Promise<void> {
  const response = await adminFetch(`/api/gallery/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await parseAdminJson<{ id: string }>(response);
}
