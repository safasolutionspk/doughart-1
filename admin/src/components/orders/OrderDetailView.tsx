"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderNumberBadge } from "@/components/orders/OrderNumberBadge";
import { OrderQuoteReadOnly } from "@/components/orders/OrderQuoteReadOnly";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { CustomCakeDetailsGrid } from "@/components/orders/CustomCakeDetailsGrid";
import { ReferenceImageThumbnail } from "@/components/orders/ReferenceImagePreview";
import {
  canEditCustomCakePrice,
  isAwaitingQuote,
  isCustomCakeOrder,
  resolveCustomCakeReferenceImage,
} from "@/lib/orders/customCake";
import { cn } from "@/lib/cn";
import {
  fetchOrder,
  updateOrderQuote,
  updateOrderStatus,
} from "@/lib/orders/client";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatOrderStatus,
  formatPaymentMethod,
} from "@/lib/orders/format";
import {
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
} from "@/lib/orders/types";

type DetailState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; order: Order };

export function OrderDetailView({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [state, setState] = useState<DetailState>({ type: "loading" });
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [quotedAmount, setQuotedAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ type: "loading" });
      try {
        const order = await fetchOrder(orderId);
        if (cancelled) return;
        setStatus(order.status);
        setAdminNotes(order.adminNotes ?? "");
        setQuotedAmount(
          order.quotedAmount != null ? String(order.quotedAmount) : "",
        );
        setState({ type: "success", order });
      } catch (error) {
        if (cancelled) return;
        setState({
          type: "error",
          message:
            error instanceof Error ? error.message : "Failed to load order",
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function handleStatusSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.type !== "success") return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updated = await updateOrderStatus(orderId, {
        status,
        adminNotes: adminNotes.trim() || undefined,
      });
      setState({ type: "success", order: updated });
      setSaveSuccess(true);
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to update order",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleQuoteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.type !== "success") return;

    const amount = Number(quotedAmount);
    if (Number.isNaN(amount) || amount < 0) {
      setSaveError("Enter a valid quoted amount.");
      return;
    }

    setIsSavingQuote(true);
    setSaveError(null);
    setQuoteSuccess(false);

    try {
      const updated = await updateOrderQuote(orderId, {
        quotedAmount: amount,
      });
      setQuotedAmount(
        updated.quotedAmount != null ? String(updated.quotedAmount) : "",
      );
      setState({ type: "success", order: updated });
      setQuoteSuccess(true);
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save quote",
      );
    } finally {
      setIsSavingQuote(false);
    }
  }

  if (state.type === "loading") {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-brand-pink-lighter" />
        <div className="admin-card h-40 animate-pulse" />
      </div>
    );
  }

  if (state.type === "error") {
    return (
      <div className="admin-card text-center text-sm text-red-700" role="alert">
        {state.message}
      </div>
    );
  }

  const { order } = state;
  const finalAmount =
    order.quotedAmount != null && order.quotedAmount > 0
      ? order.quotedAmount
      : order.totalAmount;
  const customCake = isCustomCakeOrder(order);
  const editableCustomPrice = canEditCustomCakePrice(order);
  const referenceImage = customCake ? resolveCustomCakeReferenceImage(order) : "";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={
            customCake && isAwaitingQuote(order) && order.status !== "cancelled"
              ? "/dashboard/orders/custom-cakes"
              : "/dashboard/orders"
          }
          className="text-sm font-medium text-brand-primary hover:underline"
        >
          ← Back to orders
        </Link>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <OrderNumberBadge orderNumber={order.orderNumber} />
            <h1 className="mt-2 font-display text-xl font-bold text-brand-brown sm:text-2xl">
              {order.customerName}
            </h1>
            <p className="mt-1 text-sm text-brand-muted">{order.cakeType}</p>
          </div>
          <div className="flex flex-wrap items-start gap-3">
            {customCake ? (
              <ReferenceImageThumbnail
                source={referenceImage}
                sizeClassName="h-16 w-16 sm:h-20 sm:w-20"
              />
            ) : null}
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>
      </div>

      <section className="admin-card">
        <h2 className="admin-eyebrow">Order details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Detail
            label="Account"
            value={
              order.isRegisteredCustomer
                ? "Registered customer"
                : "Guest checkout"
            }
          />
          <Detail label="Phone" value={order.customerPhone} />
          <Detail label="Email" value={order.customerEmail} />
          <Detail label="Address" value={order.deliveryAddress ?? "—"} />
          <Detail label="List price" value={formatCurrency(order.totalAmount)} />
          <Detail
            label="Final / approved"
            value={formatCurrency(finalAmount)}
            highlight
          />
          <Detail
            label="Payment"
            value={formatPaymentMethod(order.paymentMethod ?? "cash_on_delivery")}
          />
          <Detail label="Delivery" value={formatDate(order.eventDate)} />
          <Detail label="Created" value={formatDateTime(order.createdAt)} />
        </dl>
        {order.items.length > 0 ? (
          <div className="mt-4 border-t border-brand-border/50 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
              Line items
            </p>
            <ul className="mt-2 space-y-1 text-sm text-brand-brown">
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.quantity}× {item.cakeName}
                  {item.unitPrice > 0
                    ? ` — ${formatCurrency(item.unitPrice * item.quantity)}`
                    : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {customCake ? (
        <section className="admin-card border-violet-100 bg-gradient-to-br from-white to-violet-50/30">
          <h2 className="font-display text-base font-semibold text-brand-brown">
            Custom cake request
          </h2>
          <div className="mt-4">
            <CustomCakeDetailsGrid order={order} />
          </div>
        </section>
      ) : null}

      {customCake && editableCustomPrice ? (
        <section className="admin-card">
          <h2 className="font-display text-base font-semibold text-brand-brown">
            Approve price
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Set the approved price the customer sees on My Order and their
            account. Saving confirms the order when status is pending.
          </p>
          <form onSubmit={handleQuoteSubmit} className="mt-4 grid max-w-lg gap-4">
            <div>
              <label htmlFor="quoted-amount" className="admin-label">
                Approved price (Rs)
              </label>
              <input
                id="quoted-amount"
                type="number"
                min={0}
                step="0.01"
                value={quotedAmount}
                disabled={isSavingQuote}
                onChange={(e) => setQuotedAmount(e.target.value)}
                className="admin-input"
              />
            </div>
            {quoteSuccess ? (
              <p className="text-sm text-emerald-700">Price saved.</p>
            ) : null}
            <button
              type="submit"
              disabled={isSavingQuote}
              className="admin-btn-primary w-fit"
            >
              {isSavingQuote ? "Saving…" : "Save Price"}
            </button>
          </form>
        </section>
      ) : customCake ? (
        <section className="admin-card">
          <h2 className="font-display text-base font-semibold text-brand-brown">
            Approved price
          </h2>
          <div className="mt-3">
            <OrderQuoteReadOnly order={order} />
          </div>
        </section>
      ) : null}

      <section className="admin-card">
        <h2 className="font-display text-base font-semibold text-brand-brown">
          Order status
        </h2>
        <form onSubmit={handleStatusSubmit} className="mt-4 grid max-w-lg gap-4">
          <div>
            <label htmlFor="order-status" className="admin-label">
              Order status
            </label>
            <select
              id="order-status"
              value={status}
              disabled={isSaving}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="admin-input"
            >
              {ORDER_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {formatOrderStatus(value)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="admin-notes" className="admin-label">
              Admin notes
            </label>
            <textarea
              id="admin-notes"
              rows={3}
              value={adminNotes}
              disabled={isSaving}
              onChange={(e) => setAdminNotes(e.target.value)}
              className={cn("admin-input min-h-[5rem] resize-y py-2")}
            />
          </div>
          {saveError ? (
            <p className="text-sm text-red-700" role="alert">
              {saveError}
            </p>
          ) : null}
          {saveSuccess ? (
            <p className="text-sm text-emerald-700">Order updated.</p>
          ) : null}
          <button type="submit" disabled={isSaving} className="admin-btn-primary w-fit">
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
  highlight,
  className,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-sm whitespace-pre-wrap",
          highlight ? "font-semibold text-brand-primary" : "text-brand-brown",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
