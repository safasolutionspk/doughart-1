import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { UPLOAD_MAX_FILE_SIZE } from "../config/upload";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { safeErrorLog } from "../utils/safeLog";

export { safeNotFoundHandler as notFoundHandler } from "./security";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? `Image must be ${Math.round(UPLOAD_MAX_FILE_SIZE / (1024 * 1024))}MB or smaller`
        : err.message;
    return res.status(400).json({ success: false, message });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message:
        env.NODE_ENV === "production"
          ? "Validation failed"
          : err.message,
    });
  }

  safeErrorLog("Unhandled error", err, {
    path: _req.originalUrl,
    method: _req.method,
  });

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
