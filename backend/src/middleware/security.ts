import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export function rejectUnknownApiContentType(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) {
    return next();
  }

  const contentType = req.headers["content-type"] ?? "";

  if (contentType.startsWith("multipart/form-data")) {
    return next();
  }

  if (contentType.startsWith("application/json") || contentType === "") {
    return next();
  }

  return next(ApiError.badRequest("Unsupported content type"));
}

export function safeNotFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (env.NODE_ENV === "production") {
    return next(ApiError.notFound("Resource not found"));
  }

  return next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
