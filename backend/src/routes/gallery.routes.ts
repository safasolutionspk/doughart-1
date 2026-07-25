import { Router } from "express";
import {
  deleteGallery,
  listAdminGallery,
  listPublicGallery,
  uploadGallery,
} from "../controllers/gallery.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { uploadLimiter } from "../middleware/rateLimiter";
import { uploadImage } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { galleryIdParamSchema } from "../validators/gallery.validator";

const router = Router();
const adminAuth = [authenticateAdmin, auditLog] as const;

/** Public dedicated Gallery listing — MongoDB GalleryImage records only. */
router.get("/public", listPublicGallery);

router.get("/", ...adminAuth, listAdminGallery);

router.post(
  "/",
  ...adminAuth,
  uploadLimiter,
  uploadImage.single("image"),
  uploadGallery,
);

router.delete(
  "/:id",
  ...adminAuth,
  validate(galleryIdParamSchema, "params"),
  deleteGallery,
);

export default router;
