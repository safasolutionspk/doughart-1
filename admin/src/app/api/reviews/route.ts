import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { Review, ReviewListResponse } from "@/lib/reviews/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const path = query ? `/api/reviews?${query}` : "/api/reviews";

  const result = await backendFetch<Review[]>(path);

  if (!result.ok) {
    return respondWithBackendResult(result);
  }

  const pagination = result.meta?.pagination as
    | ReviewListResponse["pagination"]
    | undefined;

  return NextResponse.json({
    success: true,
    data: {
      reviews: result.data ?? [],
      pagination: pagination ?? {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await backendFetch<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return respondWithBackendResult(result, { successStatus: 201 });
}
