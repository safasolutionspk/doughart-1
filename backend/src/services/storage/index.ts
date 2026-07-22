import { env } from "../../config/env";
import { cloudinaryFileStorage } from "./cloudinary";
import { localFileStorage } from "./local";
import type { IFileStorage } from "./types";

export type {
  GalleryFileEntry,
  IFileStorage,
  UploadFileInput,
  UploadFileResult,
  UploadProviderName,
} from "./types";

export function getFileStorage(): IFileStorage {
  switch (env.UPLOAD_PROVIDER) {
    case "local":
      return localFileStorage;
    case "cloudinary":
      return cloudinaryFileStorage;
    case "s3":
      throw new Error(
        "S3 upload provider is not implemented yet. Use UPLOAD_PROVIDER=local or cloudinary.",
      );
    default:
      return localFileStorage;
  }
}

export function isLocalUploadProvider(): boolean {
  return env.UPLOAD_PROVIDER === "local";
}
