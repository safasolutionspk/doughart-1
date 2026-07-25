import { z } from "zod";
import mongoose from "mongoose";

export const galleryIdParamSchema = z.object({
  id: z
    .string()
    .min(1, "Gallery image ID is required")
    .refine(
      (value) => mongoose.Types.ObjectId.isValid(value),
      "Invalid gallery image ID",
    ),
});
