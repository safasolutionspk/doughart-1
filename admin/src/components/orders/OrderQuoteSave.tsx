"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { updateOrderQuote } from "@/lib/orders/client";
import type { Order } from "@/lib/orders/types";

type OrderQuoteSaveProps = {
  order: Order;
  onUpdated: (order: Order) => void;
  className?: string;
};

export function OrderQuoteSave({
  order,
  onUpdated,
  className,
}: OrderQuoteSaveProps) {
  const [priceInput, setPriceInput] = useState(
    order.quotedAmount != null && order.quotedAmount > 0
      ? String(order.quotedAmount)
      : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPriceInput(
        order.quotedAmount != null && order.quotedAmount > 0
          ? String(order.quotedAmount)
          : "",
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [order._id, order.quotedAmount]);

  async function handleSave() {
    const amount = Number(priceInput);
    if (Number.isNaN(amount) || amount <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const updated = await updateOrderQuote(order._id, { quotedAmount: amount });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save price");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={`quote-${order._id}`}
        className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-muted"
      >
        Approved Price (Rs)
      </label>
      <div className="flex min-w-0 gap-2">
        <input
          id={`quote-${order._id}`}
          type="number"
          min={1}
          step={1}
          value={priceInput}
          onChange={(event) => setPriceInput(event.target.value)}
          disabled={busy}
          placeholder="e.g. 8500"
          className="admin-input !h-8 min-w-0 flex-1 !py-1 !text-xs"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="admin-btn-primary !h-8 shrink-0 !px-3 !text-[11px] whitespace-nowrap"
        >
          {busy ? "Saving…" : "Save Price"}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-[10px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
