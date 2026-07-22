export type UploadedImage = {
  filename: string;
  /** Local path (`/uploads/images/...`) or full CDN URL (Cloudinary) */
  path: string;
  url: string;
  /** Provider delete key (filename or Cloudinary public_id) */
  deleteKey?: string;
  size: number;
};

export type GalleryImage = UploadedImage & {
  createdAt: string;
  deleteKey: string;
};
