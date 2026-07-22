import { Router } from "express";
import {
  createReview,
  deleteReview,
  getReview,
  listPublicReviews,
  listReviews,
  updateReview,
} from "../controllers/review.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { adminWriteLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
  createReviewSchema,
  listReviewsQuerySchema,
  reviewIdParamSchema,
  updateReviewSchema,
} from "../validators/review.validator";

const router = Router();
const adminAuth = [authenticateAdmin, auditLog, adminWriteLimiter] as const;

router.get("/public", listPublicReviews);

router.get(
  "/",
  ...adminAuth,
  validate(listReviewsQuerySchema, "query"),
  listReviews,
);
router.post("/", ...adminAuth, validate(createReviewSchema), createReview);
router.get("/:id", ...adminAuth, validate(reviewIdParamSchema, "params"), getReview);
router.patch(
  "/:id",
  ...adminAuth,
  validate(reviewIdParamSchema, "params"),
  validate(updateReviewSchema),
  updateReview,
);
router.delete(
  "/:id",
  ...adminAuth,
  validate(reviewIdParamSchema, "params"),
  deleteReview,
);

export default router;
