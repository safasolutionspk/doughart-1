import type { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service";
import * as popularityService from "../services/popularity.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getValidatedQuery } from "../utils/validatedRequest";

export const getDashboardAnalytics = asyncHandler(
  async (_req: Request, res: Response) => {
    const analytics = await analyticsService.getDashboardAnalytics();
    sendSuccess(res, analytics, "Dashboard analytics retrieved");
  },
);

export const listPopularCakes = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{ page: number; limit: number }>(req);
    const result = await popularityService.listAdminPopularCakes(
      query.page,
      query.limit,
      req.tenantContext,
    );
    sendSuccess(res, result.rows, "Popular cakes retrieved", 200, {
      pagination: result.pagination,
    });
  },
);
