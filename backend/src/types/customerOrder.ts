import type { OrderStatus } from "./orderStatus";
import type { PaymentMethod, PaymentStatus } from "./payment";

export type CustomerOrderItemSummary = {
  cakeName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
};

/** Customer account order list item — no admin or sensitive fields. */
export type CustomerOrderSummary = {
  orderNumber: string;
  /** Phone on the order — used for order lookup links (may differ from account phone). */
  phone: string;
  status: OrderStatus;
  cakeType: string;
  cakeSize?: string;
  flavour?: string;
  messageOnCake?: string;
  specialInstructions?: string;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  quotedAmount?: number;
  quoteNotes?: string;
  finalAmount: number;
  payableAmount: number;
  awaitingQuote: boolean;
  isCustomCake: boolean;
  items?: CustomerOrderItemSummary[];
  eventDate?: string;
  createdAt: string;
  paymentProofSubmitted?: boolean;
};
