import { Schema, model, type Document, type Model, type Types } from "mongoose";
import type { PaymentGateway, PaymentMethod, PaymentStatus } from "../types/payment";
import { PAYMENT_GATEWAYS, PAYMENT_METHODS, PAYMENT_STATUSES } from "../types/payment";
import { ORDER_STATUSES, type OrderStatus } from "../types/orderStatus";

export interface IOrderItem {
  cakeId?: Types.ObjectId;
  cakeName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface IOrder {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  orderNumber: string;
  customerId?: Types.ObjectId;
  customerName: string;
  customerEmail: string;
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
  paymentStatus: PaymentStatus;
  paymentGateway?: PaymentGateway;
  transactionId?: string;
  proofImage?: string;
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

const orderItemSchema = new Schema<IOrderItem>(
  {
    cakeId: { type: Schema.Types.ObjectId, ref: "Cake" },
    cakeName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0, default: 0 },
    notes: { type: String, trim: true },
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
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
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
      default: "online_payment_full",
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      required: true,
      default: "pending",
    },
    paymentGateway: {
      type: String,
      enum: PAYMENT_GATEWAYS,
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
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ customerPhone: 1, orderNumber: 1 });
orderSchema.index({ tenantId: 1 });
orderSchema.index({ workspaceId: 1 });
orderSchema.index({ tenantId: 1, workspaceId: 1 });

export const Order: Model<IOrderDocument> = model<IOrderDocument>(
  "Order",
  orderSchema,
);
