import { randomUUID } from "crypto";
import { env } from "../../config/env";
import { safeErrorLog } from "../../utils/safeLog";
import { sendTrackedEmailAsync } from "./emailAttempt.service";
import {
  classifyEmailAddress,
  isValidEmailSyntax,
  sanitizeEmailHeader,
} from "./emailValidation";
import {
  adminNewOrderEmail,
  contactOwnerNotificationEmail,
  customerOrderConfirmedEmail,
  customerOrderReceivedEmail,
  quoteReadyCustomerEmail,
  type ContactOwnerEmailContext,
} from "./templates";
import {
  brandPlainTextFooter,
  escapeHtml,
  htmlButton,
  htmlHeading,
  htmlParagraph,
  wrapEmailHtml,
} from "./templates/shared";
import type { EmailContent, OrderEmailContext } from "./types";

export type {
  EmailMessage,
  EmailContent,
  IEmailNotifier,
  OrderEmailContext,
} from "./types";

type CustomerPasswordResetContext = {
  customerEmail: string;
  customerId?: string;
  token: string;
  expiresMinutes: number;
};

function getOwnerOrderRecipient(): string {
  return (
    env.ORDER_NOTIFICATION_EMAIL?.trim() ||
    env.ADMIN_EMAIL.trim()
  );
}

function getContactOwnerRecipient(): string | undefined {
  const configured =
    env.CONTACT_NOTIFICATION_EMAIL?.trim() ||
    env.ORDER_NOTIFICATION_EMAIL?.trim() ||
    env.ADMIN_EMAIL.trim();
  return configured || undefined;
}

function customerPasswordResetEmail(
  ctx: CustomerPasswordResetContext,
): EmailContent {
  const baseUrl = env.FRONTEND_URL?.trim();
  const resetUrl = baseUrl
    ? `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(ctx.token)}`
    : "";

  const subject = sanitizeEmailHeader(
    "Reset your DoughArt Bakers password",
    200,
  );

  const text = [
    "We received a request to reset your DoughArt Bakers account password.",
    "",
    resetUrl
      ? `Reset link: ${resetUrl}`
      : "Password reset link is unavailable. Please contact support.",
    `This link expires in ${ctx.expiresMinutes} minutes.`,
    "",
    "If you did not request this, you can ignore this email.",
    "",
    brandPlainTextFooter(),
  ].join("\n");

  let bodyHtml =
    htmlHeading("Reset your password") +
    htmlParagraph(
      "We received a request to reset your DoughArt Bakers account password.",
    );

  if (resetUrl) {
    bodyHtml +=
      htmlParagraph("Use the button below to choose a new password.") +
      htmlButton(resetUrl, "Reset your password") +
      htmlParagraph(
        `Or copy this link: ${resetUrl}`,
      );
  } else {
    bodyHtml += htmlParagraph(
      "Password reset link is unavailable. Please contact support.",
    );
  }

  bodyHtml +=
    htmlParagraph(
      `This link expires in ${ctx.expiresMinutes} minutes.`,
    ) +
    htmlParagraph("If you did not request this, you can ignore this email.");

  return {
    subject,
    text,
    html: wrapEmailHtml({
      title: subject,
      preheader: "Password reset for your DoughArt Bakers account",
      bodyHtml,
    }),
  };
}

/**
 * Owner new-order notification after successful persistence.
 * Never throws.
 */
export function notifyOwnerOrderCreated(ctx: OrderEmailContext): void {
  if (!ctx.orderId) {
    safeErrorLog(
      "[email] Skipping owner order notification — missing orderId",
      new Error("missing_order_id"),
      { orderNumber: ctx.orderNumber },
    );
    return;
  }

  const recipient = getOwnerOrderRecipient();

  sendTrackedEmailAsync({
    attemptKey: `owner_order_created:${ctx.orderId}`,
    emailType: "owner_order_created",
    audience: "owner",
    relatedOrderId: ctx.orderId,
    orderNumber: ctx.orderNumber,
    recipientEmail: recipient,
    trustRecipient: true,
    buildContent: () => adminNewOrderEmail(ctx),
  });
}

/**
 * Customer "Order Received" acknowledgement after successful persistence.
 * Never throws. Missing/invalid email → skipped attempt via tracked send.
 */
