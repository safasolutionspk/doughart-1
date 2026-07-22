import { Schema, model, type Document, type Model, type Types } from "mongoose";

export interface ICategory {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
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
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
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
