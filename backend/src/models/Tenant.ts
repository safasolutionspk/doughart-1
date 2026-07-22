import { Schema, model, type Document, type Model } from "mongoose";

export interface ITenant {
  name: string;
  slug: string;
  status: "active" | "suspended" | "cancelled";
  ownerEmail: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ITenantDocument = ITenant & Document;

const tenantSchema = new Schema<ITenantDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "cancelled"],
      default: "active",
    },
    ownerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
  },
  { timestamps: true },
);

tenantSchema.index({ slug: 1 }, { unique: true });

export const Tenant: Model<ITenantDocument> = model<ITenantDocument>(
  "Tenant",
  tenantSchema,
);
