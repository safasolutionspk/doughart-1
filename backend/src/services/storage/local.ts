import fs from "fs/promises";
import path from "path";
import {
  GALLERY_PUBLIC_PREFIX,
  GALLERY_STORAGE_KEY_PREFIX,
  UPLOAD_DIR,
  buildPublicGalleryImageUrl,
  buildPublicImageUrl,
  ensureGalleryUploadDir,
  isAllowedImageFilename,
  resolveGalleryUploadFilePath,
  resolveUploadFilePath,
} from "../../config/upload";
import type {
  GalleryFileEntry,
  IFileStorage,
  UploadFileInput,
  UploadFileResult,
} from "./types";

async function moveIntoGalleryDir(sourcePath: string, filename: string): Promise<string> {
  ensureGalleryUploadDir();
  const destPath = resolveGalleryUploadFilePath(filename);

  if (path.resolve(sourcePath) === destPath) {
    return destPath;
  }

  try {
    await fs.rename(sourcePath, destPath);
  } catch {
    await fs.copyFile(sourcePath, destPath);
    await fs.unlink(sourcePath).catch(() => {
      // temp file may already be gone
    });
  }

  return destPath;
}

export const localFileStorage: IFileStorage = {
  provider: "local",

  async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    const filename = path.basename(input.filePath);

    if (input.namespace === "gallery") {
      await moveIntoGalleryDir(input.filePath, filename);
      const storedPath = buildPublicGalleryImageUrl(filename);

      return {
        storedPath,
        url: storedPath,
        deleteKey: `${GALLERY_STORAGE_KEY_PREFIX}${filename}`,
        filename,
        size: input.size,
      };
    }

    const storedPath = buildPublicImageUrl(filename);

    return {
      storedPath,
      url: storedPath,
      deleteKey: filename,
      filename,
      size: input.size,
    };
  },

  getPublicUrl(storedPath: string): string {
    if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
      return storedPath;
    }
    if (storedPath.startsWith(GALLERY_PUBLIC_PREFIX)) {
      return storedPath;
    }
    if (storedPath.startsWith("/uploads/images/")) {
      return storedPath;
    }
    return buildPublicImageUrl(path.basename(storedPath));
  },

  resolveFilePath(filename: string): string {
    if (filename.startsWith(GALLERY_STORAGE_KEY_PREFIX)) {
      return resolveGalleryUploadFilePath(
        filename.slice(GALLERY_STORAGE_KEY_PREFIX.length),
      );
    }
    return resolveUploadFilePath(filename);
  },

  async listGalleryFiles(): Promise<GalleryFileEntry[]> {
    // Legacy mixed listing of shared catalog uploads only.
    // Dedicated Gallery uses MongoDB GalleryImage records.
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
    if (deleteKey.startsWith(GALLERY_STORAGE_KEY_PREFIX)) {
      const filename = path.basename(deleteKey.slice(GALLERY_STORAGE_KEY_PREFIX.length));
      await fs.unlink(resolveGalleryUploadFilePath(filename));
      return;
    }

    await fs.unlink(resolveUploadFilePath(deleteKey));
  },
};
