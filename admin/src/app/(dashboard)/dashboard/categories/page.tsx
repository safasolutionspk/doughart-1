import { Suspense } from "react";
import { CategoriesListView } from "@/components/catalog/CategoriesListView";
import { LoadingList } from "@/components/catalog/ListStates";

export default function CategoriesPage() {
  return (
    <Suspense fallback={<LoadingList />}>
      <CategoriesListView />
    </Suspense>
  );
}
