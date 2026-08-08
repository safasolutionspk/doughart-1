import { Cake, Order, type IOrderDocument } from "../models";
import {
  hasItemType,
  normalizeItemTypes,
  type ItemType,
} from "../constants/itemTypes";
import {
  notifyCustomerOrderConfirmed,
  notifyCustomerOrderCreated,
  notifyOwnerOrderCreated,
  notifyQuoteReady,
  type OrderEmailContext,
} from "./email";
import type { CustomerOrderSummary } from "../types/customerOrder";
import type { PublicOrderResponse } from "../types/publicOrder";
import { COD_PAYMENT_METHOD } from "../types/payment";
import { ApiError } from "../utils/ApiError";
import type {
  ListOrdersQuery,
  LookupOrderQuery,
  PublicCreateOrderInput,
  UpdateOrderQuoteInput,
  UpdateOrderStatusInput,
  MarkOrdersViewedInput,
} from "../validators/order.validator";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function resolveFinalAmount(order: {
  quotedAmount?: number;
  totalAmount: number;
}): number {
  if (order.quotedAmount != null && order.quotedAmount > 0) {
    return order.quotedAmount;
  }
  return order.totalAmount;
}

function isAwaitingQuote(order: {
  quotedAmount?: number;
  totalAmount: number;
}): boolean {
  return order.totalAmount === 0 && (order.quotedAmount == null || order.quotedAmount === 0);
}

function unseenCustomCakeFilter() {
  return {
    adminSeen: false,
    totalAmount: 0,
    status: { $ne: "cancelled" as const },
    $or: [
      { quotedAmount: { $exists: false } },
      { quotedAmount: null },
      { quotedAmount: 0 },
    ],
  };
}

function unseenActiveNormalFilter() {
  return {
    adminSeen: false,
    totalAmount: { $gt: 0 },
    status: { $nin: ["completed", "cancelled"] as const },
  };
}

function phonesMatch(storedPhone: string, providedPhone: string): boolean {
  return normalizePhone(storedPhone) === normalizePhone(providedPhone);
}

const PUBLIC_ORDER_NOT_FOUND =
  "Order not found. Check your order number and phone.";

function toOrderEmailContext(order: {
  _id?: { toString(): string };
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress?: string;
  cakeType: string;
  cakeSize?: string;
  flavour?: string;
  designNotes?: string;
  specialInstructions?: string;
  messageOnCake?: string;
  totalAmount: number;
  quotedAmount?: number;
  quoteNotes?: string;
  paymentMethod?: string;
  status?: string;
  createdAt?: Date;
  items?: Array<{
    cakeName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
    itemTypes?: string[];
    cakeDetails?: {
      pounds?: string;
      flavor?: string;
      messageOnCake?: string;
      notes?: string;
    };
    giftDetails?: {
      notes?: string;
    };
    productDetails?: {
      notes?: string;
    };
  }>;
  eventDate?: Date;
}): OrderEmailContext {
  return {
    orderId: order._id?.toString(),
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail?.trim() ?? "",
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    cakeType: order.cakeType,
    cakeSize: order.cakeSize,
    flavour: order.flavour,
    designNotes: order.designNotes,
    specialInstructions: order.specialInstructions,
    messageOnCake: order.messageOnCake,
    totalAmount: order.totalAmount,
    quotedAmount: order.quotedAmount,
    quoteNotes: order.quoteNotes,
    paymentMethod: order.paymentMethod || COD_PAYMENT_METHOD,
    status: order.status,
    createdAt: order.createdAt
      ? order.createdAt.toISOString().replace("T", " ").slice(0, 19)
      : undefined,
    items: (order.items ?? []).map((item) => ({
      cakeName: item.cakeName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      notes: item.notes,
      itemTypes: item.itemTypes,
      cakeDetails: item.cakeDetails,
      giftDetails: item.giftDetails,
      productDetails: item.productDetails,
    })),
    eventDate: order.eventDate
      ? order.eventDate.toISOString().split("T")[0]
      : undefined,
    awaitingQuote: isAwaitingQuote(order),
  };
}

