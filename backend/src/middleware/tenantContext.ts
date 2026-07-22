import type { NextFunction, Request, Response } from "express";
import { resolveTenantContext } from "../services/tenantContext.service";

function getRequestHost(req: Request): string | undefined {
  const forwardedHost = req.headers["x-forwarded-host"];

  if (typeof forwardedHost === "string" && forwardedHost.trim().length > 0) {
    return forwardedHost;
  }

  if (Array.isArray(forwardedHost) && forwardedHost.length > 0) {
    const first = forwardedHost[0]?.trim();
    return first && first.length > 0 ? first : undefined;
  }

  const hostHeader = req.headers.host?.trim();
  return hostHeader && hostHeader.length > 0 ? hostHeader : undefined;
}

export async function attachTenantContext(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    req.tenantContext = await resolveTenantContext({
      host: getRequestHost(req),
    });
    next();
  } catch {
    req.tenantContext = {
      source: "default",
      isResolved: false,
      host: getRequestHost(req),
    };
    next();
  }
}
