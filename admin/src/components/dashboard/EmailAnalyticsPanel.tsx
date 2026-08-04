import type {
  EmailAnalyticsSummary,
  EmailAttemptRow,
} from "@/lib/email/types";

function sanitizeNumber(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  return value;
}

const STATUS_LABELS: Record<string, string> = {
  sent: "Sent",
  failed: "Failed",
  skipped: "Skipped",
  pending: "Pending",
};

const TYPE_LABELS: Record<string, string> = {
  owner_order_created: "Owner — new order",
  customer_order_created: "Customer — order received",
  customer_order_confirmed: "Customer — order confirmed",
  customer_quote_ready: "Customer — quote ready",
  contact_owner_notification: "Owner — contact us",
  customer_password_reset: "Customer — password reset",
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type EmailAnalyticsPanelProps = {
  summary: EmailAnalyticsSummary | null;
  attempts: EmailAttemptRow[];
  error: string | null;
};

export function EmailAnalyticsPanel({
  summary,
  attempts,
  error,
}: EmailAnalyticsPanelProps) {
  if (error) {
    return (
      <div
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        role="alert"
      >
        Could not load email analytics: {error}
      </div>
    );
  }

  const total = sanitizeNumber(summary?.total);
  const sent = sanitizeNumber(summary?.sent);
  const failed = sanitizeNumber(summary?.failed);
  const skipped = sanitizeNumber(summary?.skipped);

  return (
    <section className="space-y-4">
      <div className="px-1">
        <h2 className="font-display text-lg font-semibold text-brand-brown sm:text-xl">
          Email delivery attempts
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Tracked transactional email outcomes.{" "}
          <span
            className="underline decoration-dotted underline-offset-2"
            title="Sent means the configured email provider accepted the message. It does not guarantee inbox delivery."
          >
            Sent means the configured email provider accepted the message. It does
            not guarantee inbox delivery.
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="admin-card">
          <p className="text-sm font-medium text-brand-muted">Total Email Attempts</p>
          <p className="mt-2 text-3xl font-semibold text-brand-brown">{total}</p>
        </article>
        <article className="admin-card">
          <p className="text-sm font-medium text-brand-muted">Sent</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">{sent}</p>
        </article>
        <article className="admin-card">
          <p className="text-sm font-medium text-brand-muted">Failed</p>
          <p className="mt-2 text-3xl font-semibold text-brand-primary">{failed}</p>
        </article>
        <article className="admin-card">
          <p className="text-sm font-medium text-brand-muted">Skipped</p>
          <p className="mt-2 text-3xl font-semibold text-amber-700">{skipped}</p>
        </article>
      </div>

      <div className="admin-card overflow-hidden p-0">
        <div className="border-b border-brand-border px-4 py-3">
          <h3 className="font-display text-base font-semibold text-brand-brown">
            Recent attempts
          </h3>
        </div>

        {attempts.length === 0 ? (
          <p className="px-4 py-8 text-sm text-brand-muted">
            No email attempts recorded yet. Attempts appear after order, quote,
            contact, or password-reset emails are processed.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-pink-lighter/40 text-xs uppercase tracking-wide text-brand-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date &amp; Time</th>
                  <th className="px-4 py-3 font-semibold">Email Type</th>
                  <th className="px-4 py-3 font-semibold">Audience</th>
                  <th className="px-4 py-3 font-semibold">Order Number</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Safe Reason</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-brand-border/70 text-brand-brown"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatWhen(row.attemptedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {TYPE_LABELS[row.emailType] ?? row.emailType}
                    </td>
                    <td className="px-4 py-3 capitalize">{row.audience}</td>
                    <td className="px-4 py-3">{row.orderNumber ?? "—"}</td>
                    <td className="px-4 py-3">
                      {STATUS_LABELS[row.status] ?? row.status}
                    </td>
                    <td className="px-4 py-3 text-brand-muted">
                      {row.reasonCode ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
