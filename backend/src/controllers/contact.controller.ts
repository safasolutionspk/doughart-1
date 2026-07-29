import type { Request, Response } from "express";
import * as contactService from "../services/contact.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const data = await contactService.submitContactMessage(req.body);
  sendSuccess(
    res,
    data,
    "Thanks for contacting DoughArt. We will get back to you soon.",
    201,
  );
});
