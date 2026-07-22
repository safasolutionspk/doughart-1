import { cn } from "@/lib/cn";
import { formatOrderStatus } from "@/lib/orders/format";
import type { OrderStatus } from "@/lib/orders/types";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-800 ring-blue-200",
  baking: "bg-orange-50 text-orange-800 ring-orange-200",
  out_for_delivery: "bg-violet-50 text-violet-800 ring-violet-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        statusStyles[status],
        className,
      )}
    >
      {formatOrderStatus(status)}
    </span>
  );
}
