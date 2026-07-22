import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Admin } from "../models";
import { ApiError } from "../utils/ApiError";

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

const ADMIN_ROLES = new Set(["admin", "super_admin"]);

export function authenticateAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing or invalid authorization token"));
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (!ADMIN_ROLES.has(decoded.role)) {
      return next(ApiError.unauthorized("Missing or invalid authorization token"));
    }

    Admin.findById(decoded.sub)
      .select("_id email name role isActive")
      .then((admin) => {
        if (!admin || !admin.isActive) {
          return next(ApiError.unauthorized("Invalid or inactive admin account"));
        }

        req.admin = {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };

        next();
      })
      .catch(next);
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function signAdminToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}
