import type { OrderStatus } from "./orderStatus";
import type { PaymentMethod, PaymentStatus } from "./payment";

export type PublicOrderResponse = {
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  cakeType: string;
  cakeSize?: string;
  flavour?: string;
  eventDate?: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  quotedAmount?: number;
  finalAmount: number;
  payableAmount: number;
  quoteNotes?: string;
  awaitingQuote: boolean;
  /** True when customer has uploaded bank transfer proof (no URL exposed). */
  paymentProofSubmitted?: boolean;
  message: string;
};
