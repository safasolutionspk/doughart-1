import {
  Schema,
  model,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface IWorkspace {
  tenantId: Types.ObjectId;
  name: string;
  slug: string;
  status: "active" | "suspended";
  businessType: string;
  primaryDomain?: string;
  logo?: string;
  timezone?: string;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IWorkspaceDocument = IWorkspace & Document;

const workspaceSchema = new Schema<IWorkspaceDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
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
      enum: ["active", "suspended"],
      default: "active",
    },
    businessType: { type: String, required: true, trim: true, default: "bakery" },
    primaryDomain: { type: String, trim: true, lowercase: true },
    logo: { type: String, trim: true },
    timezone: { type: String, trim: true, default: "Asia/Karachi" },
    currency: { type: String, trim: true, uppercase: true, default: "PKR" },
  },
  { timestamps: true },
);

workspaceSchema.index({ tenantId: 1 });
workspaceSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
workspaceSchema.index(
  { primaryDomain: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { primaryDomain: { $type: "string" } },
  },
);

export const Workspace: Model<IWorkspaceDocument> = model<IWorkspaceDocument>(
  "Workspace",
  workspaceSchema,
);
