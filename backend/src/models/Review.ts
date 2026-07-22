import { Schema, model, type Document, type Model, type Types } from "mongoose";

export interface IReview {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  name: string;
  role?: string;
  rating: number;
  text: string;
  image?: string;
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
