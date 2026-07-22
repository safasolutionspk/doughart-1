import { z } from "zod";
import { normalizeStoredImagePath } from "../utils/imagePath";

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens");

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  slug: slugSchema.optional(),
  description: z.string().max(1000).optional(),
  image: z
    .string()
    .max(500)
    .optional()
    .transform((val) => normalizeStoredImagePath(val)),
  isActive: z.coerce.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: slugSchema.optional(),
  description: z.string().max(1000).optional(),
  image: z
    .string()
    .max(500)
    .optional()
    .transform((val) => normalizeStoredImagePath(val)),
  isActive: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const categoryIdParamSchema = z.object({
  id: z.string().min(1, "Category ID is required"),
});

export const listCategoriesQuerySchema = z.object({
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

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
