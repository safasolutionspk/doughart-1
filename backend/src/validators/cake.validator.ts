import { z } from "zod";
import { normalizeStoredImagePath } from "../utils/imagePath";

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens");

const cakeBodySchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  slug: slugSchema.optional(),
  categoryId: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  image: z
    .string()
    .max(500)
    .optional()
    .transform((val) => normalizeStoredImagePath(val)),
  isActive: z.coerce.boolean().optional().default(true),
  isFeatured: z.coerce.boolean().optional().default(false),
  isCustomizable: z.coerce.boolean().optional(),
  customizable: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

function normalizeCakeInput(data: z.infer<typeof cakeBodySchema>) {
  const categoryId = data.categoryId ?? data.category;
  return {
    name: data.name,
    slug: data.slug,
    categoryId,
    description: data.description,
    price: data.price,
    image: data.image,
    isActive: data.isActive ?? true,
    isFeatured: data.isFeatured ?? false,
    isCustomizable: data.isCustomizable ?? data.customizable ?? false,
    sortOrder: data.sortOrder ?? 0,
  };
}

export const createCakeSchema = cakeBodySchema
  .refine((data) => Boolean(data.categoryId ?? data.category), {
    message: "Category is required",
    path: ["categoryId"],
  })
  .transform(normalizeCakeInput);

const updateCakeBodySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: slugSchema.optional(),
  categoryId: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().min(0).optional(),
  image: z
    .string()
    .max(500)
    .optional()
    .transform((val) => normalizeStoredImagePath(val)),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isCustomizable: z.coerce.boolean().optional(),
  customizable: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const updateCakeSchema = updateCakeBodySchema.transform((data) => {
  const categoryId = data.categoryId ?? data.category;
  return {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.slug !== undefined ? { slug: data.slug } : {}),
    ...(categoryId !== undefined ? { categoryId } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.price !== undefined ? { price: data.price } : {}),
    ...(data.image !== undefined ? { image: data.image } : {}),
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
    ...(data.isCustomizable !== undefined || data.customizable !== undefined
      ? {
          isCustomizable: data.isCustomizable ?? data.customizable ?? false,
        }
      : {}),
    ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
  };
});

export const cakeIdParamSchema = z.object({
  id: z.string().min(1, "Cake ID is required"),
});

export const cakeSlugParamSchema = z.object({
  slug: slugSchema,
});

export const listPublicCakesQuerySchema = z.object({
  categorySlug: slugSchema.optional(),
  search: z.string().optional(),
  isFeatured: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});

export const listCakesQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z
    .union([z.enum(["true", "false"]), z.literal("")])
    .optional()
    .transform((val) => {
      if (val === undefined || val === "") {
        return undefined;
      }
      return val === "true";
    }),
  isFeatured: z
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

export type CreateCakeInput = z.infer<typeof createCakeSchema>;
export type UpdateCakeInput = z.infer<typeof updateCakeSchema>;
export type ListCakesQuery = z.infer<typeof listCakesQuerySchema>;
export type ListPublicCakesQuery = z.infer<typeof listPublicCakesQuerySchema>;
