import type { OrderStatus } from "./orderStatus";
import type { PaymentMethod } from "./payment";

export type PublicOrderResponse = {
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  cakeType: string;
  cakeSize?: string;
  flavour?: string;
  eventDate?: string;
  createdAt: string;
  /** Always Cash on Delivery for new orders; may be a legacy value on old records. */
  paymentMethod: PaymentMethod;
  totalAmount: number;
  quotedAmount?: number;
  finalAmount: number;
  quoteNotes?: string;
  awaitingQuote: boolean;
  message: string;
};
