import { Schema, model, type Document, type Model, type Types } from "mongoose";

export interface IBusinessSettings {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  businessName: string;
  tagline?: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  heroImage?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  deliveryInfo?: string;
  bankName?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankPaymentInstructions?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IBusinessSettingsDocument = IBusinessSettings & Document;

const businessSettingsSchema = new Schema<IBusinessSettingsDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant" },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    businessName: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    logo: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    deliveryInfo: { type: String, trim: true },
    bankName: { type: String, trim: true, maxlength: 120 },
    bankAccountTitle: { type: String, trim: true, maxlength: 120 },
    bankAccountNumber: { type: String, trim: true, maxlength: 80 },
    bankPaymentInstructions: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

businessSettingsSchema.index({ tenantId: 1 });
businessSettingsSchema.index({ workspaceId: 1 });
businessSettingsSchema.index({ tenantId: 1, workspaceId: 1 });

export const BusinessSettings: Model<IBusinessSettingsDocument> =
  model<IBusinessSettingsDocument>("BusinessSettings", businessSettingsSchema);
