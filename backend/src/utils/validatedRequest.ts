import type { Request } from "express";

export function getValidatedQuery<T>(req: Request): T {
  return (req.validatedQuery ?? req.query) as T;
}

export function getValidatedParam(req: Request, key: string): string {
  const value = req.validatedParams?.[key] ?? req.params[key];
  return String(value);
}
