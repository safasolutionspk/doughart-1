import { ORDER_STATUSES, type OrderStatus, type PaymentMethod } from "./types";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  baking: "Food Processing",
  out_for_delivery: "Out for Delivery",
  completed: "Delivered",
  cancelled: "Cancelled",
};

/** Labels for status dropdowns (same wording as badges). */
export const ORDER_STATUS_SELECT_OPTIONS = ORDER_STATUSES.map((value) => ({
  value,
  label: statusLabels[value],
}));

export function formatOrderStatus(status: OrderStatus): string {
  return statusLabels[status] ?? status;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash_on_delivery: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  online_payment: "Online Payment",
  online_payment_full: "Full Online Payment",
  online_payment_advance: "50% Advance Payment",
};

export function formatPaymentMethod(method: PaymentMethod | string): string {
  return (
    paymentMethodLabels[method as PaymentMethod] ??
    String(method).replace(/_/g, " ")
  );
}

export function formatCurrency(amount: number): string {
  const formatted = amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `Rs ${formatted}`;
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
