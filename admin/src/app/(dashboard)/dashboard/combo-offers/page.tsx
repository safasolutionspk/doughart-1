import { Suspense } from "react";
import { ComboOffersListView } from "@/components/catalog/ComboOffersListView";
import { LoadingList } from "@/components/catalog/ListStates";

export default function ComboOffersPage() {
  return (
    <Suspense fallback={<LoadingList />}>
      <ComboOffersListView />
    </Suspense>
  );
}
