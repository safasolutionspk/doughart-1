import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { DEFAULT_ITEM_TYPES, ITEM_TYPES, type ItemType } from "../constants/itemTypes";
import type { ImageDisplay } from "../types/imageDisplay";

export interface ICake {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  /** Optional pan/zoom for storefront card framing. Original image is preserved. */
  imageDisplay?: ImageDisplay;
  categoryId: Types.ObjectId;
  price: number;
  /** Multi-select product kinds. Legacy docs without this field behave as cake. */
  itemTypes?: ItemType[];
  isCustomizable: boolean;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICakeDocument = ICake & Document;

const cakeSchema = new Schema<ICakeDocument>(
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    itemTypes: {
      type: [
        {
          type: String,
          enum: ITEM_TYPES,
        },
      ],
      default: () => [...DEFAULT_ITEM_TYPES],
      validate: {
        validator(value: unknown) {
          if (!Array.isArray(value) || value.length === 0) {
            return false;
          }
          const unique = new Set(value);
          return unique.size === value.length;
        },
        message: "Select at least one item type with no duplicates",
      },
    },
    isCustomizable: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

cakeSchema.index({ categoryId: 1, isActive: 1 });
cakeSchema.index({ tenantId: 1 });
cakeSchema.index({ workspaceId: 1 });
cakeSchema.index({ tenantId: 1, workspaceId: 1 });
cakeSchema.index({ workspaceId: 1, slug: 1 });

export const Cake: Model<ICakeDocument> = model<ICakeDocument>("Cake", cakeSchema);
