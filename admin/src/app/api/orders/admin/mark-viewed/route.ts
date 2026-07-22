import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { AdminOrderNotifications } from "@/lib/orders/notifications";

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { group?: string };
    const result = await backendFetch<AdminOrderNotifications>(
      "/api/orders/admin/mark-viewed",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!result.ok) {
      return respondWithBackendResult(result);
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark orders viewed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
