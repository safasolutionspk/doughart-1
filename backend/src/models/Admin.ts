import { Schema, model, type Document, type Model } from "mongoose";

export interface IAdmin {
  email: string;
  password: string;
  name: string;
  role: "super_admin" | "admin";
  isActive: boolean;
}

export type IAdminDocument = IAdmin & Document;

const adminSchema = new Schema<IAdminDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["super_admin", "admin"],
      default: "admin",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Admin: Model<IAdminDocument> = model<IAdminDocument>(
  "Admin",
  adminSchema,
);
