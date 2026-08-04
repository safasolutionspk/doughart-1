export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "baking",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Stored payment methods — new orders are always cash_on_delivery. */
export const PAYMENT_METHODS = [
  "cash_on_delivery",
  "bank_transfer",
  "online_payment",
  "online_payment_full",
  "online_payment_advance",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type Order = {
  _id: string;
  customerId?: string;
  isRegisteredCustomer?: boolean;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress?: string;
  eventDate?: string;
  cakeType: string;
  cakeSize?: string;
  flavour?: string;
  filling?: string;
  designNotes?: string;
  messageOnCake?: string;
  specialInstructions?: string;
  items: Array<{
    cakeName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
  totalAmount: number;
  quotedAmount?: number;
  quoteNotes?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type OrdersPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListOrdersResponse = {
  orders: Order[];
  pagination: OrdersPagination;
};
