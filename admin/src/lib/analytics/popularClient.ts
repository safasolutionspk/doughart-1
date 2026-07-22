import { adminFetch, parseAdminJson } from "@/lib/api/client";
import type { PopularCakesListResponse } from "./popularTypes";

export async function fetchPopularCakes(params?: {
  page?: number;
  limit?: number;
}): Promise<PopularCakesListResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params?.page ?? 1));
  searchParams.set("limit", String(params?.limit ?? 20));
  const response = await adminFetch(
    `/api/analytics/popular-cakes?${searchParams.toString()}`,
    { cache: "no-store" },
  );
  return parseAdminJson<PopularCakesListResponse>(response);
}
