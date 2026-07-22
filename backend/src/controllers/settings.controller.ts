import type { Request, Response } from "express";
import * as settingsService from "../services/settings.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.getPublicSettings(req.tenantContext);
  sendSuccess(res, settings, "Settings retrieved");
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.updateSettings(req.body, req.tenantContext);
  sendSuccess(res, settings, "Settings updated");
});
