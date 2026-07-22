import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { Category } from "@/lib/catalog/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await backendFetch<Category>(`/api/categories/${id}`);
  return respondWithBackendResult(result);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const result = await backendFetch<Category>(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return respondWithBackendResult(result);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await backendFetch<{ id: string }>(`/api/categories/${id}`, {
    method: "DELETE",
  });
  return respondWithBackendResult(result);
}
