import type { PaymentMethod } from "../../types/payment";

const ADVANCE_METHODS: PaymentMethod[] = ["online_payment_advance"];

/** Payable amount for checkout display (whole PKR rupees). */
export function resolvePayableAmount(
  finalAmount: number,
  paymentMethod: string,
): number {
  if (finalAmount <= 0) {
    return 0;
  }

  if (ADVANCE_METHODS.includes(paymentMethod as PaymentMethod)) {
    return Math.round(finalAmount * 0.5);
  }

  return finalAmount;
}

export function formatPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash_on_delivery: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
    online_payment: "Online Payment",
    online_payment_full: "Full Online Payment",
    online_payment_advance: "50% Advance Payment",
  };
  return labels[method] ?? method;
}
