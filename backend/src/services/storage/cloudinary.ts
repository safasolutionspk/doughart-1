import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env";
import { buildUploadFilename } from "../../utils/uploadFilename";
import type {
  GalleryFileEntry,
  IFileStorage,
  UploadFileInput,
  UploadFileResult,
} from "./types";

function configureCloudinary(): void {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function stripExtension(filename: string): string {
  const ext = path.extname(filename);
  return ext ? filename.slice(0, -ext.length) : filename;
}

export const cloudinaryFileStorage: IFileStorage = {
  provider: "cloudinary",

  async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    configureCloudinary();

    const multerLike = {
      originalname: input.originalFilename,
      mimetype: input.mimeType,
    } as Express.Multer.File;

    const generatedFilename = buildUploadFilename(multerLike);

    try {
      const result = await cloudinary.uploader.upload(input.filePath, {
        folder: env.CLOUDINARY_FOLDER,
        public_id: stripExtension(path.basename(generatedFilename)),
        resource_type: "image",
        overwrite: false,
      });

      await fs.unlink(input.filePath).catch(() => {
        // temp file may already be removed
      });

      const storedPath = result.secure_url;
      const deleteKey = result.public_id;

      return {
        storedPath,
        url: storedPath,
        deleteKey,
        filename: path.basename(deleteKey),
        size: result.bytes ?? input.size,
      };
    } catch (error) {
      await fs.unlink(input.filePath).catch(() => {});
      throw error;
    }
  },

  getPublicUrl(storedPath: string): string {
    return storedPath;
  },

  async deleteFile(deleteKey: string): Promise<void> {
    configureCloudinary();
    const publicId = deleteKey.includes("/")
      ? deleteKey
      : `${env.CLOUDINARY_FOLDER}/${deleteKey}`;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Cloudinary delete failed: ${result.result}`);
    }
  },

  async listGalleryFiles(): Promise<GalleryFileEntry[]> {
    configureCloudinary();

    const response = await cloudinary.api.resources({
      type: "upload",
      prefix: `${env.CLOUDINARY_FOLDER}/`,
      max_results: 500,
      resource_type: "image",
    });

    const resources = response.resources as Array<{
      public_id: string;
      secure_url: string;
      bytes: number;
      created_at: string;
    }>;

    return resources
      .map((resource) => ({
        filename: path.basename(resource.public_id),
        deleteKey: resource.public_id,
        size: resource.bytes,
        createdAt: new Date(resource.created_at).toISOString(),
        url: resource.secure_url,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  },
};
