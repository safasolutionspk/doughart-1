"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { updateOrderStatus } from "@/lib/orders/client";
import { ORDER_STATUS_SELECT_OPTIONS } from "@/lib/orders/format";
import type { Order, OrderStatus } from "@/lib/orders/types";

type OrderStatusSelectProps = {
  order: Order;
  onUpdated: (order: Order) => void;
  className?: string;
};

export function OrderStatusSelect({
  order,
  onUpdated,
  className,
}: OrderStatusSelectProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(nextStatus: OrderStatus) {
    if (nextStatus === order.status) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(order._id, { status: nextStatus });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={`status-${order._id}`}
        className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-muted"
      >
        Status
      </label>
      <select
        id={`status-${order._id}`}
        value={order.status}
        disabled={busy}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className={cn(
          "admin-input !h-8 w-full !py-1 !text-xs",
          busy && "opacity-60",
        )}
      >
        {ORDER_STATUS_SELECT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-[10px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
