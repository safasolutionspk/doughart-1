"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminNotifications } from "@/components/layout/AdminNotificationsProvider";
import { cn } from "@/lib/cn";

export function NewOrderAlerts() {
  const router = useRouter();
  const { counts, loading, markViewed } = useAdminNotifications();
  const [busy, setBusy] = useState<"active" | "custom_cakes" | null>(null);

  if (loading) {
    return null;
  }

  const hasActive = counts.newActiveOrders > 0;
  const hasCustom = counts.newCustomCakeRequests > 0;

  if (!hasActive && !hasCustom) {
    return null;
  }

  async function handleView(group: "active" | "custom_cakes", href: string) {
    setBusy(group);
    try {
      await markViewed(group);
      router.push(href);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {hasActive ? (
        <article className="admin-card flex flex-col gap-3 border-brand-primary/20 bg-gradient-to-br from-white to-brand-pink-lighter/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="admin-eyebrow">New orders</p>
            <p className="mt-1 font-display text-base font-semibold text-brand-brown">
              You have {counts.newActiveOrders} new order
              {counts.newActiveOrders === 1 ? "" : "s"}.
            </p>
          </div>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => handleView("active", "/dashboard/orders")}
            className={cn("admin-btn-primary !h-9 shrink-0", busy === "active" && "opacity-70")}
          >
            {busy === "active" ? "Opening…" : "View orders"}
          </button>
        </article>
      ) : null}

      {hasCustom ? (
        <article className="admin-card flex flex-col gap-3 border-violet-200/80 bg-gradient-to-br from-white to-violet-50/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
              Custom cakes
            </p>
            <p className="mt-1 font-display text-base font-semibold text-brand-brown">
              You have {counts.newCustomCakeRequests} new custom cake request
              {counts.newCustomCakeRequests === 1 ? "" : "s"}.
            </p>
          </div>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() =>
              handleView("custom_cakes", "/dashboard/orders/custom-cakes")
            }
            className={cn(
              "admin-btn-primary !h-9 shrink-0",
              busy === "custom_cakes" && "opacity-70",
            )}
          >
            {busy === "custom_cakes" ? "Opening…" : "View custom cakes"}
          </button>
        </article>
      ) : null}
    </section>
  );
}
