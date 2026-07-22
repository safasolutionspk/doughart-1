import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { authenticateCustomer, optionalCustomer } from "./customerAuth";

/**
 * When REQUIRE_CUSTOMER_AUTH_FOR_ORDERS is enabled, customer JWT is required.
 * Otherwise attaches customer when present (optionalCustomer).
 */
export function requireCustomerForOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!env.REQUIRE_CUSTOMER_AUTH_FOR_ORDERS) {
    return optionalCustomer(req, res, next);
  }

  authenticateCustomer(req, res, (err) => {
    if (err) {
      return next(
        ApiError.unauthorized(
          "Please sign in or create an account to place your order.",
        ),
      );
    }
    next();
  });
}
