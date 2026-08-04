import { Schema, model, type Document, type Model, type Types } from "mongoose";

export const EMAIL_TYPES = [
  "owner_order_created",
  "customer_order_created",
  "customer_order_confirmed",
  "customer_quote_ready",
  "contact_owner_notification",
  "customer_password_reset",
] as const;

export type EmailType = (typeof EMAIL_TYPES)[number];

export const EMAIL_AUDIENCES = ["owner", "customer"] as const;
export type EmailAudience = (typeof EMAIL_AUDIENCES)[number];

export const EMAIL_ATTEMPT_STATUSES = [
  "pending",
  "sent",
  "failed",
  "skipped",
] as const;
export type EmailAttemptStatus = (typeof EMAIL_ATTEMPT_STATUSES)[number];

export const EMAIL_REASON_CODES = [
  "missing_email",
  "invalid_email",
  "email_disabled",
  "duplicate_attempt",
  "provider_unavailable",
  "smtp_rejected",
  "smtp_timeout",
  "configuration_missing",
  "unknown_send_failure",
] as const;
export type EmailReasonCode = (typeof EMAIL_REASON_CODES)[number];

export const EMAIL_PROVIDERS = ["smtp", "console", "noop"] as const;
export type EmailProviderName = (typeof EMAIL_PROVIDERS)[number];

export interface IEmailAttempt {
  attemptKey: string;
  emailType: EmailType;
  audience: EmailAudience;
  relatedOrderId?: Types.ObjectId;
  relatedContactId?: Types.ObjectId;
  relatedCustomerId?: Types.ObjectId;
  orderNumber?: string;
  recipientMasked?: string;
  status: EmailAttemptStatus;
  reasonCode?: EmailReasonCode;
  provider: EmailProviderName;
  attemptedAt: Date;
  sentAt?: Date;
  failedAt?: Date;
  skippedAt?: Date;
  retryCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IEmailAttemptDocument = IEmailAttempt & Document;

const emailAttemptSchema = new Schema<IEmailAttemptDocument>(
  {
    attemptKey: { type: String, required: true, trim: true },
    emailType: { type: String, required: true, enum: EMAIL_TYPES },
    audience: { type: String, required: true, enum: EMAIL_AUDIENCES },
    relatedOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
    relatedContactId: { type: Schema.Types.ObjectId },
    relatedCustomerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    orderNumber: { type: String, trim: true, maxlength: 64 },
    recipientMasked: { type: String, trim: true, maxlength: 120 },
    status: {
      type: String,
      required: true,
      enum: EMAIL_ATTEMPT_STATUSES,
      default: "pending",
    },
    reasonCode: { type: String, enum: EMAIL_REASON_CODES },
    provider: {
      type: String,
      required: true,
      enum: EMAIL_PROVIDERS,
      default: "noop",
    },
    attemptedAt: { type: Date, required: true, default: Date.now },
    sentAt: { type: Date },
    failedAt: { type: Date },
    skippedAt: { type: Date },
    retryCount: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

emailAttemptSchema.index({ attemptKey: 1 }, { unique: true });
emailAttemptSchema.index({ createdAt: -1 });
emailAttemptSchema.index({ status: 1, createdAt: -1 });
emailAttemptSchema.index({ emailType: 1, createdAt: -1 });
emailAttemptSchema.index({ audience: 1, createdAt: -1 });
emailAttemptSchema.index({ orderNumber: 1, createdAt: -1 });

export const EmailAttempt: Model<IEmailAttemptDocument> =
  model<IEmailAttemptDocument>("EmailAttempt", emailAttemptSchema);
