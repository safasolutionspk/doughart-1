import { z } from "zod";

export const subscribeNewsletterSchema = z.object({
  email: z.string().email("A valid email address is required"),
  source: z.string().trim().min(1).max(80).default("homepage"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required to subscribe" }),
  }),
});

export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>;
