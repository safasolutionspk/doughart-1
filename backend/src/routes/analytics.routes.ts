import { Router } from "express";
import {
  getDashboardAnalytics,
  listPopularCakes,
} from "../controllers/analytics.controller";
import {
  getEmailSummary,
  listEmailAttempts,
} from "../controllers/emailAnalytics.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { adminWriteLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { listAdminPopularCakesQuerySchema } from "../validators/cake.validator";
import { listEmailAttemptsQuerySchema } from "../validators/emailAnalytics.validator";

const router = Router();

router.get(
  "/dashboard",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  getDashboardAnalytics,
);

router.get(
  "/popular-cakes",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  validate(listAdminPopularCakesQuerySchema, "query"),
  listPopularCakes,
);

router.get(
  "/emails/summary",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  getEmailSummary,
);

router.get(
  "/emails/attempts",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  validate(listEmailAttemptsQuerySchema, "query"),
  listEmailAttempts,
);

export default router;
