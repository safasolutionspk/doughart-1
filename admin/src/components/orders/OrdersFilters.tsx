"use client";

import { ORDER_STATUSES } from "@/lib/orders/types";
import { formatOrderStatus } from "@/lib/orders/format";
import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/lib/orders/types";

type OrdersFiltersProps = {
  search: string;
  status: OrderStatus | "";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OrderStatus | "") => void;
  disabled?: boolean;
  lockStatus?: boolean;
};

export function OrdersFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  disabled,
  lockStatus = false,
}: OrdersFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <label htmlFor="orders-search" className="sr-only">
          Search orders
        </label>
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" strokeLinecap="round" />
        </svg>
        <input
          id="orders-search"
          type="search"
          value={search}
          disabled={disabled}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search order #, name, email, phone…"
          className={cn("admin-input !pl-9", "disabled:cursor-not-allowed disabled:opacity-60")}
        />
      </div>

      {!lockStatus ? (
        <div className="sm:w-48">
          <label htmlFor="orders-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="orders-status"
            value={status}
            disabled={disabled}
            onChange={(event) =>
              onStatusChange(event.target.value as OrderStatus | "")
            }
            className={cn("admin-input", "disabled:cursor-not-allowed disabled:opacity-60")}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {formatOrderStatus(value)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
