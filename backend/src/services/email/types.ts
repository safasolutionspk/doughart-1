export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

export type OrderEmailContext = {
  orderId?: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cakeType: string;
  cakeSize?: string;
  flavour?: string;
  deliveryAddress?: string;
  designNotes?: string;
  specialInstructions?: string;
  messageOnCake?: string;
  totalAmount: number;
  quotedAmount?: number;
  quoteNotes?: string;
  paymentMethod: string;
  paymentStatus: string;
  status?: string;
  createdAt?: string;
  items: Array<{
    cakeName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
  eventDate?: string;
  awaitingQuote: boolean;
};

/** Sends transactional email. Implementations: noop, console (dev), SMTP (production). */
export interface IEmailNotifier {
  send(message: EmailMessage): Promise<void>;
}