function toCustomerOrderSummary(order: {
  orderNumber: string;
  customerPhone: string;
  status: string;
  cakeType: string;
  cakeSize?: string;
  flavour?: string;
  messageOnCake?: string;
  specialInstructions?: string;
  deliveryAddress?: string;
  eventDate?: Date;
  createdAt?: Date;
  paymentMethod?: string;
  totalAmount: number;
  quotedAmount?: number;
  quoteNotes?: string;
  items?: Array<{ cakeName: string; quantity: number; unitPrice: number; notes?: string }>;
}): CustomerOrderSummary {
  const finalAmount = resolveFinalAmount(order);
  const awaitingQuote = isAwaitingQuote(order);

  return {
    orderNumber: order.orderNumber,
    phone: order.customerPhone,
    status: order.status as CustomerOrderSummary["status"],
    cakeType: order.cakeType,
    cakeSize: order.cakeSize,
    flavour: order.flavour,
    messageOnCake: order.messageOnCake,
    specialInstructions: order.specialInstructions,
    deliveryAddress: order.deliveryAddress,
    paymentMethod: (order.paymentMethod ||
      COD_PAYMENT_METHOD) as CustomerOrderSummary["paymentMethod"],
    totalAmount: order.totalAmount,
    quotedAmount: order.quotedAmount,
    quoteNotes: order.quoteNotes,
    finalAmount,
    awaitingQuote,
    isCustomCake: order.totalAmount === 0,
    items: order.items?.map((item) => ({
      cakeName: item.cakeName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      notes: item.notes,
    })),
    eventDate: order.eventDate
      ? order.eventDate.toISOString().split("T")[0]
      : undefined,
    createdAt: (order.createdAt ?? new Date()).toISOString(),
  };
}

function toPublicOrderResponse(order: {
  orderNumber: string;
  status: string;
  customerName: string;
  cakeType: string;
  cakeSize?: string;
  flavour?: string;
  eventDate?: Date;
  createdAt?: Date;
  paymentMethod?: string;
  totalAmount: number;
  quotedAmount?: number;
  quoteNotes?: string;
}): PublicOrderResponse {
  const finalAmount = resolveFinalAmount(order);
  const awaitingQuote = isAwaitingQuote(order);

  return {
    orderNumber: order.orderNumber,
    status: order.status as PublicOrderResponse["status"],
    customerName: order.customerName,
    cakeType: order.cakeType,
    cakeSize: order.cakeSize,
    flavour: order.flavour,
    eventDate: order.eventDate
      ? order.eventDate.toISOString().split("T")[0]
      : undefined,
    createdAt: (order.createdAt ?? new Date()).toISOString(),
    paymentMethod: (order.paymentMethod ||
      COD_PAYMENT_METHOD) as PublicOrderResponse["paymentMethod"],
    totalAmount: order.totalAmount,
    quotedAmount: order.quotedAmount,
    finalAmount,
    quoteNotes: order.quoteNotes,
    awaitingQuote,
    message: awaitingQuote
      ? "Your custom cake request was received. We will send you a final price quote soon."
      : "Thank you! Your order has been received. We will contact you shortly to confirm details.",
  };
}

