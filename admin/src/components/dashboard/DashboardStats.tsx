import Link from "next/link";
import { formatAnalyticsCurrency } from "@/lib/analytics/format";
import type { DashboardAnalytics } from "@/lib/analytics/types";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  href?: string;
  accent?: "default" | "amber" | "emerald" | "rose";
};

const accentStyles = {
  default: "text-brand-brown",
  amber: "text-amber-700",
  emerald: "text-emerald-700",
  rose: "text-brand-primary",
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

type ProgressSplitProps = {
  title: string;
  paidLabel: string;
  unpaidLabel: string;
  paidValue: number;
  unpaidValue: number;
  paidDisplay: string;
  unpaidDisplay: string;
  description: string;
};

function ProgressSplit({
  title,
  paidLabel,
  unpaidLabel,
  paidValue,
  unpaidValue,
  paidDisplay,
  unpaidDisplay,
  description,
}: ProgressSplitProps) {
  const total = paidValue + unpaidValue;
  const paidRatio = total > 0 ? (paidValue / total) * 100 : 0;
  const unpaidRatio = total > 0 ? (unpaidValue / total) * 100 : 0;

  return (
    <article className="admin-card">
      <p className="text-sm font-medium text-brand-muted">{title}</p>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-brand-border/50">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${paidRatio}%` }}
            aria-hidden
          />
          <div
            className="h-full bg-rose-400 transition-all"
            style={{ width: `${unpaidRatio}%` }}
            aria-hidden
          />
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {paidLabel}
          </p>
          <p className="mt-1 font-semibold text-brand-brown">{paidDisplay}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            {unpaidLabel}
          </p>
          <p className="mt-1 font-semibold text-brand-brown">{unpaidDisplay}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-brand-muted">{description}</p>
    </article>
  );
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
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}

export function DashboardStats({ analytics }: { analytics: DashboardAnalytics }) {
  const totalOrders = sanitizeNumber(analytics.totalOrders);
  const pendingOrders = sanitizeNumber(analytics.pendingOrders);
  const totalRevenue = sanitizeNumber(analytics.totalRevenue);
  const paidRevenue = sanitizeNumber(analytics.paidRevenue);
  const unpaidRevenue = sanitizeNumber(analytics.unpaidRevenue);
  const paidOrders = sanitizeNumber(analytics.paidOrders);
  const unpaidOrders = sanitizeNumber(analytics.unpaidOrders);

  const pendingOrderRate =
    totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0;
  const paymentDenominator =
    paidOrders + unpaidOrders > 0 ? paidOrders + unpaidOrders : totalOrders;
  const paymentCollectionRate =
    paymentDenominator > 0 ? (paidOrders / paymentDenominator) * 100 : 0;
  const unpaidAmountRisk =
    totalRevenue > 0 ? (unpaidRevenue / totalRevenue) * 100 : 0;

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <StatCard
          label="Payment collection rate"
          value={toPercent(paymentCollectionRate)}
          hint={`${paidOrders} paid order(s) out of ${paymentDenominator}`}
          accent="emerald"
        />
        <StatCard
          label="Unpaid amount risk"
          value={toPercent(unpaidAmountRisk)}
          hint={`${formatAnalyticsCurrency(unpaidRevenue)} still not collected`}
          accent="rose"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ProgressSplit
          title="Payment Status Overview"
          paidLabel="Paid orders"
          unpaidLabel="Unpaid orders"
          paidValue={paidOrders}
          unpaidValue={unpaidOrders}
          paidDisplay={`${paidOrders} (${toPercent(paymentCollectionRate)})`}
          unpaidDisplay={`${unpaidOrders} (${toPercent(100 - paymentCollectionRate)})`}
          description="Order-level payment status split based on current paid and unpaid order counts."
        />
        <ProgressSplit
          title="Revenue Collection Overview"
          paidLabel="Paid revenue"
          unpaidLabel="Unpaid revenue"
          paidValue={paidRevenue}
          unpaidValue={unpaidRevenue}
          paidDisplay={formatAnalyticsCurrency(paidRevenue)}
          unpaidDisplay={formatAnalyticsCurrency(unpaidRevenue)}
          description={`Total revenue tracked: ${formatAnalyticsCurrency(totalRevenue)}.`}
        />
      </div>

      <p className="text-xs text-brand-muted">
        Visitor-to-order conversion rate is not shown because visitor/session tracking is not available yet.
      </p>
    </section>
  );
}
