import { Router } from "express";
import { submitContact } from "../controllers/contact.controller";
import { contactLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { submitContactSchema } from "../validators/contact.validator";

const router = Router();

router.post("/", contactLimiter, validate(submitContactSchema), submitContact);

export default router;
