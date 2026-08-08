import { Router } from "express";
import {
  forgotPassword,
  getMe,
  getMyOrders,
  login,
  logout,
  resetPassword,
  signup,
} from "../controllers/customerAuth.controller";
import { authenticateCustomer } from "../middleware/customerAuth";
import { customerAuthLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
  customerForgotPasswordSchema,
  customerLoginSchema,
  customerResetPasswordSchema,
  customerSignupSchema,
} from "../validators/customer.validator";

const router = Router();

router.post(
  "/signup",
  customerAuthLimiter,
  validate(customerSignupSchema),
  signup,
);

router.post("/login", validate(customerLoginSchema), login);

router.post(
  "/forgot-password",
  customerAuthLimiter,
  validate(customerForgotPasswordSchema),
  forgotPassword,
);

router.post(
  "/reset-password",
  customerAuthLimiter,
  validate(customerResetPasswordSchema),
  resetPassword,
);

router.post("/logout", logout);

router.get("/me", authenticateCustomer, getMe);

router.get("/orders", authenticateCustomer, getMyOrders);

export default router;
