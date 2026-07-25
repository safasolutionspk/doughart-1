export type GalleryFileEntry = {
  /** Display name (basename for local, tail of public_id for Cloudinary) */
  filename: string;
  /** Provider-specific key passed to deleteFile */
  deleteKey: string;
  size: number;
  createdAt: string;
  url: string;
};

export type StorageNamespace = "default" | "gallery";

export type UploadFileInput = {
  /** Absolute path to validated temp file on disk */
  filePath: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  /**
   * Storage namespace.
   * - `default`: shared catalog uploads (products, categories, settings, reviews)
   * - `gallery`: dedicated public Gallery only
   */
  namespace?: StorageNamespace;
};

export type UploadFileResult = {
  /** Value persisted in MongoDB */
  storedPath: string;
  /** Client-facing URL */
  url: string;
  /** Identifier for deleteFile */
  deleteKey: string;
  filename: string;
  size: number;
};

export type UploadProviderName = "local" | "cloudinary" | "s3";

export interface IFileStorage {
  readonly provider: UploadProviderName;
  uploadFile(input: UploadFileInput): Promise<UploadFileResult>;
  deleteFile(deleteKey: string): Promise<void>;
  getPublicUrl(storedPath: string): string;
  /**
   * @deprecated Mixed shared-storage listing. Do not use for public Gallery.
   * Dedicated Gallery records live in MongoDB (`GalleryImage`).
   */
  listGalleryFiles(): Promise<GalleryFileEntry[]>;
  /** Local disk only — resolve absolute path for existence checks */
  resolveFilePath?(filename: string): string;
}
