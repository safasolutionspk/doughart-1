/** Checkout payment options for Phase 1 launch (manual methods only). */
export const CHECKOUT_PAYMENT_METHODS = [
  "cash_on_delivery",
  "bank_transfer",
] as const;

export type CheckoutPaymentMethod = (typeof CHECKOUT_PAYMENT_METHODS)[number];

/** All methods stored on orders (includes legacy). */
export const PAYMENT_METHODS = [
  "cash_on_delivery",
  "bank_transfer",
  "online_payment",
  "online_payment_full",
  "online_payment_advance",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type PaymentOption = {
  id: CheckoutPaymentMethod;
  label: string;
  description: string;
  badge?: string;
};

const checkoutPaymentOptions: PaymentOption[] = [
  {
    id: "cash_on_delivery",
    label: "Cash on Delivery",
    description: "Pay in cash when your order is delivered.",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    description:
      "Transfer payment to our bank account and upload proof for manual verification.",
  },
];

/** Payment methods shown at checkout for Phase 1. */
export function getAvailablePaymentOptions(): PaymentOption[] {
  return checkoutPaymentOptions;
}

export function resolvePayableAmount(
  finalAmount: number,
  paymentMethod: PaymentMethod | string,
): number {
  if (finalAmount <= 0) {
    return 0;
  }
  if (paymentMethod === "online_payment_advance") {
    return Math.round(finalAmount * 0.5);
  }
  return finalAmount;
}

const paymentMethodLabels: Record<string, string> = {
  cash_on_delivery: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  online_payment: "Online Payment",
  online_payment_full: "Full Online Payment",
  online_payment_advance: "50% Advance Payment",
};

export function formatPaymentMethod(method: PaymentMethod | string): string {
  return paymentMethodLabels[method] ?? method;
}

export function isOnlinePaymentStructureMethod(method: PaymentMethod | string): boolean {
  return (
    method === "online_payment" ||
    method === "online_payment_full" ||
    method === "online_payment_advance"
  );
}

export function formatPaymentStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
  };
  return labels[status] ?? status;
}

export function isAdvancePaymentMethod(method: PaymentMethod | string): boolean {
  return method === "online_payment_advance";
}
