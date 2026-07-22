import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginAdmin(req.body);
  sendSuccess(res, result, "Login successful");
});
