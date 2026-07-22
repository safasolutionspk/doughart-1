import fs from "fs/promises";
import path from "path";
import {
  UPLOAD_DIR,
  buildPublicImageUrl,
  isAllowedImageFilename,
  resolveUploadFilePath,
} from "../../config/upload";
import type {
  GalleryFileEntry,
  IFileStorage,
  UploadFileInput,
  UploadFileResult,
} from "./types";

export const localFileStorage: IFileStorage = {
  provider: "local",

  async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    const filename = path.basename(input.filePath);
    const storedPath = buildPublicImageUrl(filename);
    const url = storedPath;

    return {
      storedPath,
      url,
      deleteKey: filename,
      filename,
      size: input.size,
    };
  },

  getPublicUrl(storedPath: string): string {
    if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
      return storedPath;
    }
    if (storedPath.startsWith("/uploads/images/")) {
      return storedPath;
    }
    return buildPublicImageUrl(path.basename(storedPath));
  },

  resolveFilePath(filename: string): string {
    return resolveUploadFilePath(filename);
  },

  async listGalleryFiles(): Promise<GalleryFileEntry[]> {
    let entries: { name: string; isFile: () => boolean }[];
    try {
      const dirents = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });
      entries = dirents.map((entry) => ({
        name: String(entry.name),
        isFile: () => entry.isFile(),
      }));
    } catch {
      return [];
    }

    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && isAllowedImageFilename(entry.name))
        .map(async (entry) => {
          const filePath = path.join(UPLOAD_DIR, entry.name);
          const stat = await fs.stat(filePath);
          const url = buildPublicImageUrl(entry.name);
          return {
            filename: entry.name,
            deleteKey: entry.name,
            size: stat.size,
            createdAt: stat.birthtime.toISOString(),
            url,
          } satisfies GalleryFileEntry;
        }),
    );

    return files.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async deleteFile(deleteKey: string): Promise<void> {
    await fs.unlink(resolveUploadFilePath(deleteKey));
  },
};
