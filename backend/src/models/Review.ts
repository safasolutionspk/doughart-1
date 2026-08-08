import { Schema, model, type Document, type Model, type Types } from "mongoose";
import type { ImageDisplay } from "../types/imageDisplay";

export interface IReview {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  name: string;
  role?: string;
  rating: number;
  text: string;
  image?: string;
  /** Optional pan/zoom for review avatar circle. */
  imageDisplay?: ImageDisplay;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IReviewDocument = IReview & Document;

const reviewSchema = new Schema<IReviewDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant" },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    imageDisplay: {
      zoom: { type: Number, min: 1, max: 3 },
      x: { type: Number, min: -50, max: 50 },
      y: { type: Number, min: -50, max: 50 },
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

reviewSchema.index({ tenantId: 1 });
reviewSchema.index({ workspaceId: 1 });
reviewSchema.index({ tenantId: 1, workspaceId: 1 });

export const Review: Model<IReviewDocument> = model<IReviewDocument>(
  "Review",
  reviewSchema,
);
