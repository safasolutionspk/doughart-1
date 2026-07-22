import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { AdminOrderNotifications } from "@/lib/orders/notifications";

export async function GET() {
  try {
    const result = await backendFetch<AdminOrderNotifications>(
      "/api/orders/admin/notifications",
    );
    if (!result.ok) {
      return respondWithBackendResult(result);
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load notifications";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
