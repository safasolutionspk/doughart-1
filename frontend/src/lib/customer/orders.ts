export type CustomerOrderItemSummary = {
  cakeName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
};

export type CustomerOrderSummary = {
  orderNumber: string;
  phone: string;
  status: string;
  cakeType: string;
  cakeSize?: string;
  flavour?: string;
  messageOnCake?: string;
  specialInstructions?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  paymentStatus: string;
  totalAmount: number;
  quotedAmount?: number;
  quoteNotes?: string;
  finalAmount: number;
  payableAmount?: number;
  awaitingQuote: boolean;
  isCustomCake: boolean;
  items?: CustomerOrderItemSummary[];
  eventDate?: string;
  createdAt: string;
  paymentProofSubmitted?: boolean;
};

export async function fetchCustomerOrders(): Promise<CustomerOrderSummary[]> {
  const response = await fetch("/api/customers/orders", {
    cache: "no-store",
    credentials: "include",
  });

  const body = (await response.json()) as {
    success: boolean;
    data?: CustomerOrderSummary[];
    message?: string;
  };

  if (!response.ok || !body.success || !body.data) {
    return [];
  }

  return body.data;
}
