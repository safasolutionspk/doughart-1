import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analytics.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { adminWriteLimiter } from "../middleware/rateLimiter";

const router = Router();

router.get(
  "/dashboard",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  getDashboardAnalytics,
);

export default router;
