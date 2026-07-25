export type UploadedImage = {
  filename: string;
  /** Local path (`/uploads/images/...`) or full CDN URL (Cloudinary) */
  path: string;
  url: string;
  /** Provider delete key (filename or Cloudinary public_id) */
  deleteKey?: string;
  size: number;
};

/** Dedicated GalleryImage record from the Gallery API (no storageKey). */
export type GalleryImage = {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType?: string;
  altText?: string;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt?: string;
};
