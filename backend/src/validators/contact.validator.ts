import { z } from "zod";

const optionalEmail = z
  .string()
  .max(160)
  .optional()
  .default("")
  .transform((val) => val.trim().toLowerCase())
  .refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    "Enter a valid email address or leave this field blank.",
  );

export const submitContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is required")
    .max(120, "Name is too long"),
  phone: z
    .string()
    .trim()
    .min(7, "Valid phone number is required")
    .max(30, "Phone number is too long"),
  email: optionalEmail,
  subject: z
    .string()
    .trim()
    .max(160, "Subject is too long")
    .optional()
    .default(""),
  message: z
    .string()
    .trim()
    .min(10, "Please enter a message (at least 10 characters)")
    .max(2000, "Message is too long"),
});

export type SubmitContactInput = z.infer<typeof submitContactSchema>;
