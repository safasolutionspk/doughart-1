import crypto from "crypto";
import path from "path";
import {
  extensionFromMimeType,
  getExtensionFromFilename,
  isAllowedDeclaredMimeType,
  isAllowedImageExtension,
  isGenericUploadMimeType,
  normalizeDeclaredMimeType,
} from "../config/upload";

type UploadFileMeta = {
  originalname: string;
  mimetype: string;
};

export function buildUploadFilename(file: UploadFileMeta): string {
  const ext = resolveUploadExtension(file);
  const id = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
  return `${id}${ext}`;
}

function resolveUploadExtension(file: UploadFileMeta): string {
  const fromName = getExtensionFromFilename(file.originalname || "");
  if (fromName && isAllowedImageExtension(fromName)) {
    return fromName === ".jpeg" ? ".jpg" : fromName;
  }

  if (isGenericUploadMimeType(file.mimetype)) {
    return "";
  }

  const normalizedMime = normalizeDeclaredMimeType(file.mimetype);
  if (isAllowedDeclaredMimeType(normalizedMime)) {
    return extensionFromMimeType(normalizedMime) ?? "";
  }

  return path.extname(file.originalname || "").toLowerCase();
}
