import type { Request, Response } from "express";
import * as emailAnalyticsService from "../services/emailAnalytics.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getValidatedQuery } from "../utils/validatedRequest";
import type { ListEmailAttemptsQuery } from "../validators/emailAnalytics.validator";

export const getEmailSummary = asyncHandler(
  async (_req: Request, res: Response) => {
    const summary = await emailAnalyticsService.getEmailAnalyticsSummary();
    sendSuccess(res, summary, "Email analytics summary retrieved");
  },
);

export const listEmailAttempts = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<ListEmailAttemptsQuery>(req);
    const result = await emailAnalyticsService.listEmailAttempts(query);
    sendSuccess(res, result.rows, "Email attempts retrieved", 200, {
      pagination: result.pagination,
    });
  },
);
