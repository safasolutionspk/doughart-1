import { Router } from "express";
import {
  getDashboardAnalytics,
  listPopularCakes,
} from "../controllers/analytics.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { adminWriteLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { listAdminPopularCakesQuerySchema } from "../validators/cake.validator";

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

export default router;
