import Link from "next/link";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { EmailAnalyticsPanel } from "@/components/dashboard/EmailAnalyticsPanel";
import { NewOrderAlerts } from "@/components/dashboard/NewOrderAlerts";
import { backendFetch } from "@/lib/backend/fetch";
import type { DashboardAnalytics } from "@/lib/analytics/types";
import type {
  EmailAnalyticsSummary,
  EmailAttemptRow,
} from "@/lib/email/types";
import { getAdminSession } from "@/lib/auth/session";

const emptyAnalytics: DashboardAnalytics = {
  totalOrders: 0,
  pendingOrders: 0,
  totalRevenue: 0,
  paidRevenue: 0,
  unpaidRevenue: 0,
  paidOrders: 0,
  unpaidOrders: 0,
};

export default async function DashboardPage() {
  const session = await getAdminSession();
  const admin = session?.profile;

  let analytics = emptyAnalytics;
  let analyticsError: string | null = null;

  let emailSummary: EmailAnalyticsSummary | null = null;
  let emailAttempts: EmailAttemptRow[] = [];
  let emailError: string | null = null;

  const [analyticsResult, emailSummaryResult, emailAttemptsResult] =
    await Promise.all([
      backendFetch<DashboardAnalytics>("/api/analytics/dashboard", {
        cache: "no-store",
      }),
      backendFetch<EmailAnalyticsSummary>("/api/analytics/emails/summary", {
        cache: "no-store",
      }),
      backendFetch<EmailAttemptRow[]>(
        "/api/analytics/emails/attempts?limit=20&page=1",
        { cache: "no-store" },
      ),
    ]);

  if (analyticsResult.ok && analyticsResult.data) {
    analytics = analyticsResult.data;
  } else if (!analyticsResult.ok) {
    analyticsError = analyticsResult.message;
  }

  if (emailSummaryResult.ok && emailSummaryResult.data) {
    emailSummary = emailSummaryResult.data;
  } else if (!emailSummaryResult.ok) {
    emailError = emailSummaryResult.message;
  }

  if (emailAttemptsResult.ok && emailAttemptsResult.data) {
    emailAttempts = emailAttemptsResult.data;
  } else if (!emailAttemptsResult.ok && !emailError) {
    emailError = emailAttemptsResult.message;
  }

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <p className="admin-eyebrow">Operations overview</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-brand-brown sm:text-3xl">
          {admin ? `Hello, ${admin.name}` : "Admin dashboard"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-muted">
          Monitor order pipeline, payment collection, and transactional email
          attempts with safe indicators based on current data.
        </p>
      </section>

      {analyticsError ? (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          Could not load analytics: {analyticsError}
        </div>
      ) : null}

      <NewOrderAlerts />

      <section className="space-y-3">
        <div className="px-1">
          <h2 className="font-display text-lg font-semibold text-brand-brown sm:text-xl">
            Dashboard analytics
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Payment collection, pending workload, and revenue risk from existing
            analytics totals.
          </p>
        </div>
        <DashboardStats analytics={analytics} />
      </section>

      <EmailAnalyticsPanel
        summary={emailSummary}
        attempts={emailAttempts}
        error={emailError}
      />

      <section className="admin-card">
        <h2 className="font-display text-base font-semibold text-brand-brown">Quick actions</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <Link
              href="/dashboard/orders"
              className="flex h-full flex-col rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-brand-brown shadow-sm transition-all duration-300 hover:border-brand-primary hover:bg-brand-pink-lighter hover:shadow-md"
            >
              View orders
              <span className="mt-1 text-xs font-normal text-brand-muted">
                Manage status & payments
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/cakes"
              className="flex h-full flex-col rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-brand-brown shadow-sm transition-all duration-300 hover:border-brand-primary hover:bg-brand-pink-lighter hover:shadow-md"
            >
              Menu
              <span className="mt-1 text-xs font-normal text-brand-muted">
                Add or edit products
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/categories"
              className="flex h-full flex-col rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-brand-brown shadow-sm transition-all duration-300 hover:border-brand-primary hover:bg-brand-pink-lighter hover:shadow-md"
            >
              Categories
              <span className="mt-1 text-xs font-normal text-brand-muted">
                Organize your shop
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/settings"
              className="flex h-full flex-col rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-brand-brown shadow-sm transition-all duration-300 hover:border-brand-primary hover:bg-brand-pink-lighter hover:shadow-md"
            >
              Settings
              <span className="mt-1 text-xs font-normal text-brand-muted">
                Contact & branding
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
