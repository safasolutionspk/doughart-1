import { Router } from "express";
import {
  createCake,
  createComboOffer,
  deleteCake,
  deleteComboOffer,
  getCake,
  getComboOffer,
  getPublicCakeBySlug,
  listCakes,
  listComboOffers,
  listPublicCakes,
  listPublicComboOffers,
  listPublicPopularCakes,
  updateCake,
  updateComboOffer,
} from "../controllers/cake.controller";
import { auditLog } from "../middleware/auditLog";
import { authenticateAdmin } from "../middleware/auth";
import { adminWriteLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
  cakeIdParamSchema,
  cakeSlugParamSchema,
  createCakeSchema,
  createComboCakeSchema,
  listCakesQuerySchema,
  listPopularCakesQuerySchema,
  listPublicCakesQuerySchema,
  listPublicComboOffersQuerySchema,
  updateCakeSchema,
  updateComboCakeSchema,
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
  "/public/combo-offers",
  validate(listPublicComboOffersQuerySchema, "query"),
  listPublicComboOffers,
);
router.get(
  "/public/:slug",
  validate(cakeSlugParamSchema, "params"),
  getPublicCakeBySlug,
);

router.get(
  "/combo-offers",
  ...adminAuth,
  validate(listCakesQuerySchema, "query"),
  listComboOffers,
);
router.post(
  "/combo-offers",
  ...adminAuth,
  validate(createComboCakeSchema),
  createComboOffer,
);
router.get(
  "/combo-offers/:id",
  ...adminAuth,
  validate(cakeIdParamSchema, "params"),
  getComboOffer,
);
router.patch(
  "/combo-offers/:id",
  ...adminAuth,
  validate(cakeIdParamSchema, "params"),
  validate(updateComboCakeSchema),
  updateComboOffer,
);
router.delete(
  "/combo-offers/:id",
  ...adminAuth,
  validate(cakeIdParamSchema, "params"),
  deleteComboOffer,
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
