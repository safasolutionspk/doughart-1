import { adminFetch, parseAdminJson } from "@/lib/api/client";
import type {
  AdminOrderNotifications,
  MarkOrdersViewedGroup,
} from "@/lib/orders/notifications";

export async function fetchAdminOrderNotifications(): Promise<AdminOrderNotifications> {
  const response = await adminFetch("/api/orders/admin/notifications", {
    cache: "no-store",
  });
  return parseAdminJson<AdminOrderNotifications>(response);
}

export async function markOrdersViewed(
  group: MarkOrdersViewedGroup,
): Promise<AdminOrderNotifications> {
  const response = await adminFetch("/api/orders/admin/mark-viewed", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ group }),
  });
  return parseAdminJson<AdminOrderNotifications>(response);
}
