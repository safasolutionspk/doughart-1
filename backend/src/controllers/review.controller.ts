import type { Request, Response } from "express";
import * as reviewService from "../services/review.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getValidatedParam, getValidatedQuery } from "../utils/validatedRequest";

export const listPublicReviews = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await reviewService.listPublicReviews();
  sendSuccess(res, reviews, "Reviews retrieved");
});

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.listReviews(getValidatedQuery(req));
  sendSuccess(res, result.reviews, "Reviews retrieved", 200, {
    pagination: result.pagination,
  });
});

export const getReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.getReviewById(getValidatedParam(req, "id"));
  sendSuccess(res, review, "Review retrieved");
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createReview(req.body);
  sendSuccess(res, review, "Review created", 201);
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.updateReview(getValidatedParam(req, "id"), req.body);
  sendSuccess(res, review, "Review updated");
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.deleteReview(getValidatedParam(req, "id"));
  sendSuccess(res, result, "Review deleted");
});
