import type { PaymentMethod } from "../../types/payment";

/**
 * Historical orders created with a 50% advance method keep their original
 * payable amount so old records stay accurate. New orders are always
 * Cash on Delivery and pay the full amount on delivery.
 */
const ADVANCE_METHODS: PaymentMethod[] = ["online_payment_advance"];

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
