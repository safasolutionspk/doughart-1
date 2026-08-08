import { Schema, model, type Document, type Model, type Types } from "mongoose";
import type { ImageDisplay } from "../types/imageDisplay";

export interface ICategory {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  /** Optional pan/zoom for storefront category circle framing. */
  imageDisplay?: ImageDisplay;
  isActive: boolean;
  sortOrder: number;
  /** Built-in category: name/slug/active locked; not deletable. */
  isSystem: boolean;
  /** Stable system identity (e.g. combo_offers). Optional for normal categories. */
  systemKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICategoryDocument = ICategory & Document;

const categorySchema = new Schema<ICategoryDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant" },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    imageDisplay: {
      zoom: { type: Number, min: 1, max: 3 },
      x: { type: Number, min: -50, max: 50 },
      y: { type: Number, min: -50, max: 50 },
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    isSystem: { type: Boolean, default: false },
    systemKey: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true },
);

categorySchema.index({ tenantId: 1 });
categorySchema.index({ workspaceId: 1 });
categorySchema.index({ tenantId: 1, workspaceId: 1 });
categorySchema.index({ workspaceId: 1, slug: 1 });

export const Category: Model<ICategoryDocument> = model<ICategoryDocument>(
  "Category",
  categorySchema,
);
