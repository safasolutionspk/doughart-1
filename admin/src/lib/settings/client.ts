import { adminFetch, parseAdminJson } from "@/lib/api/client";
import type { BusinessSettings } from "./types";

export async function fetchSettings(): Promise<BusinessSettings> {
  const response = await adminFetch("/api/settings", { cache: "no-store" });
  return parseAdminJson<BusinessSettings>(response);
}

export async function updateSettings(
  payload: Partial<BusinessSettings>,
): Promise<BusinessSettings> {
  const response = await adminFetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseAdminJson<BusinessSettings>(response);
}
