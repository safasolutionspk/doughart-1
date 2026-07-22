"use client";

import { formatCurrency } from "@/lib/orders/format";
import type { Order } from "@/lib/orders/types";

type OrderQuoteReadOnlyProps = {
  order: Order;
  className?: string;
};

export function OrderQuoteReadOnly({ order, className }: OrderQuoteReadOnlyProps) {
  const amount =
    order.quotedAmount != null && order.quotedAmount > 0
      ? order.quotedAmount
      : null;

  if (amount == null) {
    return (
      <p className={className}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
          Final / Approved
        </span>
        <span className="mt-0.5 block text-xs font-medium text-brand-muted">
          No approved price set
        </span>
      </p>
    );
  }

  return (
    <p className={className}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
        Final / Approved
      </span>
      <span className="mt-0.5 block text-xs font-semibold text-brand-brown">
        {formatCurrency(amount)}
      </span>
    </p>
  );
}
