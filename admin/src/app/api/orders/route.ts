import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { ListOrdersResponse, Order } from "@/lib/orders/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const path = query ? `/api/orders?${query}` : "/api/orders";

    const result = await backendFetch<Order[]>(path);

    if (!result.ok) {
      return respondWithBackendResult(result);
    }

    const orders = Array.isArray(result.data) ? result.data : [];
    const pagination = result.meta?.pagination as
      | ListOrdersResponse["pagination"]
      | undefined;

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: pagination ?? {
          page: 1,
          limit: 20,
          total: orders.length,
          totalPages: 1,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load orders";
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] GET /api/orders:", error);
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
