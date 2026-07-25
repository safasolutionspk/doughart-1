import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await backendFetch<{ id: string }>(
    `/api/gallery/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  return respondWithBackendResult(result);
}
