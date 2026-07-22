import { Suspense } from "react";
import { CakesListView } from "@/components/catalog/CakesListView";
import { LoadingList } from "@/components/catalog/ListStates";

export default function CakesPage() {
  return (
    <Suspense fallback={<LoadingList />}>
      <CakesListView />
    </Suspense>
  );
}
