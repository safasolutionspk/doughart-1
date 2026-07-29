import { Types } from "mongoose";
import { env } from "../../config/env";
import {
  EmailAttempt,
  type EmailAudience,
  type EmailProviderName,
  type EmailReasonCode,
  type EmailType,
} from "../../models/EmailAttempt";
import { safeErrorLog } from "../../utils/safeLog";
import { consoleEmailNotifier } from "./console";
import {
  classifyEmailAddress,
  maskEmailAddress,
  sanitizeEmailHeader,
} from "./emailValidation";
import { noopEmailNotifier } from "./noop";
import { smtpEmailNotifier } from "./smtp";
import type { EmailContent, EmailMessage, IEmailNotifier } from "./types";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export function getActiveEmailProviderName(): EmailProviderName {
  if (!env.EMAIL_ENABLED) {
    return "noop";
  }
  if (env.EMAIL_PROVIDER === "smtp") {
    return "smtp";
  }
  if (env.EMAIL_PROVIDER === "noop") {
    return "noop";
  }
  return "console";
}

export function getEmailNotifier(): IEmailNotifier {
  switch (getActiveEmailProviderName()) {
    case "smtp":
      return smtpEmailNotifier;
    case "noop":
      return noopEmailNotifier;
    case "console":
    default:
      return consoleEmailNotifier;
  }
}

export type TrackedSendInput = {
  attemptKey: string;
  emailType: EmailType;
  audience: EmailAudience;
  relatedOrderId?: string;
  relatedContactId?: string;
  relatedCustomerId?: string;
  orderNumber?: string;
  /** Raw recipient before validation; empty/missing → skip */
  recipientEmail?: string | null;
  /** When true, skip recipient email validation (e.g. server-controlled owner address already validated). */
  trustRecipient?: boolean;
  buildContent: () => EmailContent;
  replyTo?: string;
};

export type TrackedSendResult = {
  status: "sent" | "failed" | "skipped" | "duplicate";
  reasonCode?: EmailReasonCode;
};

function toObjectId(id?: string): Types.ObjectId | undefined {
  if (!id || !Types.ObjectId.isValid(id)) {
    return undefined;
  }
  return new Types.ObjectId(id);
}

function mapProviderFailure(error: unknown): EmailReasonCode {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (
    message.includes("smtp_host") ||
    message.includes("smtp_from") ||
    message.includes("configuration") ||
    message.includes("required when")
  ) {
    return "configuration_missing";
  }
  if (message.includes("timeout") || message.includes("etimedout")) {
    return "smtp_timeout";
  }
  if (
    message.includes("rejected") ||
    message.includes("550") ||
    message.includes("553") ||
    message.includes("invalid recipient")
  ) {
    return "smtp_rejected";
  }
  if (message.includes("econnrefused") || message.includes("enotfound")) {
    return "provider_unavailable";
  }
  return "unknown_send_failure";
}

/**
 * Race-safe tracked send:
 * 1. Atomically reserve attemptKey (unique index)
 * 2. Apply skip rules
 * 3. Send once if reserved
 * 4. Mark sent/failed/skipped
 * Never throws to callers — logs safely and returns result.
 */
export async function sendTrackedEmail(
  input: TrackedSendInput,
): Promise<TrackedSendResult> {
  const provider = getActiveEmailProviderName();
  const now = new Date();

  try {
    await EmailAttempt.create({
      attemptKey: input.attemptKey,
      emailType: input.emailType,
      audience: input.audience,
      relatedOrderId: toObjectId(input.relatedOrderId),
      relatedContactId: toObjectId(input.relatedContactId),
      relatedCustomerId: toObjectId(input.relatedCustomerId),
      orderNumber: input.orderNumber?.trim() || undefined,
      status: "pending",
      provider,
      attemptedAt: now,
      retryCount: 0,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { status: "duplicate", reasonCode: "duplicate_attempt" };
    }
    safeErrorLog("[email-attempt] reserve failed", error, {
      attemptKey: input.attemptKey,
      emailType: input.emailType,
    });
    return { status: "failed", reasonCode: "unknown_send_failure" };
  }

  const markSkipped = async (reasonCode: EmailReasonCode) => {
    await EmailAttempt.updateOne(
      { attemptKey: input.attemptKey, status: "pending" },
      {
        $set: {
          status: "skipped",
          reasonCode,
          skippedAt: new Date(),
        },
      },
    );
    return { status: "skipped" as const, reasonCode };
  };

  const markFailed = async (reasonCode: EmailReasonCode) => {
    await EmailAttempt.updateOne(
      { attemptKey: input.attemptKey, status: "pending" },
      {
        $set: {
          status: "failed",
          reasonCode,
          failedAt: new Date(),
        },
      },
    );
    return { status: "failed" as const, reasonCode };
  };

  try {
    if (!env.EMAIL_ENABLED) {
      return await markSkipped("email_disabled");
    }

    let recipient = (input.recipientEmail ?? "").trim();

    if (!input.trustRecipient) {
      const classification = classifyEmailAddress(recipient);
      if (classification === "missing") {
        return await markSkipped("missing_email");
      }
      if (classification === "invalid") {
        return await markSkipped("invalid_email");
      }
    } else if (!recipient) {
      return await markSkipped("missing_email");
    }

    recipient = recipient.toLowerCase();

    if (provider === "smtp") {
      if (
        !env.SMTP_HOST?.trim() ||
        !env.SMTP_FROM?.trim() ||
        !env.SMTP_USER?.trim() ||
        !env.SMTP_PASSWORD?.trim()
      ) {
        return await markFailed("configuration_missing");
      }
    }

    const content = input.buildContent();
    const subject = sanitizeEmailHeader(content.subject, 200);
    const message: EmailMessage = {
      to: recipient,
      subject,
      text: content.text,
      html: content.html,
      replyTo: input.replyTo
        ? sanitizeEmailHeader(input.replyTo, 160)
        : undefined,
    };

    await EmailAttempt.updateOne(
      { attemptKey: input.attemptKey },
      { $set: { recipientMasked: maskEmailAddress(recipient) } },
    );

    await getEmailNotifier().send(message);

    await EmailAttempt.updateOne(
      { attemptKey: input.attemptKey, status: "pending" },
      {
        $set: {
          status: "sent",
          sentAt: new Date(),
        },
        $unset: { reasonCode: 1 },
      },
    );

    return { status: "sent" };
  } catch (error) {
    const reasonCode = mapProviderFailure(error);
    safeErrorLog("[email-attempt] send failed", error, {
      attemptKey: input.attemptKey,
      emailType: input.emailType,
      reasonCode,
    });
    return await markFailed(reasonCode);
  }
}

/** Fire-and-forget wrapper — never rejects. */
export function sendTrackedEmailAsync(input: TrackedSendInput): void {
  void sendTrackedEmail(input).catch((error) => {
    safeErrorLog("[email-attempt] unexpected async failure", error, {
      attemptKey: input.attemptKey,
      emailType: input.emailType,
    });
  });
}
