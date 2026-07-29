import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { EmailAnalyticsSummary } from "@/lib/email/types";

export async function GET() {
  const result = await backendFetch<EmailAnalyticsSummary>(
    "/api/analytics/emails/summary",
    { cache: "no-store" },
  );

  return respondWithBackendResult(result);
}
