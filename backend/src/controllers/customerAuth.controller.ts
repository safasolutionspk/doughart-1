import type { Request, Response } from "express";
import * as customerAuthService from "../services/customerAuth.service";
import * as orderService from "../services/order.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await customerAuthService.signupCustomer(req.body);
  sendSuccess(res, result, "Account created successfully", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await customerAuthService.loginCustomer(req.body);
  sendSuccess(res, result, "Login successful");
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, { loggedOut: true }, "Logged out successfully");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.customer) {
    return sendSuccess(res, null, "Not authenticated");
  }
  sendSuccess(res, req.customer, "Customer profile retrieved");
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await orderService.listOrdersForCustomer(req.customer!.id);
  sendSuccess(res, orders, "Orders retrieved");
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await customerAuthService.requestPasswordReset(req.body);
  sendSuccess(
    res,
    { requested: true },
    "If an account exists for that email, password reset instructions have been sent.",
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await customerAuthService.resetPassword(req.body);
  sendSuccess(res, { passwordReset: true }, "Password reset successful");
});
