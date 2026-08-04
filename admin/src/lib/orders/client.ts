import { adminFetch, parseAdminJson } from "@/lib/api/client";
import type { ListOrdersResponse, Order, OrderStatus } from "./types";

export async function fetchOrders(params: {
  search?: string;
  status?: OrderStatus | "";
  page?: number;
  limit?: number;
  awaitingQuote?: boolean;
  activeOnly?: boolean;
}): Promise<ListOrdersResponse> {
  const searchParams = new URLSearchParams();
  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }
  if (params.status) {
    searchParams.set("status", params.status);
  }
  if (params.awaitingQuote) {
    searchParams.set("awaitingQuote", "true");
  }
  if (params.activeOnly) {
    searchParams.set("activeOnly", "true");
  }
  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  const response = await adminFetch(
    query ? `/api/orders?${query}` : "/api/orders",
    { cache: "no-store" },
  );

  return parseAdminJson<ListOrdersResponse>(response);
}

export async function fetchOrder(id: string): Promise<Order> {
  const response = await adminFetch(`/api/orders/${id}`, { cache: "no-store" });
  return parseAdminJson<Order>(response);
}

export async function updateOrderStatus(
  id: string,
  payload: {
    status?: OrderStatus;
    adminNotes?: string;
  },
): Promise<Order> {
  const response = await adminFetch(`/api/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseAdminJson<Order>(response);
}

export async function updateOrderQuote(
  id: string,
  payload: { quotedAmount: number; quoteNotes?: string },
): Promise<Order> {
  const response = await adminFetch(`/api/orders/${id}/quote`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseAdminJson<Order>(response);
}
