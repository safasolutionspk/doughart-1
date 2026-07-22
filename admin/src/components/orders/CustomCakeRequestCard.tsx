"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomCakeDetailsGrid } from "@/components/orders/CustomCakeDetailsGrid";
import { CustomCakeOrderSummary } from "@/components/orders/CustomCakeOrderSummary";
import { OrderNumberBadge } from "@/components/orders/OrderNumberBadge";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ReferenceImageThumbnail } from "@/components/orders/ReferenceImagePreview";
import {
  dashOr,
  resolveCustomCakeReferenceImage,
} from "@/lib/orders/customCake";
import { updateOrderQuote, updateOrderStatus } from "@/lib/orders/client";
import { formatCurrency } from "@/lib/orders/format";
import type { Order } from "@/lib/orders/types";

type CustomCakeRequestCardProps = {
  order: Order;
  onUpdated: (order: Order) => void;
};

export function CustomCakeRequestCard({
  order,
  onUpdated,
}: CustomCakeRequestCardProps) {
  const referenceImage = resolveCustomCakeReferenceImage(order);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [priceInput, setPriceInput] = useState(
    order.quotedAmount != null && order.quotedAmount > 0
      ? String(order.quotedAmount)
      : "",
  );
  const [busy, setBusy] = useState<"approve" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isApproved =
    order.quotedAmount != null && order.quotedAmount > 0 && order.status !== "cancelled";
  const isCancelled = order.status === "cancelled";

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

  async function handleSavePrice() {
    const amount = Number(priceInput);
    if (Number.isNaN(amount) || amount <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    setBusy("approve");
    setError(null);
    try {
      const updated = await updateOrderQuote(order._id, {
        quotedAmount: amount,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save price");
    } finally {
      setBusy(null);
    }
  }

  async function handleCancel() {
    if (!window.confirm(`Cancel custom cake request for ${order.customerName}?`)) {
      return;
    }

    setBusy("cancel");
    setError(null);
    try {
      const updated = await updateOrderStatus(order._id, { status: "cancelled" });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel request");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-border/70 bg-white shadow-sm">
      <div className="border-b border-brand-border/50 bg-gradient-to-r from-brand-pink-lighter/50 to-white px-3 py-3 sm:px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold text-brand-brown sm:text-base">
              {order.customerName}
            </p>
            <p className="text-xs text-brand-muted">{order.customerPhone}</p>
            <p className="mt-1 line-clamp-2 text-xs text-brand-muted">
              {dashOr(order.deliveryAddress)}
            </p>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <ReferenceImageThumbnail
              source={referenceImage}
              sizeClassName="h-12 w-12 sm:h-14 sm:w-14"
            />
            <div className="flex flex-col items-end gap-1">
              <OrderStatusBadge status={order.status} />
              {isApproved ? (
                <span className="text-xs font-semibold text-emerald-700">
                  {formatCurrency(order.quotedAmount!)}
                </span>
              ) : isCancelled ? (
                <span className="text-xs font-semibold text-red-600">Cancelled</span>
              ) : (
                <span className="text-xs font-semibold text-amber-700">Awaiting price</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2.5 border-t border-brand-border/40 pt-2">
          <CustomCakeOrderSummary order={order} customerFields="none" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex w-full items-center justify-between py-1.5 text-left text-xs font-semibold text-brand-primary hover:underline"
        >
          {detailsOpen ? "Hide full details" : "Show full details"}
          <span aria-hidden className="text-brand-muted">
            {detailsOpen ? "▲" : "▼"}
          </span>
        </button>

        {detailsOpen ? (
          <div className="space-y-3 border-t border-brand-border/40 pb-2 pt-2">
            <CustomCakeDetailsGrid order={order} />
            <OrderNumberBadge orderNumber={order.orderNumber} className="mt-1" />
          </div>
        ) : null}

        {error ? (
          <p className="py-1 text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {!isCancelled ? (
          <div className="mt-auto space-y-2 border-t border-brand-border/50 py-3">
            {!isApproved ? (
              <div>
                <label htmlFor={`price-${order._id}`} className="admin-label !text-[10px]">
                  Approved Price (Rs)
                </label>
                <input
                  id={`price-${order._id}`}
                  type="number"
                  min={1}
                  step={1}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="admin-input !h-9 !text-sm"
                  placeholder="e.g. 8500"
                  disabled={busy !== null}
                />
              </div>
            ) : (
              <p className="text-xs text-brand-muted">
                Approved at {formatCurrency(order.quotedAmount!)}. Update price below
                if needed.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSavePrice}
                disabled={busy !== null}
                className="admin-btn-primary !h-8 !px-3 !text-xs"
              >
                {busy === "approve" ? "Saving…" : "Save Price"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={busy !== null}
                className="inline-flex h-8 items-center justify-center rounded-full border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {busy === "cancel" ? "…" : "Cancel"}
              </button>
              <Link
                href={`/dashboard/orders/${order._id}`}
                className="admin-btn-secondary !h-8 !px-3 !text-xs"
              >
                Details
              </Link>
            </div>
          </div>
        ) : (
          <div className="border-t border-brand-border/50 py-3">
            <Link
              href={`/dashboard/orders/${order._id}`}
              className="admin-btn-secondary !h-8 !px-3 !text-xs"
            >
              View order
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
