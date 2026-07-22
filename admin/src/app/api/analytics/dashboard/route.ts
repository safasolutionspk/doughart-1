import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { DashboardAnalytics } from "@/lib/analytics/types";

export async function GET() {
  const result = await backendFetch<DashboardAnalytics>(
    "/api/analytics/dashboard",
    { cache: "no-store" },
  );

  return respondWithBackendResult(result);
}
