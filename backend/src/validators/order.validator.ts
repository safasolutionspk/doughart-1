import { z } from "zod";
import { PAYMENT_GATEWAYS, PAYMENT_METHODS, PAYMENT_STATUSES } from "../types/payment";
import { ORDER_STATUSES } from "../types/orderStatus";

const orderItemSchema = z.object({
  cakeId: z.string().optional(),
  cakeName: z.string().min(1, "Cake name is required"),
  quantity: z.coerce.number().int().min(1).default(1),
  unitPrice: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

/** Internal shape stored in MongoDB */
export const createOrderSchema = z.object({
  customerName: z.string().min(2, "Customer name is required").max(120),
  customerEmail: z
    .string()
    .max(160)
    .optional()
    .default("")
    .transform((val) => val.trim().toLowerCase())
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Enter a valid email address or leave this field blank.",
    ),
  customerPhone: z
    .string()
    .min(7, "Valid phone number is required")
    .max(30, "Phone number is too long"),
  deliveryAddress: z.string().max(500).optional(),
  eventDate: z.coerce.date().optional(),
  cakeType: z.string().min(1, "Cake type is required").max(120),
  cakeSize: z.string().max(80).optional(),
  flavour: z.string().max(120).optional(),
  filling: z.string().max(120).optional(),
  designNotes: z.string().max(1000).optional(),
  messageOnCake: z.string().max(200).optional(),
  specialInstructions: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).optional().default([]),
  totalAmount: z.coerce.number().min(0).optional().default(0),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
  paymentStatus: z
    .enum(["pending", "paid", "failed"] as const)
    .optional()
    .default("pending"),
  quotedAmount: z.coerce.number().min(0).optional(),
  quoteNotes: z.string().max(500).optional(),
  paymentGateway: z.enum(PAYMENT_GATEWAYS).optional(),
  transactionId: z.string().max(120).optional(),
  proofImage: z.string().max(500).optional(),
  gatewayResponse: z.record(z.unknown()).optional(),
});

/** Client catalog line identifiers only — name/price resolved server-side */
const publicCatalogItemSchema = z.object({
  cakeSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid cake slug"),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
  notes: z.string().max(500).optional(),
});

/** Public website form payload */
export const publicCreateOrderSchema = z
  .object({
    name: z.string().min(2, "Name is required").max(120),
    phone: z.string().min(7, "Valid phone number is required").max(30),
    email: z
      .string()
      .max(160)
      .optional()
      .default("")
      .transform((val) => val.trim().toLowerCase())
      .refine(
        (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "Enter a valid email address or leave this field blank.",
      ),
    cakeType: z.string().min(1, "Cake type is required").max(120),
    flavor: z.string().max(120).optional(),
    size: z.string().max(80).optional(),
    message: z.string().max(200).optional(),
    deliveryDate: z
      .string()
      .optional()
      .refine(
        (val) => !val || !Number.isNaN(Date.parse(val)),
        "Delivery date must be a valid date",
      ),
    address: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
    /**
     * Public checkout is Cash on Delivery only. Any explicitly supplied
     * non-COD value is rejected with a 400 validation error.
     */
    paymentMethod: z
      .enum(["cash_on_delivery"] as const, {
        errorMap: () => ({
          message: "Only Cash on Delivery is available. Pay when your order is delivered.",
        }),
      })
      .optional()
      .default("cash_on_delivery"),
    cakeSlug: z
      .string()
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    /** Cart/catalog line refs (slug + qty). Name and price are ignored by the server. */
    items: z.array(publicCatalogItemSchema).max(50).optional(),
    referenceImage: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    const isCatalogCheckout =
      Boolean(data.cakeSlug?.trim()) ||
      (data.items?.length ?? 0) > 0 ||
      data.notes?.includes("[Cart order]") ||
      data.cakeType.trim().startsWith("Cart order");

    if (!isCatalogCheckout) {
      if (!data.size?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter cake pounds.",
          path: ["size"],
        });
      }

      if (!data.flavor?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter cake flavor.",
          path: ["flavor"],
        });
      }

      if (!data.address?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter your address.",
          path: ["address"],
        });
      }
      return;
    }

    if (!data.address?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter your address.",
        path: ["address"],
      });
    }

    if (!data.size?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter cake pounds.",
        path: ["size"],
      });
    }

    if (!data.flavor?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter cake flavor.",
        path: ["flavor"],
      });
    }
  })
  .transform((data) => ({
    customerName: data.name.trim(),
    customerPhone: data.phone.trim(),
    customerEmail: data.email || "",
    cakeType: data.cakeType.trim(),
    cakeSize: data.size?.trim() || undefined,
    flavour: data.flavor?.trim() || undefined,
    messageOnCake: data.message?.trim() || undefined,
    eventDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
    deliveryAddress: data.address?.trim() || undefined,
    specialInstructions: data.notes?.trim() || undefined,
    designNotes: data.referenceImage?.trim() || undefined,
    paymentMethod: data.paymentMethod,
    paymentStatus: "pending" as const,
    cakeSlug: data.cakeSlug?.trim() || undefined,
    catalogItems: (data.items ?? [])
      .map((item) => ({
        cakeSlug: item.cakeSlug.trim(),
        quantity: item.quantity,
        notes: item.notes?.trim() || undefined,
      }))
      .filter((item) => item.cakeSlug.length > 0),
    items: [] as z.infer<typeof createOrderSchema>["items"],
    totalAmount: 0,
  }));

export const lookupOrderQuerySchema = z.object({
  orderNumber: z
    .string()
    .min(1)
    .max(32)
    .regex(/^SA-[0-9]{6}-[0-9]{4}$/, "Invalid order number format"),
  phone: z.string().min(7, "Phone number is required").max(30),
});

export const updateOrderQuoteSchema = z.object({
  quotedAmount: z.coerce.number().min(0, "Quoted amount must be 0 or greater"),
  quoteNotes: z.string().max(500).optional(),
});

export const markOrdersViewedSchema = z.object({
  group: z.enum(["active", "custom_cakes"], {
    errorMap: () => ({ message: "Invalid notification group" }),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z
    .enum(ORDER_STATUSES, {
      errorMap: () => ({ message: "Invalid order status" }),
    })
    .optional(),
  paymentStatus: z
    .enum(PAYMENT_STATUSES, {
      errorMap: () => ({ message: "Invalid payment status" }),
    })
    .optional(),
  adminNotes: z.string().optional(),
  transactionId: z.string().max(120).optional(),
  paymentGateway: z.enum(PAYMENT_GATEWAYS).optional(),
  gatewayResponse: z.record(z.unknown()).optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
});

export const orderNumberParamSchema = z.object({
  orderNumber: z
    .string()
    .min(1, "Order number is required")
    .max(32)
    .regex(/^SA-[0-9]{6}-[0-9]{4}$/, "Invalid order number format"),
});

/** Required on GET /api/orders/public/:orderNumber */
export const publicOrderPhoneQuerySchema = z.object({
  phone: z.string().min(7, "Phone number is required").max(30),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  /** Custom cake requests awaiting admin price (totalAmount 0, no quote yet) */
  awaitingQuote: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  /** Exclude completed and cancelled (active order management) */
  activeOnly: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type PublicCreateOrderInput = z.infer<typeof publicCreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderQuoteInput = z.infer<typeof updateOrderQuoteSchema>;
export type MarkOrdersViewedInput = z.infer<typeof markOrdersViewedSchema>;
export type LookupOrderQuery = z.infer<typeof lookupOrderQuerySchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
