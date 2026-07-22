import { z } from "zod";

export const customerSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Valid email is required").max(160),
  phone: z
    .string()
    .min(7, "Valid phone number is required")
    .max(30, "Phone number is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const customerLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const customerForgotPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export const customerResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export type CustomerSignupInput = z.infer<typeof customerSignupSchema>;
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
export type CustomerForgotPasswordInput = z.infer<typeof customerForgotPasswordSchema>;
export type CustomerResetPasswordInput = z.infer<typeof customerResetPasswordSchema>;
