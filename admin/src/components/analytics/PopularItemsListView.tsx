"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingList,
} from "@/components/catalog/ListStates";
import { CatalogImage } from "@/components/catalog/CatalogImage";
import { fetchPopularCakes } from "@/lib/analytics/popularClient";
import type {
  AdminPopularCakeRow,
  PopularCakesListResponse,
} from "@/lib/analytics/popularTypes";
import { formatAnalyticsCurrency } from "@/lib/analytics/format";
import { formatDateTime } from "@/lib/orders/format";
import { cn } from "@/lib/cn";

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "empty" }
  | { type: "success"; data: PopularCakesListResponse };

function statusLabel(row: AdminPopularCakeRow): string {
  if (!row.cakeExists) {
    return "Deleted";
  }
  if (row.isActive === false) {
    return "Inactive";
  }
  if (row.isActive === true) {
    return "Active";
  }
  return "Unknown";
}

export function PopularItemsListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const [viewState, setViewState] = useState<ViewState>({ type: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  const updatePage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPage));
      router.replace(`/dashboard/popular-items?${params.toString()}`);
    },
    [router, searchParams],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      // Yield so loading/error/success updates happen in async continuations,
      // not synchronously inside the effect body (react-hooks/set-state-in-effect).
      await Promise.resolve();
      if (cancelled) {
        return;
      }

      setViewState({ type: "loading" });

      try {
        const data = await fetchPopularCakes({ page, limit: 20 });
        if (cancelled) {
          return;
        }
        setViewState(
          data.rows.length === 0
            ? { type: "empty" }
            : { type: "success", data },
        );
      } catch (error) {
        if (cancelled) {
          return;
        }
        setViewState({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load popular items",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, reloadToken]);

  if (viewState.type === "loading") {
    return <LoadingList rows={8} />;
  }

  if (viewState.type === "error") {
    return (
      <ErrorState
        message={viewState.message}
        onRetry={() => setReloadToken((token) => token + 1)}
      />
    );
  }

  if (viewState.type === "empty") {
    return (
      <EmptyState
        title="No cakes to rank"
        description="Cakes and Combo Offers from the catalog appear here with successful-order counts. Add products on the Cakes or Combo Offers pages."
      />
    );
  }

  const { rows, pagination } = viewState.data;

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-pink-lighter/70 text-xs uppercase tracking-wide text-brand-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Rank</th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Successful Orders</th>
              <th className="px-4 py-3 font-semibold">Revenue</th>
              <th className="px-4 py-3 font-semibold">Last purchase</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.cakeId}
                className="border-t border-brand-border/50 text-brand-brown"
              >
                <td className="px-4 py-3 font-display font-semibold text-brand-primary">
                  #{row.rank}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-pink-lighter">
                      <CatalogImage
                        image={row.image}
                        alt={row.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.name}</p>
                      <p className="truncate text-xs text-brand-muted">
                        {row.cakeId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {formatAnalyticsCurrency(row.price)}
                </td>
                <td className="px-4 py-3 font-semibold">
                  {row.successfulOrderCount}
                </td>
                <td className="px-4 py-3">
                  {formatAnalyticsCurrency(row.totalRevenue)}
                </td>
                <td className="px-4 py-3">
                  {formatDateTime(row.lastPurchasedAt)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={statusLabel(row)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={row.cakeId}
            className="rounded-2xl border border-brand-border/70 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-pink-lighter">
                <CatalogImage
                  image={row.image}
                  alt={row.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-brand-primary">
                  #{row.rank}
                </p>
                <p className="truncate font-medium text-brand-brown">
                  {row.name}
                </p>
                <p className="mt-1 text-sm text-brand-brown">
                  {formatAnalyticsCurrency(row.price)}
                </p>
                <StatusBadge label={statusLabel(row)} className="mt-2" />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-brand-muted">
              <div>
                <dt>Successful Orders</dt>
                <dd className="font-semibold text-brand-brown">
                  {row.successfulOrderCount}
                </dd>
              </div>
              <div>
                <dt>Revenue</dt>
                <dd className="font-semibold text-brand-brown">
                  {formatAnalyticsCurrency(row.totalRevenue)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt>Last purchase</dt>
                <dd className="font-semibold text-brand-brown">
                  {formatDateTime(row.lastPurchasedAt)}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => updatePage(page - 1)}
            className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-brown disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-sm text-brand-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => updatePage(page + 1)}
            className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-brown disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const tone =
    label === "Active"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : label === "Inactive"
        ? "bg-amber-50 text-amber-900 border-amber-200"
        : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
