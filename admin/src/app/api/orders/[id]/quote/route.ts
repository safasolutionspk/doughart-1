import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { Order } from "@/lib/orders/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    quotedAmount?: number;
    quoteNotes?: string;
  };

  const result = await backendFetch<Order>(`/api/orders/${id}/quote`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return respondWithBackendResult(result);
}
