export const PAYMENT_METHODS = [
  "cash_on_delivery",
  "bank_transfer",
  "online_payment",
  "online_payment_full",
  "online_payment_advance",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "failed"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Gateway identifiers — non-manual values only appear on historical orders. */
export const PAYMENT_GATEWAYS = [
  "manual",
  "bank_transfer",
  "jazzcash",
  "easypaisa",
] as const;

export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];
