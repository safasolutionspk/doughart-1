import { EmailAttempt } from "../models/EmailAttempt";
import type { ListEmailAttemptsQuery } from "../validators/emailAnalytics.validator";

export type EmailAnalyticsSummary = {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  pending: number;
};

export type SafeEmailAttemptRow = {
  id: string;
  attemptedAt: string;
  emailType: string;
  audience: string;
  orderNumber: string | null;
  status: string;
  reasonCode: string | null;
  recipientMasked: string | null;
  provider: string;
};

function toSafeRow(doc: {
  _id: { toString(): string };
  attemptedAt?: Date;
  createdAt?: Date;
  emailType: string;
  audience: string;
  orderNumber?: string;
  status: string;
  reasonCode?: string;
  recipientMasked?: string;
  provider: string;
}): SafeEmailAttemptRow {
  const at = doc.attemptedAt ?? doc.createdAt ?? new Date();
  return {
    id: doc._id.toString(),
    attemptedAt: at.toISOString(),
    emailType: doc.emailType,
    audience: doc.audience,
    orderNumber: doc.orderNumber?.trim() || null,
    status: doc.status,
    reasonCode: doc.reasonCode ?? null,
    recipientMasked: doc.recipientMasked ?? null,
    provider: doc.provider,
  };
}

export async function getEmailAnalyticsSummary(): Promise<EmailAnalyticsSummary> {
  const [total, sent, failed, skipped, pending] = await Promise.all([
    EmailAttempt.countDocuments({}),
    EmailAttempt.countDocuments({ status: "sent" }),
    EmailAttempt.countDocuments({ status: "failed" }),
    EmailAttempt.countDocuments({ status: "skipped" }),
    EmailAttempt.countDocuments({ status: "pending" }),
  ]);

  return { total, sent, failed, skipped, pending };
}

export async function listEmailAttempts(query: ListEmailAttemptsQuery) {
  const { page, limit, status, emailType, audience, orderNumber, from, to } =
    query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  }
  if (emailType) {
    filter.emailType = emailType;
  }
  if (audience) {
    filter.audience = audience;
  }
  if (orderNumber?.trim()) {
    filter.orderNumber = orderNumber.trim();
  }

  if (from || to) {
    const attemptedAt: Record<string, Date> = {};
    if (from) {
      attemptedAt.$gte = new Date(from);
    }
    if (to) {
      attemptedAt.$lte = new Date(to);
    }
    filter.attemptedAt = attemptedAt;
  }

  const [rows, total] = await Promise.all([
    EmailAttempt.find(filter)
      .sort({ attemptedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "attemptedAt createdAt emailType audience orderNumber status reasonCode recipientMasked provider",
      )
      .lean(),
    EmailAttempt.countDocuments(filter),
  ]);

  return {
    rows: rows.map(toSafeRow),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
