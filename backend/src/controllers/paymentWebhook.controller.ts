import type { Request, Response } from "express";
import { processPaymentWebhook } from "../services/payment";
import { asyncHandler } from "../utils/asyncHandler";

export const handleJazzcashWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await processPaymentWebhook("jazzcash", req.body);
    res.status(200).json({ success: true, message: result.message, data: result });
  },
);

export const handleEasypaisaWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await processPaymentWebhook("easypaisa", req.body);
    res.status(200).json({ success: true, message: result.message, data: result });
  },
);
