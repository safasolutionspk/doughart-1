import { adminFetch, parseAdminJson } from "@/lib/api/client";
import type { Review, ReviewListResponse } from "./types";

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchReviews(params?: {
  search?: string;
  isActive?: boolean | "";
  page?: number;
  limit?: number;
}): Promise<ReviewListResponse> {
  const query = buildQuery({
    search: params?.search,
    isActive: params?.isActive === "" ? undefined : params?.isActive,
    page: params?.page,
    limit: params?.limit ?? 20,
  });
  const response = await adminFetch(`/api/reviews${query}`, {
    cache: "no-store",
  });
  return parseAdminJson<ReviewListResponse>(response);
}

export async function fetchReview(id: string): Promise<Review> {
  const response = await adminFetch(`/api/reviews/${id}`, { cache: "no-store" });
  return parseAdminJson<Review>(response);
}

export async function createReview(payload: {
  name: string;
  role?: string;
  rating: number;
  text: string;
  image?: string;
  imageDisplay?: import("@/lib/catalog/types").ImageDisplay | null;
  isActive: boolean;
  sortOrder: number;
}): Promise<Review> {
  const response = await adminFetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseAdminJson<Review>(response);
}

export async function updateReview(
  id: string,
  payload: Partial<{
    name: string;
    role: string;
    rating: number;
    text: string;
    image: string;
    imageDisplay: import("@/lib/catalog/types").ImageDisplay | null;
    isActive: boolean;
    sortOrder: number;
  }>,
): Promise<Review> {
  const response = await adminFetch(`/api/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseAdminJson<Review>(response);
}

export async function deleteReview(id: string): Promise<void> {
  const response = await adminFetch(`/api/reviews/${id}`, { method: "DELETE" });
  await parseAdminJson(response);
}