async function findOrderForPublicAccess(orderNumber: string, phone: string) {
  const order = await Order.findOne({ orderNumber }).lean();

  if (!order) {
    throw ApiError.notFound(PUBLIC_ORDER_NOT_FOUND);
  }

  if (!phonesMatch(order.customerPhone, phone)) {
    throw ApiError.notFound(PUBLIC_ORDER_NOT_FOUND);
  }

  return order;
}

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SA-${y}${m}${d}-${rand}`;
}

const ORDER_NUMBER_MAX_ATTEMPTS = 5;

function isDuplicateOrderNumberError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const mongoError = error as {
    code?: number;
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
  };

  if (mongoError.code !== 11000) {
    return false;
  }

  if (mongoError.keyPattern?.orderNumber != null) {
    return true;
  }

  return mongoError.keyValue?.orderNumber != null;
}

type AdminOrderSource = {
  customerId?: unknown;
  paymentStatus?: unknown;
  paymentGateway?: unknown;
  proofImage?: unknown;
  transactionId?: unknown;
  gatewayResponse?: unknown;
  paymentMethod?: string;
  [key: string]: unknown;
};

/** Strip payment-workflow fields from admin API responses; keep COD method. */
function toAdminOrderResponse<T extends AdminOrderSource>(
  order: T,
): Omit<
  T,
  | "paymentStatus"
  | "paymentGateway"
  | "proofImage"
  | "transactionId"
  | "gatewayResponse"
> & {
  paymentMethod: string;
  isRegisteredCustomer: boolean;
} {
  const {
    paymentStatus: _paymentStatus,
    paymentGateway: _paymentGateway,
    proofImage: _proofImage,
    transactionId: _transactionId,
    gatewayResponse: _gatewayResponse,
    ...rest
  } = order;

  return {
    ...rest,
    paymentMethod: order.paymentMethod || COD_PAYMENT_METHOD,
    isRegisteredCustomer: Boolean(order.customerId),
  };
}

type CatalogLineRef = {
  cakeSlug: string;
  quantity: number;
  notes?: string;
  cakeDetails?: {
    pounds?: string;
    flavor?: string;
    messageOnCake?: string;
    notes?: string;
  };
  giftDetails?: {
    notes?: string;
  };
  productDetails?: {
    notes?: string;
  };
};

type ResolvedCatalogItem = {
  cakeId: string;
  cakeName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  categorySlug?: string;
  itemTypes: ItemType[];
  cakeDetails?: {
    pounds?: string;
    flavor?: string;
    messageOnCake?: string;
    notes?: string;
  };
  giftDetails?: {
    notes?: string;
  };
  productDetails?: {
    notes?: string;
  };
};

async function resolveCatalogOrderItems(
  catalogItems: CatalogLineRef[],
  cakeSlug?: string,
  orderLevel?: {
    cakeSize?: string;
    flavour?: string;
    messageOnCake?: string;
    specialInstructions?: string;
  },
): Promise<{
  items: ResolvedCatalogItem[];
  cakeType: string;
  totalAmount: number;
  /** Mirrored top-level cake fields for single cake-type items (legacy emails/admin). */
  orderCakeFields: {
    cakeSize?: string;
    flavour?: string;
    messageOnCake?: string;
  };
}> {
  const lineRefs: CatalogLineRef[] =
    catalogItems.length > 0
      ? catalogItems
      : cakeSlug
        ? [{ cakeSlug, quantity: 1 }]
        : [];

  if (lineRefs.length === 0) {
    return { items: [], cakeType: "", totalAmount: 0, orderCakeFields: {} };
  }

  const uniqueSlugs = [...new Set(lineRefs.map((line) => line.cakeSlug))];
  const cakes = await Cake.find({
    slug: { $in: uniqueSlugs },
    isActive: true,
  })
    .populate("categoryId", "slug")
    .select("name slug price categoryId itemTypes")
    .lean();

  const cakeBySlug = new Map(cakes.map((cake) => [cake.slug, cake]));

  for (const slug of uniqueSlugs) {
    if (!cakeBySlug.has(slug)) {
      throw ApiError.badRequest("Selected cake is no longer available");
    }
  }

  const items: ResolvedCatalogItem[] = lineRefs.map((line, index) => {
    const cake = cakeBySlug.get(line.cakeSlug)!;
    const category = cake.categoryId as { slug?: string } | null | undefined;
    const itemTypes = normalizeItemTypes(cake.itemTypes);

    const cakeDetails = hasItemType(itemTypes, "cake")
      ? {
          pounds:
            line.cakeDetails?.pounds?.trim() ||
            (lineRefs.length === 1 ? orderLevel?.cakeSize?.trim() : undefined) ||
            undefined,
          flavor:
            line.cakeDetails?.flavor?.trim() ||
            (lineRefs.length === 1 ? orderLevel?.flavour?.trim() : undefined) ||
            undefined,
          messageOnCake:
            line.cakeDetails?.messageOnCake?.trim() ||
            (lineRefs.length === 1
              ? orderLevel?.messageOnCake?.trim()
              : undefined) ||
            undefined,
          notes: line.cakeDetails?.notes?.trim() || undefined,
        }
      : undefined;

    if (hasItemType(itemTypes, "cake")) {
      if (!cakeDetails?.pounds) {
        throw ApiError.badRequest(
          `Please enter cake pounds for "${cake.name}".`,
        );
      }
      if (!cakeDetails?.flavor) {
        throw ApiError.badRequest(
          `Please enter cake flavor for "${cake.name}".`,
        );
      }
    }

    const giftDetails = hasItemType(itemTypes, "gift")
      ? {
          notes:
            line.giftDetails?.notes?.trim() ||
            (lineRefs.length === 1 &&
            !hasItemType(itemTypes, "cake") &&
            !hasItemType(itemTypes, "other")
              ? orderLevel?.specialInstructions?.trim()
              : undefined) ||
            undefined,
        }
      : undefined;

    const productDetails = hasItemType(itemTypes, "other")
      ? {
          notes:
            line.productDetails?.notes?.trim() ||
            (lineRefs.length === 1 &&
            !hasItemType(itemTypes, "cake") &&
            !hasItemType(itemTypes, "gift")
              ? orderLevel?.specialInstructions?.trim()
              : undefined) ||
            undefined,
        }
      : undefined;

    void index;

    return {
      cakeId: String(cake._id),
      cakeName: cake.name,
      quantity: line.quantity,
      unitPrice: cake.price,
      notes: line.notes,
      ...(category?.slug ? { categorySlug: category.slug } : {}),
      itemTypes,
      ...(cakeDetails &&
      (cakeDetails.pounds ||
        cakeDetails.flavor ||
        cakeDetails.messageOnCake ||
        cakeDetails.notes)
        ? { cakeDetails }
        : {}),
      ...(giftDetails?.notes ? { giftDetails } : {}),
      ...(productDetails?.notes ? { productDetails } : {}),
    };
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const cakeType =
    items.length === 1
      ? items[0].cakeName
      : `Cart order (${items.length} items)`;

  const firstCakeItem = items.find((item) => hasItemType(item.itemTypes, "cake"));
  const orderCakeFields =
    items.length === 1 && firstCakeItem?.cakeDetails
      ? {
          cakeSize: firstCakeItem.cakeDetails.pounds,
          flavour: firstCakeItem.cakeDetails.flavor,
          messageOnCake: firstCakeItem.cakeDetails.messageOnCake,
        }
      : items.length === 1 && firstCakeItem
        ? {
            cakeSize: firstCakeItem.cakeDetails?.pounds,
            flavour: firstCakeItem.cakeDetails?.flavor,
            messageOnCake: firstCakeItem.cakeDetails?.messageOnCake,
          }
        : {};

  return { items, cakeType, totalAmount, orderCakeFields };
}

export async function createOrder(
  input: PublicCreateOrderInput,
  customerId?: string,
): Promise<PublicOrderResponse> {
  const { cakeSlug, catalogItems, ...orderInput } = input;

  // Public checkout is Cash on Delivery only — enforced server-side in
  // addition to schema validation, so no client payload can override it.
  orderInput.paymentMethod = COD_PAYMENT_METHOD;

  const resolvedCatalog = await resolveCatalogOrderItems(
    catalogItems ?? [],
    cakeSlug,
    {
      cakeSize: orderInput.cakeSize,
      flavour: orderInput.flavour,
      messageOnCake: orderInput.messageOnCake,
      specialInstructions: orderInput.specialInstructions,
    },
  );

  if (resolvedCatalog.items.length > 0) {
    orderInput.cakeType = resolvedCatalog.cakeType;
    orderInput.totalAmount = resolvedCatalog.totalAmount;
    orderInput.items = resolvedCatalog.items;
    if (resolvedCatalog.orderCakeFields.cakeSize) {
      orderInput.cakeSize = resolvedCatalog.orderCakeFields.cakeSize;
    }
    if (resolvedCatalog.orderCakeFields.flavour) {
      orderInput.flavour = resolvedCatalog.orderCakeFields.flavour;
    }
    if (resolvedCatalog.orderCakeFields.messageOnCake) {
      orderInput.messageOnCake = resolvedCatalog.orderCakeFields.messageOnCake;
    }
  }

  const items =
    orderInput.items.length > 0
      ? orderInput.items
      : [
          {
            cakeName: orderInput.cakeType,
            quantity: 1,
            unitPrice: orderInput.totalAmount ?? 0,
            notes: orderInput.cakeSize ? `Pounds: ${orderInput.cakeSize}` : undefined,
          },
        ];

  let order: IOrderDocument | null = null;
  let attempt = 0;

  while (attempt < ORDER_NUMBER_MAX_ATTEMPTS) {
    attempt += 1;
    const orderNumber = generateOrderNumber();

    try {
      // Do not write paymentStatus / paymentGateway / proof fields on new orders.
      order = new Order({
        ...orderInput,
        orderNumber,
        ...(customerId ? { customerId } : {}),
        items,
        status: "pending",
        paymentMethod: COD_PAYMENT_METHOD,
        adminSeen: false,
      });
      await order.save();
      break;
    } catch (error) {
      if (isDuplicateOrderNumberError(error) && attempt < ORDER_NUMBER_MAX_ATTEMPTS) {
        continue;
      }
      throw error;
    }
  }

  if (!order) {
    throw ApiError.conflict(
      "We could not generate a unique order number. Please try placing your order again.",
    );
  }

  const emailCtx = toOrderEmailContext(order);
  notifyOwnerOrderCreated(emailCtx);
  notifyCustomerOrderCreated(emailCtx);

  return toPublicOrderResponse(order);
}

export async function listOrders(query: ListOrdersQuery) {
  const { status, search, page, limit, awaitingQuote, activeOnly } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  } else if (activeOnly) {
    filter.status = { $nin: ["completed", "cancelled"] };
  }

  if (awaitingQuote) {
    filter.totalAmount = 0;
    filter.status = { $ne: "cancelled" };
    filter.$or = [{ quotedAmount: { $exists: false } }, { quotedAmount: 0 }, { quotedAmount: null }];
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [
      { orderNumber: regex },
      { customerName: regex },
      { customerEmail: regex },
      { customerPhone: regex },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders: orders.map((order) => toAdminOrderResponse(order)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listOrdersForCustomer(
  customerId: string,
): Promise<CustomerOrderSummary[]> {
  const orders = await Order.find({ customerId })
    .sort({ createdAt: -1 })
    .select(
      "orderNumber customerPhone status cakeType cakeSize flavour messageOnCake specialInstructions deliveryAddress eventDate createdAt paymentMethod totalAmount quotedAmount quoteNotes items",
    )
    .lean();

  return orders.map((order) => toCustomerOrderSummary(order));
}

export async function getOrderById(id: string) {
  const order = await Order.findById(id).lean();

  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  return toAdminOrderResponse(order);
}

export async function getPublicOrderByOrderNumber(
  orderNumber: string,
  phone: string,
) {
  const order = await findOrderForPublicAccess(orderNumber, phone);
  return toPublicOrderResponse(order);
}

export async function lookupPublicOrder(query: LookupOrderQuery) {
  const order = await findOrderForPublicAccess(query.orderNumber, query.phone);
  return toPublicOrderResponse(order);
}

export async function updateOrderQuote(id: string, input: UpdateOrderQuoteInput) {
  const previous = await Order.findById(id)
    .select("quotedAmount status")
    .lean();

  if (!previous) {
    throw ApiError.notFound("Order not found");
  }

  if (previous.status === "completed" || previous.status === "cancelled") {
    throw ApiError.badRequest("Approved price cannot be changed for completed or cancelled orders.");
  }

  const updates: Record<string, unknown> = {
    quotedAmount: input.quotedAmount,
    ...(input.quoteNotes !== undefined ? { quoteNotes: input.quoteNotes } : {}),
    adminSeen: true,
    adminSeenAt: new Date(),
  };

  if (
    input.quotedAmount > 0 &&
    previous.status === "pending"
  ) {
    updates.status = "confirmed";
  }

  const order = await Order.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).lean();

  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  const quoteNewlySet =
    input.quotedAmount > 0 &&
    (previous.quotedAmount == null || previous.quotedAmount === 0);

  if (quoteNewlySet) {
    notifyQuoteReady(toOrderEmailContext(order));
  }

  if (order.status === "confirmed" && previous.status !== "confirmed") {
    notifyCustomerOrderConfirmed(toOrderEmailContext(order));
  }

  return toAdminOrderResponse(order);
}

export type AdminOrderNotifications = {
  newActiveOrders: number;
  newCustomCakeRequests: number;
};

export async function getAdminOrderNotifications(): Promise<AdminOrderNotifications> {
  const [newCustomCakeRequests, newActiveOrders] = await Promise.all([
    Order.countDocuments(unseenCustomCakeFilter()),
    Order.countDocuments(unseenActiveNormalFilter()),
  ]);

  return { newCustomCakeRequests, newActiveOrders };
}

export async function markOrdersViewed(input: MarkOrdersViewedInput): Promise<AdminOrderNotifications> {
  const now = new Date();
  const update = { adminSeen: true, adminSeenAt: now };

  if (input.group === "custom_cakes") {
    await Order.updateMany(unseenCustomCakeFilter(), update);
  } else {
    await Order.updateMany(unseenActiveNormalFilter(), update);
  }

  return getAdminOrderNotifications();
}

export async function updateOrderStatus(
  id: string,
  input: UpdateOrderStatusInput,
) {
  const previous = await Order.findById(id).select("status").lean();

  if (!previous) {
    throw ApiError.notFound("Order not found");
  }

  const updates: Record<string, unknown> = {};

  if (input.status !== undefined) {
    updates.status = input.status;
  }
  if (input.adminNotes !== undefined) {
    updates.adminNotes = input.adminNotes;
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest("No updates provided");
  }

  const order = await Order.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).lean();

  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  if (
    input.status === "confirmed" &&
    previous.status !== "confirmed"
  ) {
    notifyCustomerOrderConfirmed(toOrderEmailContext(order));
  }

  return toAdminOrderResponse(order);
}
