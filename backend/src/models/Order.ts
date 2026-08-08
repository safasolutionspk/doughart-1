import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { ITEM_TYPES, type ItemType } from "../constants/itemTypes";
import type { PaymentGateway, PaymentMethod, PaymentStatus } from "../types/payment";
import { PAYMENT_GATEWAYS, PAYMENT_METHODS, PAYMENT_STATUSES } from "../types/payment";
import { ORDER_STATUSES, type OrderStatus } from "../types/orderStatus";

export type OrderCakeDetails = {
  pounds?: string;
  flavor?: string;
  messageOnCake?: string;
  notes?: string;
};

export type OrderGiftDetails = {
  notes?: string;
};

export type OrderProductDetails = {
  notes?: string;
};

export interface IOrderItem {
  cakeId?: Types.ObjectId;
  cakeName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  /** Snapshot of catalog category slug at order time (e.g. combo-offers). */
  categorySlug?: string;
  /** Snapshot of product item types at order time. */
  itemTypes?: ItemType[];
  cakeDetails?: OrderCakeDetails;
  giftDetails?: OrderGiftDetails;
  productDetails?: OrderProductDetails;
}

export interface IOrder {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  orderNumber: string;
  customerId?: Types.ObjectId;
  customerName: string;
  /** Optional — phone is the primary contact method */
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress?: string;
  eventDate?: Date;
  cakeType: string;
  cakeSize?: string;
  flavour?: string;
  filling?: string;
  designNotes?: string;
  messageOnCake?: string;
  specialInstructions?: string;
  items: IOrderItem[];
  totalAmount: number;
  /** Admin-set final price for custom cake quotes */
  quotedAmount?: number;
  quoteNotes?: string;
  paymentMethod: PaymentMethod;
  /** Historical only — no longer written or required on new orders. */
  paymentStatus?: PaymentStatus;
  /** Historical only — no longer written on new orders. */
  paymentGateway?: PaymentGateway;
  /** Historical only — no longer written via API. */
  transactionId?: string;
  /** Historical only — bank-transfer proof era. */
  proofImage?: string;
  /** Historical only — no longer written via API. */
  gatewayResponse?: Record<string, unknown>;

  status: OrderStatus;
  adminNotes?: string;
  /** False for new orders until admin views the relevant orders page */
  adminSeen?: boolean;
  adminSeenAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IOrderDocument = IOrder & Document;

const cakeDetailsSchema = new Schema<OrderCakeDetails>(
  {
    pounds: { type: String, trim: true, maxlength: 80 },
    flavor: { type: String, trim: true, maxlength: 120 },
    messageOnCake: { type: String, trim: true, maxlength: 200 },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const giftDetailsSchema = new Schema<OrderGiftDetails>(
  {
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const productDetailsSchema = new Schema<OrderProductDetails>(
  {
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    cakeId: { type: Schema.Types.ObjectId, ref: "Cake" },
    cakeName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0, default: 0 },
    notes: { type: String, trim: true },
    categorySlug: { type: String, trim: true, lowercase: true },
    itemTypes: {
      type: [
        {
          type: String,
          enum: ITEM_TYPES,
        },
      ],
    },
    cakeDetails: { type: cakeDetailsSchema },
    giftDetails: { type: giftDetailsSchema },
    productDetails: { type: productDetailsSchema },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrderDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant" },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    orderNumber: { type: String, required: true, unique: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    customerPhone: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, trim: true },
    eventDate: { type: Date },
    cakeType: { type: String, required: true, trim: true },
    cakeSize: { type: String, trim: true },
    flavour: { type: String, trim: true },
    filling: { type: String, trim: true },
    designNotes: { type: String, trim: true },
    messageOnCake: { type: String, trim: true },
    specialInstructions: { type: String, trim: true },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0, default: 0 },
    quotedAmount: { type: Number, min: 0 },
    quoteNotes: { type: String, trim: true, maxlength: 500 },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
      default: "cash_on_delivery",
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      required: false,
    },
    paymentGateway: {
      type: String,
      enum: PAYMENT_GATEWAYS,
      required: false,
    },
    transactionId: { type: String, trim: true, maxlength: 120 },
    proofImage: { type: String, trim: true, maxlength: 500 },
    gatewayResponse: { type: Schema.Types.Mixed },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    adminNotes: { type: String, trim: true },
    adminSeen: { type: Boolean, default: undefined },
    adminSeenAt: { type: Date },
  },
  { timestamps: true },
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ status: 1, paymentStatus: 1, "items.cakeId": 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ customerPhone: 1, orderNumber: 1 });
orderSchema.index({ tenantId: 1 });
orderSchema.index({ workspaceId: 1 });
orderSchema.index({ tenantId: 1, workspaceId: 1 });

export const Order: Model<IOrderDocument> = model<IOrderDocument>(
  "Order",
  orderSchema,
);
