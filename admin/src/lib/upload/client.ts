import { adminFetch, parseAdminJson } from "@/lib/api/client";
import { normalizeStoredImagePath } from "@/lib/upload/path";
import type { GalleryImage, UploadedImage } from "./types";

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

export async function fetchGallery(): Promise<GalleryImage[]> {
  const response = await adminFetch("/api/uploads/gallery", { cache: "no-store" });
  return parseAdminJson<GalleryImage[]>(response);
}

export async function deleteGalleryImage(identifier: string): Promise<void> {
  const response = await adminFetch(
    `/api/uploads/image/${encodeURIComponent(identifier)}`,
    { method: "DELETE" },
  );
  await parseAdminJson<{ filename: string }>(response);
}
