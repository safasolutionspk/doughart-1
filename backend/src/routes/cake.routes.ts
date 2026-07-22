import { Router } from "express";
import {
  createCake,
  deleteCake,
  getCake,
  getPublicCakeBySlug,
  listCakes,
  listPublicCakes,
  listPublicPopularCakes,
  updateCake,
} from "../controllers/cake.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { adminWriteLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
  cakeIdParamSchema,
  cakeSlugParamSchema,
  createCakeSchema,
  listCakesQuerySchema,
  listPopularCakesQuerySchema,
  listPublicCakesQuerySchema,
  updateCakeSchema,
} from "../validators/cake.validator";

const router = Router();
const adminAuth = [authenticateAdmin, auditLog, adminWriteLimiter] as const;

router.get("/public", validate(listPublicCakesQuerySchema, "query"), listPublicCakes);
router.get(
  "/public/popular",
  validate(listPopularCakesQuerySchema, "query"),
  listPublicPopularCakes,
);
router.get(
  "/public/:slug",
  validate(cakeSlugParamSchema, "params"),
  getPublicCakeBySlug,
);

router.get("/", ...adminAuth, validate(listCakesQuerySchema, "query"), listCakes);
router.post("/", ...adminAuth, validate(createCakeSchema), createCake);
router.get("/:id", ...adminAuth, validate(cakeIdParamSchema, "params"), getCake);
router.patch(
  "/:id",
  ...adminAuth,
  validate(cakeIdParamSchema, "params"),
  validate(updateCakeSchema),
  updateCake,
);
router.delete("/:id", ...adminAuth, validate(cakeIdParamSchema, "params"), deleteCake);

export default router;
