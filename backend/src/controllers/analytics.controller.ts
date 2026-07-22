import type { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getDashboardAnalytics = asyncHandler(
  async (_req: Request, res: Response) => {
    const analytics = await analyticsService.getDashboardAnalytics();
    sendSuccess(res, analytics, "Dashboard analytics retrieved");
  },
);
