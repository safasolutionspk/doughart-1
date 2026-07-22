import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { Order } from "@/lib/orders/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await backendFetch<Order>(`/api/orders/${id}`);
  return respondWithBackendResult(result);
}
