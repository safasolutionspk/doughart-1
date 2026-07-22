import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { Category, CategoryListResponse } from "@/lib/catalog/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const path = query ? `/api/categories?${query}` : "/api/categories";

    const result = await backendFetch<Category[]>(path);

    if (!result.ok) {
      return respondWithBackendResult(result);
    }

    const categories = Array.isArray(result.data) ? result.data : [];
    const pagination = result.meta?.pagination as
      | CategoryListResponse["pagination"]
      | undefined;

    return NextResponse.json({
      success: true,
      data: {
        categories,
        pagination: pagination ?? {
          page: 1,
          limit: 20,
          total: categories.length,
          totalPages: 1,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load categories";
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] GET /api/categories:", error);
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await backendFetch<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return respondWithBackendResult(result, { successStatus: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create category";
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] POST /api/categories:", error);
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
