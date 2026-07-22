import { NewsletterSubscriber } from "../models";
import type { SubscribeNewsletterInput } from "../validators/newsletter.validator";

export async function subscribeNewsletter(input: SubscribeNewsletterInput) {
  const email = input.email.trim().toLowerCase();

  try {
    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { email },
      {
        email,
        source: input.source,
        consent: input.consent,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return {
      email: subscriber?.email ?? email,
      source: subscriber?.source ?? input.source,
    };
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return { email, source: input.source };
    }
    throw error;
  }
}

export async function listNewsletterSubscribers() {
  return NewsletterSubscriber.find()
    .sort({ createdAt: -1 })
    .select("email source consent createdAt")
    .lean();
}
