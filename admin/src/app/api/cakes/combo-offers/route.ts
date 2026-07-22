import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { Cake, CakeListResponse } from "@/lib/catalog/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const path = query
      ? `/api/cakes/combo-offers?${query}`
      : "/api/cakes/combo-offers";

    const result = await backendFetch<Cake[]>(path);

    if (!result.ok) {
      return respondWithBackendResult(result);
    }

    const cakes = Array.isArray(result.data) ? result.data : [];
    const pagination = result.meta?.pagination as
      | CakeListResponse["pagination"]
      | undefined;

    return NextResponse.json({
      success: true,
      data: {
        cakes,
        pagination: pagination ?? {
          page: 1,
          limit: 20,
          total: cakes.length,
          totalPages: 1,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load combo offers";
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] GET /api/cakes/combo-offers:", error);
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await backendFetch<Cake>("/api/cakes/combo-offers", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return respondWithBackendResult(result, { successStatus: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create combo offer";
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] POST /api/cakes/combo-offers:", error);
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
