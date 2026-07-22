import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";

type RouteContext = { params: Promise<{ filename: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  const result = await backendFetch<{ filename: string }>(
    `/api/uploads/image/${encodeURIComponent(filename)}`,
    { method: "DELETE" },
  );
  return respondWithBackendResult(result);
}
