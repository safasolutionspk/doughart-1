import { Router } from "express";
import { subscribe } from "../controllers/newsletter.controller";
import { newsletterLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { subscribeNewsletterSchema } from "../validators/newsletter.validator";

const router = Router();

router.post(
  "/",
  newsletterLimiter,
  validate(subscribeNewsletterSchema),
  subscribe,
);

export default router;
