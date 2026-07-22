import { Suspense } from "react";
import { MarkOrdersViewedOnMount } from "@/components/orders/MarkOrdersViewedOnMount";
import { OrdersListView } from "@/components/orders/OrdersListView";

function OrdersListFallback() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-10 w-40 animate-pulse rounded-lg bg-brand-pink-lighter" />
      <div className="h-24 animate-pulse rounded-2xl bg-brand-pink-lighter" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-xl bg-brand-pink-lighter" />
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <>
      <MarkOrdersViewedOnMount group="active" />
      <Suspense fallback={<OrdersListFallback />}>
      <OrdersListView
        title="Active orders"
        description="Orders in progress — pending, confirmed, baking, or out for delivery."
        activeOnly
      />
      </Suspense>
    </>
  );
}
