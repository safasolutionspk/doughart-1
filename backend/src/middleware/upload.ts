import type { Request } from "express";
import multer from "multer";
import {
  UPLOAD_DIR,
  UPLOAD_MAX_FILE_SIZE,
  ensureUploadDir,
  isUploadAcceptedByMulter,
} from "../config/upload";
import { ApiError } from "../utils/ApiError";
import { unsupportedImageTypeMessage } from "../utils/imageValidation";
import { buildUploadFilename } from "../utils/uploadFilename";

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    ensureUploadDir();
    callback(null, UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    callback(null, buildUploadFilename(file));
  },
});

function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) {
  if (isUploadAcceptedByMulter(file.mimetype, file.originalname)) {
    callback(null, true);
    return;
  }

  callback(ApiError.badRequest(unsupportedImageTypeMessage()));
}

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: UPLOAD_MAX_FILE_SIZE,
    files: 1,
    fields: 0,
    parts: 2,
    fieldNameSize: 100,
    fieldSize: 1024,
  },
});
