import { z } from "zod";
import { clampImageDisplay, type ImageDisplay } from "../types/imageDisplay";

export const imageDisplaySchema = z
  .object({
    zoom: z.coerce.number().min(1).max(3),
    x: z.coerce.number().min(-50).max(50),
    y: z.coerce.number().min(-50).max(50),
  })
  .transform((value): ImageDisplay => clampImageDisplay(value));

/**
 * Optional display metadata. `null` clears a previously saved framing.
 * Omitted (`undefined`) leaves the existing value unchanged on updates.
 */
export const optionalImageDisplaySchema = z
  .union([imageDisplaySchema, z.null()])
  .optional();
