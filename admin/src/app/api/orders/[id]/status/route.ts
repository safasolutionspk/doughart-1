import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { Order, OrderStatus } from "@/lib/orders/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    status?: OrderStatus;
    adminNotes?: string;
  };

  const result = await backendFetch<Order>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: body.status,
      adminNotes: body.adminNotes,
    }),
  });

  return respondWithBackendResult(result);
}
