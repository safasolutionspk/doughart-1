import { Schema, model, type Document, type Model, type Types } from "mongoose";

export interface ICustomer {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  isActive: boolean;
}

export type ICustomerDocument = ICustomer & Document;

const customerSchema = new Schema<ICustomerDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant" },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    passwordHash: { type: String, required: true, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

customerSchema.index({ tenantId: 1 });
customerSchema.index({ workspaceId: 1 });
customerSchema.index({ tenantId: 1, workspaceId: 1 });

export const Customer: Model<ICustomerDocument> = model<ICustomerDocument>(
  "Customer",
  customerSchema,
);
