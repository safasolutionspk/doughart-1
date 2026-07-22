import {
  Schema,
  model,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface IMembership {
  tenantId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  userType: "admin";
  adminId: Types.ObjectId;
  role: "owner" | "admin" | "manager" | "staff" | "readonly";
  status: "active" | "invited" | "suspended";
  invitedBy?: Types.ObjectId;
  invitedAt?: Date;
  joinedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IMembershipDocument = IMembership & Document;

const membershipSchema = new Schema<IMembershipDocument>(
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
      index: true,
    },
    userType: {
      type: String,
      enum: ["admin"],
      required: true,
      default: "admin",
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "staff", "readonly"],
      required: true,
      default: "staff",
    },
    status: {
      type: String,
      enum: ["active", "invited", "suspended"],
      required: true,
      default: "invited",
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    invitedAt: { type: Date },
    joinedAt: { type: Date },
  },
  { timestamps: true },
);

membershipSchema.index({ tenantId: 1, workspaceId: 1 });
membershipSchema.index({ adminId: 1 });
membershipSchema.index({ workspaceId: 1, adminId: 1 }, { unique: true });

export const Membership: Model<IMembershipDocument> = model<IMembershipDocument>(
  "Membership",
  membershipSchema,
);
