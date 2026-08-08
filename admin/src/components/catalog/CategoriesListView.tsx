"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CategoryGridCard } from "@/components/catalog/CategoryGridCard";
import { ConfirmDeleteModal } from "@/components/catalog/ConfirmDeleteModal";
import { EmptyState, ErrorState, LoadingList } from "@/components/catalog/ListStates";
import { deleteCategory, fetchCategories } from "@/lib/catalog/client";
import { CATEGORIES_REFRESH_EVENT } from "@/lib/catalog/events";
import type { Category, CategoryListResponse } from "@/lib/catalog/types";
import { isSystemCategory } from "@/lib/catalog/types";

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "empty" }
  | { type: "success"; data: CategoryListResponse };

export function CategoriesListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") ?? "",
  );
  const activeFilter = searchParams.get("isActive") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [viewState, setViewState] = useState<ViewState>({ type: "loading" });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
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
      router.replace(`/dashboard/categories?${params.toString()}`);
    },
    [router, searchParams],
  );

  const load = useCallback(async () => {
    setViewState({ type: "loading" });
    try {
      const data = await fetchCategories({
        search: searchParams.get("search") ?? undefined,
        isActive:
          activeFilter === "true"
            ? true
            : activeFilter === "false"
              ? false
              : "",
        page,
        limit: 20,
      });
      setViewState(
        data.categories.length === 0
          ? { type: "empty" }
          : { type: "success", data },
      );
    } catch (error) {
      setViewState({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to load categories",
      });
    }
  }, [searchParams, activeFilter, page]);

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
    if (pathname === "/dashboard/categories") {
      const timer = window.setTimeout(() => {
        void load();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [load, pathname]);

  useEffect(() => {
    const onRefresh = () => {
      void load();
    };
    window.addEventListener(CATEGORIES_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(CATEGORIES_REFRESH_EVENT, onRefresh);
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }
    if (isSystemCategory(deleteTarget)) {
      setDeleteError("Combo Offers is a system category and cannot be deleted.");
      return;
    }
    const targetId = deleteTarget._id;
    setDeletingId(targetId);
    setDeleteError(null);
    try {
      await deleteCategory(targetId);
      setDeleteTarget(null);
      setViewState((prev) => {
        if (prev.type !== "success") {
          return prev;
        }
        const categories = prev.data.categories.filter((c) => c._id !== targetId);
        const total = Math.max(0, prev.data.pagination.total - 1);
        return {
          type: "success",
          data: {
            categories,
            pagination: {
              ...prev.data.pagination,
              total,
              totalPages: Math.max(
                1,
                Math.ceil(total / prev.data.pagination.limit),
              ),
            },
          },
        };
      });
      await load();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete category",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const pagination =
    viewState.type === "success" ? viewState.data.pagination : null;
  const isDeleting = Boolean(deletingId);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-brown sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            Organize cakes into browseable groups.
          </p>
        </div>
        <Link href="/dashboard/categories/new" className="admin-btn-primary shrink-0">
          Add category
        </Link>
      </section>

      <section className="admin-card !p-4 sm:!p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name or slug…"
            className="admin-input h-11 flex-1 rounded-2xl border-2 border-brand-border"
          />
          <select
            value={activeFilter}
            onChange={(event) =>
              updateParams({ isActive: event.target.value || null, page: "1" })
            }
            className="admin-input h-11 rounded-2xl border-2 border-brand-border sm:w-44"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </section>

      {viewState.type === "loading" && <LoadingList />}
      {viewState.type === "error" && (
        <ErrorState message={viewState.message} onRetry={load} />
      )}
      {viewState.type === "empty" && (
        <EmptyState
          title="No categories found"
          description="Create a category or adjust your filters."
        />
      )}

      {viewState.type === "success" && (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {viewState.data.categories.map((category) => (
              <li key={category._id} className="h-full">
                <CategoryGridCard
                  category={category}
                  onDelete={() => setDeleteTarget(category)}
                  isDeleting={deletingId === category._id}
                  isEditPending={pendingEditId === category._id}
                  onEditClick={() => setPendingEditId(category._id)}
                  isProtected={isSystemCategory(category)}
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
        title="Delete category?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. This cannot be undone if menu items still reference it.`
            : ""
        }
        isDeleting={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
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
