import { Schema, model, type Document, type Model } from "mongoose";

export interface IPlanLimits {
  maxProducts: number;
  maxOrdersPerMonth: number;
  maxStaffUsers: number;
  maxStorageMb: number;
}

export interface IPlanFeatures {
  customDomain: boolean;
  advancedAnalytics: boolean;
  onlinePayments: boolean;
  aiTools: boolean;
}

export interface IPlan {
  code: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  limits: IPlanLimits;
  features: IPlanFeatures;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IPlanDocument = IPlan & Document;

const planLimitsSchema = new Schema<IPlanLimits>(
  {
    maxProducts: { type: Number, required: true, min: 0, default: 0 },
    maxOrdersPerMonth: { type: Number, required: true, min: 0, default: 0 },
    maxStaffUsers: { type: Number, required: true, min: 0, default: 0 },
    maxStorageMb: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const planFeaturesSchema = new Schema<IPlanFeatures>(
  {
    customDomain: { type: Boolean, required: true, default: false },
    advancedAnalytics: { type: Boolean, required: true, default: false },
    onlinePayments: { type: Boolean, required: true, default: false },
    aiTools: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

const planSchema = new Schema<IPlanDocument>(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 80,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    monthlyPrice: { type: Number, required: true, min: 0, default: 0 },
    yearlyPrice: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, required: true, uppercase: true, trim: true, default: "PKR" },
    limits: { type: planLimitsSchema, required: true, default: () => ({}) },
    features: { type: planFeaturesSchema, required: true, default: () => ({}) },
    isActive: { type: Boolean, required: true, default: true },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

planSchema.index({ code: 1 }, { unique: true });

export const Plan: Model<IPlanDocument> = model<IPlanDocument>("Plan", planSchema);
