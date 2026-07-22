export const PAYMENT_GATEWAYS = [
  "manual",
  "bank_transfer",
  "jazzcash",
  "easypaisa",
] as const;

export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];

export const PAYMENT_GATEWAY_LABELS: Record<PaymentGateway, string> = {
  manual: "Manual / COD",
  bank_transfer: "Bank transfer",
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
};
