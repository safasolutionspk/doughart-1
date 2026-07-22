import { z } from "zod";

export const createReviewSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  role: z.string().max(120).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().min(1, "Review text is required").max(2000),
  image: z.string().max(500).optional(),
  isActive: z.coerce.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const updateReviewSchema = createReviewSchema.partial();

export const reviewIdParamSchema = z.object({
  id: z.string().min(1, "Review ID is required"),
});

export const listReviewsQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z
    .union([z.enum(["true", "false"]), z.literal("")])
    .optional()
    .transform((val) => {
      if (val === undefined || val === "") {
        return undefined;
      }
      return val === "true";
    }),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
