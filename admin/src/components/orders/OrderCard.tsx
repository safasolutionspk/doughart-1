"use client";

import Link from "next/link";
import { useState } from "react";
import { CustomCakeDetailsGrid } from "@/components/orders/CustomCakeDetailsGrid";
import { CustomCakeOrderSummary } from "@/components/orders/CustomCakeOrderSummary";
import { OrderNumberBadge } from "@/components/orders/OrderNumberBadge";
import { OrderQuoteReadOnly } from "@/components/orders/OrderQuoteReadOnly";
import { OrderQuoteSave } from "@/components/orders/OrderQuoteSave";
import { OrderStatusSelect } from "@/components/orders/OrderStatusSelect";
import { ReferenceImageThumbnail } from "@/components/orders/ReferenceImagePreview";
import { cn } from "@/lib/cn";
import {
  canEditCustomCakePrice,
  isCustomCakeOrder,
  resolveCustomCakeReferenceImage,
} from "@/lib/orders/customCake";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatOrderStatus,
  formatPaymentMethod,
} from "@/lib/orders/format";
import type { Order, OrderStatus } from "@/lib/orders/types";

function displayTotal(order: Order): string {
  const amount =
    order.quotedAmount != null && order.quotedAmount > 0
      ? order.quotedAmount
      : order.totalAmount;
  if (amount > 0) {
    return formatCurrency(amount);
  }
  return "Quote pending";
}

const variantStyles: Record<
  "default" | "completed" | "cancelled",
  string
> = {
  default:
    "border-brand-border/70 bg-white shadow-sm shadow-brand-primary/5 hover:border-brand-primary/30 hover:shadow-md",
  completed:
    "border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/40 shadow-sm shadow-emerald-500/5 hover:border-emerald-300",
  cancelled:
    "border-red-100 bg-gradient-to-br from-white to-red-50/30 shadow-sm hover:border-red-200",
};

function resolveVariant(status: OrderStatus): keyof typeof variantStyles {
  if (status === "completed") {
    return "completed";
  }
  if (status === "cancelled") {
    return "cancelled";
  }
  return "default";
}

type OrderCardProps = {
  order: Order;
  onUpdated?: (order: Order) => void;
  enableQuickStatus?: boolean;
};

export function OrderCard({
  order,
  onUpdated,
  enableQuickStatus = false,
}: OrderCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const variant = resolveVariant(order.status);
  const customCake = isCustomCakeOrder(order);
  const editableCustomPrice = canEditCustomCakePrice(order);
  const referenceImage = customCake ? resolveCustomCakeReferenceImage(order) : "";
  const itemSummary =
    order.items.length > 0
      ? order.items
          .map((item) => `${item.quantity}× ${item.cakeName}`)
          .join(", ")
      : order.cakeType;

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border p-3 transition-all duration-200 sm:p-4",
        variantStyles[variant],
        customCake && "border-violet-100/80",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/orders/${order._id}`}
            className="block hover:opacity-90"
          >
            <p className="font-display text-sm font-semibold text-brand-brown sm:text-base">
              {order.customerName}
            </p>
          </Link>
          <p className="text-xs text-brand-muted">{order.customerPhone}</p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          {customCake ? (
            <ReferenceImageThumbnail
              source={referenceImage}
              sizeClassName="h-12 w-12 sm:h-14 sm:w-14"
            />
          ) : null}
          <div className="flex flex-col items-end gap-1">
            <p
              className={cn(
                "font-display text-sm font-semibold",
                variant === "completed"
                  ? "text-emerald-700"
                  : variant === "cancelled"
                    ? "text-brand-muted line-through"
                    : "text-brand-primary",
              )}
            >
              {displayTotal(order)}
            </p>
          </div>
        </div>
      </div>

      {customCake ? (
        <div className="mt-2 border-t border-brand-border/50 pt-2">
          <CustomCakeOrderSummary order={order} customerFields="address-only" />
        </div>
      ) : (
        <div className="mt-2 space-y-1 text-xs">
          <p className="line-clamp-1 text-brand-brown">
            <span className="font-medium">Cake: </span>
            {order.cakeType}
          </p>
          <p className="line-clamp-2 text-brand-muted">
            <span className="font-medium text-brand-brown">Items: </span>
            {itemSummary}
          </p>
          {order.deliveryAddress ? (
            <p className="line-clamp-2 text-brand-muted">
              <span className="font-medium text-brand-brown">Address: </span>
              {order.deliveryAddress}
            </p>
          ) : null}
        </div>
      )}

      {!customCake ? (
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-brand-border/50 pt-2 text-xs">
          <div>
            <dt className="text-brand-muted">Payment</dt>
            <dd className="font-medium text-brand-brown">
              {formatPaymentMethod(order.paymentMethod ?? "cash_on_delivery")}
            </dd>
          </div>
          <div>
            <dt className="text-brand-muted">Delivery</dt>
            <dd className="font-medium text-brand-brown">
              {formatDate(order.eventDate)}
            </dd>
          </div>
          <div>
            <dt className="text-brand-muted">Status</dt>
            <dd className="font-medium text-brand-brown">
              {formatOrderStatus(order.status)}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-brand-muted">Placed</dt>
            <dd className="font-medium text-brand-brown">
              {formatDateTime(order.createdAt)}
            </dd>
          </div>
        </dl>
      ) : (
        <div className="mt-2 border-t border-brand-border/50 pt-2">
          <button
            type="button"
            onClick={() => setDetailsOpen((value) => !value)}
            className="flex w-full items-center justify-between text-left text-xs font-semibold text-brand-primary hover:underline"
          >
            {detailsOpen ? "Hide full details" : "Show full details"}
            <span aria-hidden className="text-brand-muted">
              {detailsOpen ? "▲" : "▼"}
            </span>
          </button>
          {detailsOpen ? (
            <div className="mt-2 space-y-2 border-t border-brand-border/40 pt-2">
              <CustomCakeDetailsGrid order={order} />
            </div>
          ) : null}
        </div>
      )}

      {customCake || (onUpdated && enableQuickStatus) ? (
        <div className="mt-2 space-y-2 border-t border-brand-border/50 pt-2">
          {customCake ? (
            editableCustomPrice && onUpdated ? (
              <OrderQuoteSave order={order} onUpdated={onUpdated} />
            ) : (
              <OrderQuoteReadOnly order={order} />
            )
          ) : null}
          {onUpdated && enableQuickStatus ? (
            <OrderStatusSelect order={order} onUpdated={onUpdated} />
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
        <OrderNumberBadge orderNumber={order.orderNumber} />
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/dashboard/orders/${order._id}`}
            className="admin-btn-primary !h-8 !px-3 !text-[11px]"
          >
            Details
          </Link>
          {customCake ? (
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-violet-200 ring-inset">
              Custom
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
