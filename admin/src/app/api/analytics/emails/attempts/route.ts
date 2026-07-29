import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { EmailAttemptRow } from "@/lib/email/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const path = `/api/analytics/emails/attempts${qs ? `?${qs}` : ""}`;

  const result = await backendFetch<EmailAttemptRow[]>(path, {
    cache: "no-store",
  });

  return respondWithBackendResult(result);
}
