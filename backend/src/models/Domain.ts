import {
  Schema,
  model,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface IDomain {
  tenantId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  host: string;
  type: "subdomain" | "custom";
  status: "pending" | "active" | "failed";
  isPrimary: boolean;
  verifiedAt?: Date;
  sslStatus: "pending" | "active" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

export type IDomainDocument = IDomain & Document;

const domainSchema = new Schema<IDomainDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    host: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    type: {
      type: String,
      enum: ["subdomain", "custom"],
      required: true,
      default: "subdomain",
    },
    status: {
      type: String,
      enum: ["pending", "active", "failed"],
      required: true,
      default: "pending",
    },
    isPrimary: { type: Boolean, required: true, default: false },
    verifiedAt: { type: Date },
    sslStatus: {
      type: String,
      enum: ["pending", "active", "failed"],
      required: true,
      default: "pending",
    },
  },
  { timestamps: true },
);

domainSchema.index({ host: 1 }, { unique: true });
domainSchema.index({ workspaceId: 1 });

export const Domain: Model<IDomainDocument> = model<IDomainDocument>(
  "Domain",
  domainSchema,
);
