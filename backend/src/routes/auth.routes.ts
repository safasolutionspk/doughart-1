import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { authLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { loginSchema } from "../validators/auth.validator";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);

export default router;
