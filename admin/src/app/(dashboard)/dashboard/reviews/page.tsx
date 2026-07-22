import { Suspense } from "react";
import { ReviewsListView } from "@/components/reviews/ReviewsListView";
import { LoadingList } from "@/components/catalog/ListStates";

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6" aria-hidden>
          <div className="h-10 w-40 animate-pulse rounded-lg bg-brand-pink-lighter" />
          <LoadingList />
        </div>
      }
    >
      <ReviewsListView />
    </Suspense>
  );
}
