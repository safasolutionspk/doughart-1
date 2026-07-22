export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "baking",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