export function notifyCustomerOrderCreated(ctx: OrderEmailContext): void {
  if (!ctx.orderId) {
    safeErrorLog(
      "[email] Skipping customer order acknowledgement — missing orderId",
      new Error("missing_order_id"),
      { orderNumber: ctx.orderNumber },
    );
    return;
  }

  sendTrackedEmailAsync({
    attemptKey: `customer_order_created:${ctx.orderId}`,
    emailType: "customer_order_created",
    audience: "customer",
    relatedOrderId: ctx.orderId,
    orderNumber: ctx.orderNumber,
    recipientEmail: ctx.customerEmail,
    buildContent: () => customerOrderReceivedEmail(ctx),
  });
}

/**
 * Customer confirmation — only after first transition to confirmed.
 * Never throws. Missing/invalid email → skipped attempt.
 */
export function notifyCustomerOrderConfirmed(ctx: OrderEmailContext): void {
  if (!ctx.orderId) {
    safeErrorLog(
      "[email] Skipping customer confirmation — missing orderId",
      new Error("missing_order_id"),
      { orderNumber: ctx.orderNumber },
    );
    return;
  }

  sendTrackedEmailAsync({
    attemptKey: `customer_order_confirmed:${ctx.orderId}`,
    emailType: "customer_order_confirmed",
    audience: "customer",
    relatedOrderId: ctx.orderId,
    orderNumber: ctx.orderNumber,
    recipientEmail: ctx.customerEmail,
    buildContent: () =>
      customerOrderConfirmedEmail({
        ...ctx,
        status: ctx.status || "confirmed",
      }),
  });
}

/**
 * First-quote-only customer notification (caller must gate on first quote).
 * Never throws.
 */
export function notifyQuoteReady(ctx: OrderEmailContext): void {
  if (!ctx.orderId) {
    safeErrorLog(
      "[email] Skipping quote-ready — missing orderId",
      new Error("missing_order_id"),
      { orderNumber: ctx.orderNumber },
    );
    return;
  }

  sendTrackedEmailAsync({
    attemptKey: `customer_quote_ready:${ctx.orderId}`,
    emailType: "customer_quote_ready",
    audience: "customer",
    relatedOrderId: ctx.orderId,
    orderNumber: ctx.orderNumber,
    recipientEmail: ctx.customerEmail,
    buildContent: () => quoteReadyCustomerEmail(ctx),
  });
}

/** Customer password reset. Never throws. Does not log tokens. */
export function notifyCustomerPasswordReset(
  ctx: CustomerPasswordResetContext,
): void {
  const to = ctx.customerEmail.trim();
  if (!to) {
    return;
  }

  const attemptId = randomUUID();
  sendTrackedEmailAsync({
    attemptKey: `customer_password_reset:${ctx.customerId || "unknown"}:${attemptId}`,
    emailType: "customer_password_reset",
    audience: "customer",
    relatedCustomerId: ctx.customerId,
    recipientEmail: to,
    buildContent: () => customerPasswordResetEmail(ctx),
  });
}

export type ContactNotificationInput = {
  submissionId: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
};

/**
 * Owner Contact Us notification. Recipient is always server-controlled.
 * Visitor email is Reply-To only when syntactically valid.
 * Never throws.
 */
export function notifyContactOwner(input: ContactNotificationInput): void {
  const recipient = getContactOwnerRecipient();
  if (!recipient) {
    safeErrorLog(
      "[email] Contact notification skipped — no owner recipient configured",
      new Error("configuration_missing"),
      { submissionId: input.submissionId },
    );
    return;
  }

  const visitorEmail = input.email?.trim();
  const replyTo =
    visitorEmail && isValidEmailSyntax(visitorEmail)
      ? visitorEmail.toLowerCase()
      : undefined;

  const ctx: ContactOwnerEmailContext = {
    submissionId: input.submissionId,
    name: input.name,
    phone: input.phone,
    email: visitorEmail && isValidEmailSyntax(visitorEmail) ? visitorEmail : undefined,
    subject: input.subject,
    message: input.message,
  };

  sendTrackedEmailAsync({
    attemptKey: `contact_owner_notification:${input.submissionId}`,
    emailType: "contact_owner_notification",
    audience: "owner",
    recipientEmail: recipient,
    trustRecipient: true,
    replyTo,
    buildContent: () => contactOwnerNotificationEmail(ctx),
  });
}

/** @deprecated Use notifyOwnerOrderCreated — kept only if any legacy import remains. */
export function notifyOrderCreated(ctx: OrderEmailContext): void {
  notifyOwnerOrderCreated(ctx);
}

export { classifyEmailAddress, escapeHtml };
