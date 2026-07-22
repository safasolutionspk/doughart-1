import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type RequestSource = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: RequestSource = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(result.error);
    }

    if (source === "body") {
      req.body = result.data;
    } else if (source === "query") {
      req.validatedQuery = result.data as Record<string, unknown>;
    } else {
      req.validatedParams = result.data as Record<string, unknown>;
    }

    next();
  };
}
