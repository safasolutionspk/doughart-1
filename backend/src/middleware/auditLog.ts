import type { NextFunction, Request, Response } from "express";
import { safeAuditLog } from "../utils/safeLog";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function auditLog(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    if (!req.admin || !MUTATING_METHODS.has(req.method)) {
      return;
    }

    if (res.statusCode >= 400) {
      return;
    }

    safeAuditLog({
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ip: req.ip,
      userAgent: req.get("user-agent") ?? "unknown",
      at: new Date().toISOString(),
    });
  });

  next();
}
