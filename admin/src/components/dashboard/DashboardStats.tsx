import Link from "next/link";
import type { DashboardAnalytics } from "@/lib/analytics/types";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  href?: string;
  accent?: "default" | "amber";
};

const accentStyles = {
  default: "text-brand-brown",
  amber: "text-amber-700",
};

function sanitizeNumber(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  return value;
}

function toPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function StatCard({ label, value, hint, href, accent = "default" }: StatCardProps) {
  const content = (
    <article className="admin-card transition-all duration-300 hover:-translate-y-0.5">
      <p className="text-sm font-medium text-brand-muted">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accentStyles[accent]}`}>
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-brand-muted">{hint}</p>
    </article>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export function DashboardStats({ analytics }: { analytics: DashboardAnalytics }) {
  const totalOrders = sanitizeNumber(analytics.totalOrders);
  const pendingOrders = sanitizeNumber(analytics.pendingOrders);

  const pendingOrderRate =
    totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0;

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total orders"
          value={String(totalOrders)}
          hint="All orders recorded in your bakery dashboard"
          href="/dashboard/orders"
        />
        <StatCard
          label="Pending orders"
          value={String(pendingOrders)}
          hint={`${toPercent(pendingOrderRate)} of total orders are still pending`}
          href="/dashboard/orders?status=pending"
          accent="amber"
        />
      </div>

      <p className="text-xs text-brand-muted">
        Visitor-to-order conversion rate is not shown because visitor/session
        tracking is not available yet.
      </p>
    </section>
  );
}
