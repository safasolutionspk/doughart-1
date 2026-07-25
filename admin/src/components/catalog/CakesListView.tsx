"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CakeGridCard } from "@/components/catalog/CakeGridCard";
import { CakesTable } from "@/components/catalog/CakesTable";
import { ConfirmDeleteModal } from "@/components/catalog/ConfirmDeleteModal";
import { EmptyState, ErrorState, LoadingList } from "@/components/catalog/ListStates";
import { cn } from "@/lib/cn";
import { deleteCake, fetchCakes, fetchCategories } from "@/lib/catalog/client";
import type { Cake, CakeListResponse, Category } from "@/lib/catalog/types";

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "empty" }
  | { type: "success"; data: CakeListResponse };

export function CakesListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") ?? "",
  );
  const categoryFilter = searchParams.get("categoryId") ?? "";
  const activeFilter = searchParams.get("isActive") ?? "";
  const featuredFilter = searchParams.get("isFeatured") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [categories, setCategories] = useState<Category[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ type: "loading" });
  const [deleteTarget, setDeleteTarget] = useState<Cake | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.replace(`/dashboard/cakes?${params.toString()}`);
    },
    [router, searchParams],
  );

  useEffect(() => {
    fetchCategories({ limit: 100 })
      .then((result) => setCategories(result.categories))
      .catch(() => setCategories([]));
  }, []);

  const load = useCallback(async () => {
    setViewState({ type: "loading" });
    try {
      const data = await fetchCakes({
        search: searchParams.get("search") ?? undefined,
        categoryId: categoryFilter || undefined,
        isActive:
          activeFilter === "true"
            ? true
            : activeFilter === "false"
              ? false
              : "",
        isFeatured:
          featuredFilter === "true"
            ? true
            : featuredFilter === "false"
              ? false
              : "",
        page,
        limit: 20,
      });
      setViewState(
        data.cakes.length === 0 ? { type: "empty" } : { type: "success", data },
      );
    } catch (error) {
      setViewState({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load menu items",
      });
    }
  }, [searchParams, categoryFilter, activeFilter, featuredFilter, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (searchInput !== current) {
        updateParams({ search: searchInput || null, page: "1" });
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput, searchParams, updateParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }
    setDeletingId(deleteTarget._id);
    setDeleteError(null);
    try {
      await deleteCake(deleteTarget._id);
      setDeleteTarget(null);
      await load();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete menu item",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const pagination = viewState.type === "success" ? viewState.data.pagination : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-brand-brown sm:text-2xl">
            Menu
          </h1>
          <p className="mt-1 text-sm text-brand-muted">Manage your menu catalog.</p>
        </div>
        <Link
          href="/dashboard/cakes/new"
          className="admin-btn-primary w-fit shrink-0 self-start sm:self-auto"
        >
          Add menu item
        </Link>
      </section>

      <section className="admin-card !p-3 sm:!p-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name or slug…"
            className={cn(
              "admin-input",
            )}
          />
          <select
            value={categoryFilter}
            onChange={(event) =>
              updateParams({ categoryId: event.target.value || null, page: "1" })
            }
            className="admin-input"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={activeFilter}
            onChange={(event) =>
              updateParams({ isActive: event.target.value || null, page: "1" })
            }
            className="admin-input"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select
            value={featuredFilter}
            onChange={(event) =>
              updateParams({ isFeatured: event.target.value || null, page: "1" })
            }
            className="admin-input sm:col-span-2 lg:col-span-1"
          >
            <option value="">Featured: any</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </select>
        </div>
      </section>

      {viewState.type === "loading" && <LoadingList />}
      {viewState.type === "error" && (
        <ErrorState message={viewState.message} onRetry={load} />
      )}
      {viewState.type === "empty" && (
        <EmptyState
          title="No menu items found"
          description="Add a menu item or adjust your filters."
        />
      )}

      {viewState.type === "success" && (
        <>
          <CakesTable
            cakes={viewState.data.cakes}
            onDelete={setDeleteTarget}
            deletingId={deletingId}
          />
          <ul className="grid grid-cols-2 gap-3 lg:hidden">
            {viewState.data.cakes.map((cake) => (
              <li key={cake._id} className="h-full">
                <CakeGridCard
                  cake={cake}
                  onDelete={() => setDeleteTarget(cake)}
                  isDeleting={deletingId === cake._id}
                />
              </li>
            ))}
          </ul>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-brand-muted">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => updateParams({ page: String(pagination.page - 1) })}
                  className="admin-btn-secondary !h-9 !px-3 !text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateParams({ page: String(pagination.page + 1) })}
                  className="admin-btn-secondary !h-9 !px-3 !text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete menu item?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed from the catalog.`
            : ""
        }
        isDeleting={Boolean(deletingId)}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
      {deleteError && (
        <p className="text-sm text-red-700" role="alert">
          {deleteError}
        </p>
      )}
    </div>
  );
}
