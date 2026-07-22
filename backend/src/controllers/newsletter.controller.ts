import type { Request, Response } from "express";
import * as newsletterService from "../services/newsletter.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const data = await newsletterService.subscribeNewsletter(req.body);
  sendSuccess(res, data, "Subscribed successfully", 201);
});
