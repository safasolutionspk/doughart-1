import { Suspense } from "react";
import { CustomCakeRequestsView } from "@/components/orders/CustomCakeRequestsView";
import { MarkOrdersViewedOnMount } from "@/components/orders/MarkOrdersViewedOnMount";

export default function CustomCakeRequestsPage() {
  return (
    <>
      <MarkOrdersViewedOnMount group="custom_cakes" />
      <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-2xl bg-brand-pink-lighter" />
      }
    >
      <CustomCakeRequestsView />
    </Suspense>
    </>
  );
}
