import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  listPublicCategories,
  updateCategory,
} from "../controllers/category.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { adminWriteLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
  categoryIdParamSchema,
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from "../validators/category.validator";

const router = Router();
const adminAuth = [authenticateAdmin, auditLog, adminWriteLimiter] as const;

router.get("/public", listPublicCategories);

router.get(
  "/",
  ...adminAuth,
  validate(listCategoriesQuerySchema, "query"),
  listCategories,
);
router.post("/", ...adminAuth, validate(createCategorySchema), createCategory);
router.get("/:id", ...adminAuth, validate(categoryIdParamSchema, "params"), getCategory);
router.patch(
  "/:id",
  ...adminAuth,
  validate(categoryIdParamSchema, "params"),
  validate(updateCategorySchema),
  updateCategory,
);
router.delete(
  "/:id",
  ...adminAuth,
  validate(categoryIdParamSchema, "params"),
  deleteCategory,
);

export default router;
