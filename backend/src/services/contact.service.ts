import { randomUUID } from "crypto";
import { notifyContactOwner } from "./email";
import { sanitizeEmailHeader } from "./email/emailValidation";
import type { SubmitContactInput } from "../validators/contact.validator";

export async function submitContactMessage(input: SubmitContactInput) {
  const submissionId = randomUUID();

  const name = sanitizeEmailHeader(input.name, 120);
  const phone = sanitizeEmailHeader(input.phone, 30);
  const subject = input.subject?.trim()
    ? sanitizeEmailHeader(input.subject, 160)
    : undefined;
  const message = input.message.trim();
  const email = input.email?.trim() || undefined;

  notifyContactOwner({
    submissionId,
    name,
    phone,
    email,
    subject,
    message,
  });

  return {
    received: true,
    reference: submissionId,
  };
}
