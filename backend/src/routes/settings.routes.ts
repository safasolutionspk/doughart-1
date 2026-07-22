import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { adminWriteLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { updateSettingsSchema } from "../validators/settings.validator";

const router = Router();

router.get("/", getSettings);

router.patch(
  "/",
  authenticateAdmin,
  auditLog,
  adminWriteLimiter,
  validate(updateSettingsSchema),
  updateSettings,
);

export default router;
