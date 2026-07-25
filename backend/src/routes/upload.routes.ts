import { Router } from "express";
import {
  deleteImage,
  listGallery,
  listPublicGallery,
  uploadImage as uploadImageHandler,
  uploadPublicReferenceImage,
} from "../controllers/upload.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { uploadLimiter } from "../middleware/rateLimiter";
import { uploadImage } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { uploadFilenameParamSchema } from "../validators/upload.validator";

const router = Router();

router.post(
  "/public/reference-image",
  uploadLimiter,
  uploadImage.single("image"),
  uploadPublicReferenceImage,
);

/** Public gallery listing — same non-deleted uploads Admin manages (no delete keys). */
router.get("/public/gallery", listPublicGallery);

router.use(authenticateAdmin, auditLog);

router.get("/gallery", listGallery);

router.post(
  "/image",
  uploadLimiter,
  uploadImage.single("image"),
  uploadImageHandler,
);

router.delete(
  "/image/:filename",
  validate(uploadFilenameParamSchema, "params"),
  deleteImage,
);

export default router;
