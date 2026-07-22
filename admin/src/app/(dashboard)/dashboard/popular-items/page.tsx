import { Suspense } from "react";
import { PopularItemsListView } from "@/components/analytics/PopularItemsListView";
import { LoadingList } from "@/components/catalog/ListStates";

export default function PopularItemsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">
          Catalog insights
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-brand-brown sm:text-3xl">
          Popular Items
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Read-only ranking based on confirmed catalog purchases. Product
          changes belong on the Cakes page.
        </p>
      </header>

      <Suspense fallback={<LoadingList rows={8} />}>
        <PopularItemsListView />
      </Suspense>
    </div>
  );
}
