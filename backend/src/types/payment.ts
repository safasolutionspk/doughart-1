/**
 * Public checkout writes only Cash on Delivery.
 * Legacy method/status/gateway values remain for reading historical Mongo documents.
 * Do not unset stored payment fields; new orders must not write payment workflow fields.
 */

export const COD_PAYMENT_METHOD = "cash_on_delivery" as const;

/** Methods that may exist on stored orders (includes legacy records). */
export const PAYMENT_METHODS = [
  "cash_on_delivery",
  "bank_transfer",
  "online_payment",
  "online_payment_full",
  "online_payment_advance",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Historical payment statuses — no longer written or exposed by the API. */
export const PAYMENT_STATUSES = ["pending", "paid", "failed"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Historical gateway identifiers — no longer written on new orders. */
export const PAYMENT_GATEWAYS = [
  "manual",
  "bank_transfer",
  "jazzcash",
  "easypaisa",
] as const;

export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];
