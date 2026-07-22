import type { Types } from "mongoose";
import type { RequestTenantContext } from "./tenantContext";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
      customer?: {
        id: string;
        email: string;
        name: string;
        phone: string;
      };
      tenantContext?: RequestTenantContext;
      /** Set by validate() when source is "query" (Express 5 req.query is read-only). */
      validatedQuery?: Record<string, unknown>;
      /** Set by validate() when source is "params" (Express 5 req.params is read-only). */
      validatedParams?: Record<string, unknown>;
    }
  }
}

export {};
