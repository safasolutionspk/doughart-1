import { Schema, model, type Document, type Model } from "mongoose";

export type GalleryStorageProvider = "local" | "cloudinary" | "s3";

export interface IGalleryImage {
  filename: string;
  url: string;
  /** Provider delete key — never expose on public API */
  storageKey: string;
  storageProvider: GalleryStorageProvider;
  size: number;
  mimeType?: string;
  width?: number;
  height?: number;
  altText?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IGalleryImageDocument = IGalleryImage & Document;

const galleryImageSchema = new Schema<IGalleryImageDocument>(
  {
    filename: { type: String, required: true, trim: true, maxlength: 255 },
    url: { type: String, required: true, trim: true, maxlength: 1000 },
    storageKey: { type: String, required: true, trim: true, maxlength: 500 },
    storageProvider: {
      type: String,
      required: true,
      enum: ["local", "cloudinary", "s3"],
    },
    size: { type: Number, required: true, min: 0 },
    mimeType: { type: String, trim: true, maxlength: 100 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    altText: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true },
);

galleryImageSchema.index({ createdAt: -1 });
galleryImageSchema.index({ storageKey: 1 }, { unique: true });

export const GalleryImage: Model<IGalleryImageDocument> = model<IGalleryImageDocument>(
  "GalleryImage",
  galleryImageSchema,
);
