import rateLimit from "express-rate-limit";

/** Local/dev: never throttle — login retries and dashboard polling must not lock you out. */
const skipOutsideProduction = () => process.env.NODE_ENV !== "production";

/** Admin + customer login must never be rate-limited (any environment). */
function isLoginRequest(req: { originalUrl?: string; path?: string }): boolean {
  const url = req.originalUrl ?? req.path ?? "";
  return (
    url.startsWith("/api/auth/login") ||
    url.startsWith("/api/customers/login") ||
    req.path === "/api/auth/login" ||
    req.path === "/api/customers/login" ||
    req.path === "/login"
  );
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => skipOutsideProduction() || isLoginRequest(req),
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

export const customerAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProduction,
  message: {
    success: false,
    message: "Too many attempts, please try again later",
  },
});

export const orderCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProduction,
  message: {
    success: false,
    message: "Too many order submissions, please try again later",
  },
});

export const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProduction,
  message: {
    success: false,
    message: "Too many subscription attempts, please try again later",
  },
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProduction,
  message: {
    success: false,
    message: "Too many contact submissions, please try again later",
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProduction,
  message: {
    success: false,
    message: "Too many uploads, please try again later",
  },
});

export const adminWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProduction,
  message: {
    success: false,
    message: "Too many admin requests, please try again later",
  },
});
