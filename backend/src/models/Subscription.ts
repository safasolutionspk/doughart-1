import {
  Schema,
  model,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface ISubscription {
  tenantId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  planId: Types.ObjectId;
  status: "trialing" | "active" | "past_due" | "cancelled" | "expired";
  provider: "manual" | "stripe" | "paddle" | "local";
  externalSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEndsAt?: Date;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ISubscriptionDocument = ISubscription & Document;

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: ["trialing", "active", "past_due", "cancelled", "expired"],
      required: true,
      default: "trialing",
    },
    provider: {
      type: String,
      enum: ["manual", "stripe", "paddle", "local"],
      required: true,
      default: "manual",
    },
    externalSubscriptionId: { type: String, trim: true, maxlength: 160 },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    trialEndsAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);

subscriptionSchema.index({ tenantId: 1 });
subscriptionSchema.index({ workspaceId: 1 });
subscriptionSchema.index({ status: 1 });

export const Subscription: Model<ISubscriptionDocument> =
  model<ISubscriptionDocument>("Subscription", subscriptionSchema);
