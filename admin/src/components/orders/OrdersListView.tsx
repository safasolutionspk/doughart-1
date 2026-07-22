"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { OrdersFilters } from "@/components/orders/OrdersFilters";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { cn } from "@/lib/cn";
import { fetchOrders } from "@/lib/orders/client";
import type { ListOrdersResponse, Order, OrderStatus } from "@/lib/orders/types";

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "empty" }
  | { type: "success"; data: ListOrdersResponse };

type OrdersListViewProps = {
  defaultStatus?: OrderStatus | "";
  lockStatus?: boolean;
  activeOnly?: boolean;
  title?: string;
  description?: string;
};

export function OrdersListView({
  defaultStatus = "",
  lockStatus = false,
  activeOnly = false,
  title = "Orders",
  description = "View and manage customer cake orders.",
}: OrdersListViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") ?? "",
  );
  const status = (
    lockStatus
      ? defaultStatus
      : (searchParams.get("status") ?? defaultStatus)
  ) as OrderStatus | "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [viewState, setViewState] = useState<ViewState>({ type: "loading" });

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (searchInput !== current) {
        updateParams({ search: searchInput || null, page: "1" });
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput, searchParams, updateParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setViewState({ type: "loading" });
      try {
        const data = await fetchOrders({
          search: searchParams.get("search") ?? undefined,
          status: status || undefined,
          activeOnly: activeOnly && !status,
          page,
          limit: 20,
        });

        if (cancelled) {
          return;
        }

        if (data.orders.length === 0) {
          setViewState({ type: "empty" });
        } else {
          setViewState({ type: "success", data });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        setViewState({
          type: "error",
          message:
            error instanceof Error ? error.message : "Failed to load orders",
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [searchParams, status, page, activeOnly]);

  const isLoading = viewState.type === "loading";
  const pagination =
    viewState.type === "success" ? viewState.data.pagination : null;

  function orderMatchesCurrentView(order: Order): boolean {
    if (activeOnly && !status) {
      return order.status !== "completed" && order.status !== "cancelled";
    }
    const filterStatus = lockStatus ? defaultStatus : status;
    if (filterStatus) {
      return order.status === filterStatus;
    }
    return true;
  }

  function handleOrderUpdated(updated: Order) {
    setViewState((prev) => {
      if (prev.type !== "success") {
        return prev;
      }

      if (!orderMatchesCurrentView(updated)) {
        const orders = prev.data.orders.filter((o) => o._id !== updated._id);
        if (orders.length === 0) {
          return { type: "empty" };
        }
        return {
          type: "success",
          data: {
            ...prev.data,
            orders,
            pagination: {
              ...prev.data.pagination,
              total: Math.max(0, prev.data.pagination.total - 1),
            },
          },
        };
      }

      return {
        type: "success",
        data: {
          ...prev.data,
          orders: prev.data.orders.map((o) =>
            o._id === updated._id ? updated : o,
          ),
        },
      };
    });
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-brown sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-brand-muted">{description}</p>
        </div>
        {pagination && (
          <p className="text-sm text-brand-muted">
            {pagination.total} order{pagination.total === 1 ? "" : "s"}
          </p>
        )}
      </section>

      <section className="admin-card !p-4 sm:!p-5">
        <OrdersFilters
          search={searchInput}
          status={status}
          disabled={isLoading}
          lockStatus={lockStatus}
          onSearchChange={setSearchInput}
          onStatusChange={(value) => updateParams({ status: value || null, page: "1" })}
        />
      </section>

      <section className="min-h-[12rem]">
        {viewState.type === "loading" && (
          <div className="space-y-3" aria-live="polite" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-xl bg-brand-pink-lighter"
              />
            ))}
          </div>
        )}

        {viewState.type === "error" && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center"
            role="alert"
          >
            <p className="text-sm font-medium text-red-800">{viewState.message}</p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-3 text-sm font-semibold text-red-700 underline-offset-2 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {viewState.type === "empty" && (
          <div className="rounded-2xl border border-dashed border-brand-border bg-brand-pink-lighter/50 px-4 py-12 text-center">
            <p className="text-sm font-medium text-brand-brown">No orders found</p>
            <p className="mt-1 text-sm text-brand-muted">
              {searchParams.get("search") || status
                ? "Try adjusting your search or filters."
                : "New customer orders will appear here."}
            </p>
          </div>
        )}

        {viewState.type === "success" && (
          <>
            <OrdersTable
              orders={viewState.data.orders}
              onOrderUpdated={handleOrderUpdated}
              enableQuickStatus={activeOnly}
            />

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-sm text-brand-muted">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || isLoading}
                    onClick={() =>
                      updateParams({ page: String(pagination.page - 1) })
                    }
                    className={cn(
                      "admin-btn-secondary !h-9 !px-3 !text-sm",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || isLoading
                    }
                    onClick={() =>
                      updateParams({ page: String(pagination.page + 1) })
                    }
                    className={cn(
                      "admin-btn-secondary !h-9 !px-3 !text-sm",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
