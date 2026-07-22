import { backendFetch } from "@/lib/backend/fetch";
import { respondWithBackendResult } from "@/lib/backend/proxy";
import type { BusinessSettings } from "@/lib/settings/types";

export async function GET() {
  const result = await backendFetch<BusinessSettings>("/api/settings");
  return respondWithBackendResult(result);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const result = await backendFetch<BusinessSettings>("/api/settings", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return respondWithBackendResult(result);
}
