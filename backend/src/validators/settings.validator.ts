import { z } from "zod";

const optionalUrl = z
  .string()
  .max(500)
  .optional()
  .transform((val) => (val === "" ? undefined : val));

const optionalText = z
  .string()
  .max(2000)
  .optional()
  .transform((val) => (val === "" ? undefined : val));

export const updateSettingsSchema = z
  .object({
    businessName: z.string().min(1, "Business name is required").max(120).optional(),
    tagline: z.string().max(200).optional(),
    phone: z.string().min(1, "Phone is required").max(30).optional(),
    email: z.string().email("Valid email is required").max(160).optional(),
    address: z.string().min(1, "Address is required").max(500).optional(),
    logo: optionalUrl,
    heroImage: optionalUrl,
    facebook: optionalUrl,
    instagram: optionalUrl,
    tiktok: optionalUrl,
    whatsapp: z
      .string()
      .max(500)
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    deliveryInfo: optionalText,
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required to update",
  });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export type PublicSettings = {
  businessName: string;
  tagline?: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
  heroImage?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  deliveryInfo?: string;
};
