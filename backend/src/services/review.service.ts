import { Review } from "../models";
import { ApiError } from "../utils/ApiError";
import type {
  CreateReviewInput,
  ListReviewsQuery,
  UpdateReviewInput,
} from "../validators/review.validator";

export async function listReviews(query: ListReviewsQuery) {
  const { search, isActive, page, limit } = query;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ name: regex }, { role: regex }, { text: regex }];
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ sortOrder: 1, name: 1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listPublicReviews() {
  return Review.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .select("name role rating text image sortOrder")
    .lean();
}

export async function getReviewById(id: string) {
  const review = await Review.findById(id).lean();
  if (!review) {
    throw ApiError.notFound("Review not found");
  }
  return review;
}

export async function createReview(input: CreateReviewInput) {
  return Review.create(input);
}

export async function updateReview(id: string, input: UpdateReviewInput) {
  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound("Review not found");
  }

  if (input.name !== undefined) review.name = input.name;
  if (input.role !== undefined) review.role = input.role;
  if (input.rating !== undefined) review.rating = input.rating;
  if (input.text !== undefined) review.text = input.text;
  if (input.image !== undefined) review.image = input.image;
  if (input.isActive !== undefined) review.isActive = input.isActive;
  if (input.sortOrder !== undefined) review.sortOrder = input.sortOrder;

  await review.save();
  return review.toObject();
}

export async function deleteReview(id: string) {
  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound("Review not found");
  }

  await review.deleteOne();
  return { id };
}
