import { cn } from "@/lib/cn";
import { formatPaymentStatus } from "@/lib/orders/format";
import type { PaymentStatus } from "@/lib/orders/types";

const statusStyles: Record<PaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  failed: "bg-red-50 text-red-800 ring-red-200",
};

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        statusStyles[status] ?? "bg-brand-pink-lighter text-brand-muted ring-brand-border",
        className,
      )}
    >
      {formatPaymentStatus(status)}
    </span>
  );
}
