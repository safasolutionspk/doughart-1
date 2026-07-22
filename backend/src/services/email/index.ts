import { env } from "../../config/env";
import { safeErrorLog } from "../../utils/safeLog";
import { consoleEmailNotifier } from "./console";
import { noopEmailNotifier } from "./noop";
import { smtpEmailNotifier } from "./smtp";
import {
  adminNewOrderEmail,
  adminPaymentProofEmail,
  orderCreatedCustomerEmail,
  quoteReadyCustomerEmail,
} from "./templates";
import type {
  EmailContent,
  IEmailNotifier,
  OrderEmailContext,
} from "./types";

export type { EmailMessage, EmailContent, IEmailNotifier, OrderEmailContext } from "./types";

type CustomerPasswordResetContext = {
  customerEmail: string;
  token: string;
  expiresMinutes: number;
};

function getEmailNotifier(): IEmailNotifier {
  if (!env.EMAIL_ENABLED) {
    return noopEmailNotifier;
  }

  switch (env.EMAIL_PROVIDER) {
    case "smtp":
      return smtpEmailNotifier;
    case "noop":
      return noopEmailNotifier;
    case "console":
    default:
      return consoleEmailNotifier;
  }
}

function hasCustomerEmail(ctx: OrderEmailContext): boolean {
  return Boolean(ctx.customerEmail?.trim());
}

function getAdminNotificationRecipient(): string {
  return (
    env.ORDER_NOTIFICATION_EMAIL?.trim() ||
    env.ADMIN_EMAIL.trim()
  );
}

function sendAsync(to: string, content: EmailContent): void {
  const notifier = getEmailNotifier();

  void notifier
    .send({
      to,
      subject: content.subject,
      text: content.text,
      html: content.html,
    })
    .catch((error) => {
      safeErrorLog("[email] Failed to send", error, {
        to,
        subject: content.subject,
      });
    });
}

function customerPasswordResetEmail(ctx: CustomerPasswordResetContext): EmailContent {
  const baseUrl = env.FRONTEND_URL?.trim();
  const resetUrl = baseUrl
    ? `${baseUrl}/reset-password?token=${encodeURIComponent(ctx.token)}`
    : "";

  const subject = "Reset your DoughArt password";

  const lines = [
    "We received a request to reset your DoughArt account password.",
    "",
    resetUrl ? `Reset link: ${resetUrl}` : "Password reset link is unavailable. Please contact support.",
    `This link expires in ${ctx.expiresMinutes} minutes.`,
    "",
    "If you did not request this, you can ignore this email.",
  ];

  const text = lines.join("\n");
  const html = `<p>We received a request to reset your DoughArt account password.</p>
<p>${
    resetUrl
      ? `<a href="${resetUrl}">Reset your password</a>`
      : "Password reset link is unavailable. Please contact support."
  }</p>
<p>This link expires in ${ctx.expiresMinutes} minutes.</p>
<p>If you did not request this, you can ignore this email.</p>`;

  return { subject, text, html };
}

/** Customer order confirmation + optional admin alert. Never throws. */
export function notifyOrderCreated(ctx: OrderEmailContext): void {
  if (hasCustomerEmail(ctx)) {
    sendAsync(ctx.customerEmail.trim(), orderCreatedCustomerEmail(ctx));
  }

  sendAsync(getAdminNotificationRecipient(), adminNewOrderEmail(ctx));
}

/** Customer quote-ready email when admin sets a quote. Never throws. */
export function notifyQuoteReady(ctx: OrderEmailContext): void {
  if (!hasCustomerEmail(ctx)) {
    return;
  }

  sendAsync(ctx.customerEmail.trim(), quoteReadyCustomerEmail(ctx));
}

/** Admin alert when payment proof is uploaded. Never throws. */
export function notifyPaymentProofUploaded(ctx: OrderEmailContext): void {
  sendAsync(getAdminNotificationRecipient(), adminPaymentProofEmail(ctx));
}

/** Customer password reset email. Never throws. */
export function notifyCustomerPasswordReset(ctx: CustomerPasswordResetContext): void {
  const to = ctx.customerEmail.trim();
  if (!to) {
    return;
  }

  sendAsync(to, customerPasswordResetEmail(ctx));
}
