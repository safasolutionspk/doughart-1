import { Schema, model, type Document, type Model, type Types } from "mongoose";

export interface ICake {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  categoryId: Types.ObjectId;
  price: number;
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
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
