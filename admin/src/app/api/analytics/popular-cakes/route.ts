import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type {
  AdminPopularCakeRow,
  PopularCakesListResponse,
} from "@/lib/analytics/popularTypes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const path = query
      ? `/api/analytics/popular-cakes?${query}`
      : "/api/analytics/popular-cakes";

    const result = await backendFetch<AdminPopularCakeRow[]>(path);

    if (!result.ok) {
      return respondWithBackendResult(result);
    }

    const rows = Array.isArray(result.data) ? result.data : [];
    const pagination = result.meta?.pagination as
      | PopularCakesListResponse["pagination"]
      | undefined;

    return NextResponse.json({
      success: true,
      data: {
        rows,
        pagination: pagination ?? {
          page: 1,
          limit: 20,
          total: rows.length,
          totalPages: 1,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load popular cakes";
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] GET /api/analytics/popular-cakes:", error);
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
