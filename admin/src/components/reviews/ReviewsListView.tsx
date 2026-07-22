"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ActiveBadge } from "@/components/catalog/ActiveBadge";
import { ConfirmDeleteModal } from "@/components/catalog/ConfirmDeleteModal";
import { EmptyState, ErrorState, LoadingList } from "@/components/catalog/ListStates";
import { cn } from "@/lib/cn";
import { deleteReview, fetchReviews } from "@/lib/reviews/client";
import type { Review, ReviewListResponse } from "@/lib/reviews/types";

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "empty" }
  | { type: "success"; data: ReviewListResponse };

export function ReviewsListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") ?? "",
  );
  const activeFilter = searchParams.get("isActive") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [viewState, setViewState] = useState<ViewState>({ type: "loading" });
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
      router.replace(`/dashboard/reviews?${params.toString()}`);
    },
    [router, searchParams],
  );

  const load = useCallback(async () => {
    setViewState({ type: "loading" });
    try {
      const data = await fetchReviews({
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
        data.reviews.length === 0
          ? { type: "empty" }
          : { type: "success", data },
      );
    } catch (error) {
      setViewState({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load reviews",
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
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteReview(deleteTarget._id);
      setDeleteTarget(null);
      await load();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete review",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const pagination =
    viewState.type === "success" ? viewState.data.pagination : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-brown">Reviews</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Manage customer testimonials shown on the homepage.
          </p>
        </div>
        <Link href="/dashboard/reviews/new" className="admin-btn-primary">
          Add review
        </Link>
      </section>

      <section className="admin-card !p-4 sm:!p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name, role, or text…"
            className="admin-input flex-1"
          />
          <select
            value={activeFilter}
            onChange={(event) =>
              updateParams({ isActive: event.target.value || null, page: "1" })
            }
            className="admin-input sm:w-44"
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
          title="No reviews found"
          description="Add a review or adjust your filters."
        />
      )}

      {viewState.type === "success" && (
        <>
          <div className="admin-table-wrap hidden md:block">
            <table className="min-w-full divide-y divide-brand-border/60 text-sm">
              <thead className="bg-brand-pink-lighter/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Review
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {viewState.data.reviews.map((review) => (
                  <tr
                    key={review._id}
                    className="transition-colors hover:bg-brand-pink-lighter/40"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-brand-brown">{review.name}</p>
                      {review.role ? (
                        <p className="text-xs text-brand-muted">{review.role}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-brand-brown">{review.rating}/5</td>
                    <td className="max-w-xs px-4 py-3 text-brand-muted">
                      <p className="line-clamp-2">{review.text}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={review.isActive} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/reviews/${review._id}/edit`}
                        className="mr-3 font-semibold text-brand-primary hover:text-brand-button-hover"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(review)}
                        className="font-semibold text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {viewState.data.reviews.map((review) => (
              <li key={review._id} className="admin-card !p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-brown">{review.name}</p>
                    {review.role ? (
                      <p className="text-xs text-brand-muted">{review.role}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-brand-muted line-clamp-3">
                      {review.text}
                    </p>
                  </div>
                  <ActiveBadge active={review.isActive} />
                </div>
                <div className="mt-3 flex gap-3 text-sm">
                  <Link
                    href={`/dashboard/reviews/${review._id}/edit`}
                    className="font-semibold text-brand-primary"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(review)}
                    className="font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-brand-muted">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => updateParams({ page: String(pagination.page - 1) })}
                  className={cn(
                    "admin-btn-secondary !h-9 !px-3 !text-sm",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateParams({ page: String(pagination.page + 1) })}
                  className={cn(
                    "admin-btn-secondary !h-9 !px-3 !text-sm",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete review?"
        description={
          deleteTarget
            ? `Remove the review from ${deleteTarget.name}? This cannot be undone.`
            : ""
        }
        isDeleting={isDeleting}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
      {deleteError ? (
        <p className="text-sm text-red-700" role="alert">
          {deleteError}
        </p>
      ) : null}
    </div>
  );
}
