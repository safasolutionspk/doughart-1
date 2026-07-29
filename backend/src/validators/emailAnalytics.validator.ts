import { z } from "zod";
import {
  EMAIL_AUDIENCES,
  EMAIL_ATTEMPT_STATUSES,
  EMAIL_TYPES,
} from "../models/EmailAttempt";

export const listEmailAttemptsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(EMAIL_ATTEMPT_STATUSES).optional(),
  emailType: z.enum(EMAIL_TYPES).optional(),
  audience: z.enum(EMAIL_AUDIENCES).optional(),
  orderNumber: z.string().trim().max(64).optional(),
  from: z
    .string()
    .optional()
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), "Invalid from date"),
  to: z
    .string()
    .optional()
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), "Invalid to date"),
});

export type ListEmailAttemptsQuery = z.infer<typeof listEmailAttemptsQuerySchema>;
