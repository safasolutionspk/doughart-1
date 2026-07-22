import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Customer } from "../models";
import { ApiError } from "../utils/ApiError";

export const CUSTOMER_JWT_ROLE = "customer";

type CustomerJwtPayload = {
  sub: string;
  email: string;
  role: typeof CUSTOMER_JWT_ROLE;
};

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

function verifyCustomerJwt(token: string): CustomerJwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  }) as CustomerJwtPayload;

  if (decoded.role !== CUSTOMER_JWT_ROLE) {
    throw new Error("Invalid role");
  }

  return decoded;
}

export function signCustomerToken(payload: {
  sub: string;
  email: string;
}): string {
  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      role: CUSTOMER_JWT_ROLE,
    },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions,
  );
}

async function attachCustomerFromToken(
  req: Request,
  token: string,
): Promise<boolean> {
  const decoded = verifyCustomerJwt(token);
  const customer = await Customer.findById(decoded.sub).select(
    "_id email name phone isActive",
  );

  if (!customer || !customer.isActive) {
    return false;
  }

  req.customer = {
    id: customer._id.toString(),
    email: customer.email,
    name: customer.name,
    phone: customer.phone,
  };

  return true;
}

export function authenticateCustomer(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = extractBearerToken(req);

  if (!token) {
    return next(ApiError.unauthorized("Missing or invalid authorization token"));
  }

  attachCustomerFromToken(req, token)
    .then((ok) => {
      if (!ok) {
        return next(ApiError.unauthorized("Invalid or inactive customer account"));
      }
      next();
    })
    .catch(() => {
      next(ApiError.unauthorized("Invalid or expired token"));
    });
}

export function optionalCustomer(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  attachCustomerFromToken(req, token)
    .then(() => next())
    .catch(() => next());
}
