"use client";

import { useCallback, useEffect, useState } from "react";
import { CustomCakeRequestCard } from "@/components/orders/CustomCakeRequestCard";
import { fetchOrders } from "@/lib/orders/client";
import type { Order } from "@/lib/orders/types";

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "empty" }
  | { type: "success"; orders: Order[] };

export function CustomCakeRequestsView() {
  const [viewState, setViewState] = useState<ViewState>({ type: "loading" });

  const load = useCallback(async () => {
    setViewState({ type: "loading" });
    try {
      const data = await fetchOrders({
        awaitingQuote: true,
        limit: 50,
        page: 1,
      });
      if (data.orders.length === 0) {
        setViewState({ type: "empty" });
      } else {
        setViewState({ type: "success", orders: data.orders });
      }
    } catch (error) {
      setViewState({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load custom cake requests",
      });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function handleOrderUpdated(updated: Order) {
    setViewState((prev) => {
      if (prev.type !== "success") {
        return prev;
      }
      const quoted =
        updated.quotedAmount != null && updated.quotedAmount > 0;
      const stillPending =
        updated.status !== "cancelled" && !quoted;
      const orders = stillPending
        ? prev.orders.map((o) => (o._id === updated._id ? updated : o))
        : prev.orders.filter((o) => o._id !== updated._id);
      if (orders.length === 0) {
        return { type: "empty" };
      }
      return { type: "success", orders };
    });
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-2xl font-bold text-brand-brown sm:text-3xl">
          Custom cake requests
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-brand-muted">
          Review bespoke cake requests, set an approved price, or cancel. Approved
          orders move to{" "}
          <span className="font-medium text-brand-brown">All orders</span> with
          status Confirmed.
        </p>
      </section>

      {viewState.type === "loading" && (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-brand-pink-lighter"
            />
          ))}
        </div>
      )}

      {viewState.type === "error" && (
        <div className="admin-card text-center text-sm text-red-700" role="alert">
          {viewState.message}
          <button
            type="button"
            onClick={load}
            className="mt-3 block w-full font-semibold text-brand-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {viewState.type === "empty" && (
        <div className="admin-card text-center">
          <p className="font-display text-lg font-semibold text-brand-brown">
            No pending custom cake requests
          </p>
          <p className="mt-2 text-sm text-brand-muted">
            New requests from the website custom cake form will appear here until
            you approve a price.
          </p>
        </div>
      )}

      {viewState.type === "success" && (
        <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          {viewState.orders.map((order) => (
            <li key={order._id}>
              <CustomCakeRequestCard
                order={order}
                onUpdated={handleOrderUpdated}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
