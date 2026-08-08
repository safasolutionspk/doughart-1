"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDeleteModal } from "@/components/catalog/ConfirmDeleteModal";
import { EmptyState, ErrorState, LoadingList } from "@/components/catalog/ListStates";
import { cn } from "@/lib/cn";
import {
  deleteGalleryImage,
  fetchGallery,
  uploadGalleryImage,
} from "@/lib/upload/client";
import type { GalleryImage } from "@/lib/upload/types";
import {
  IMAGE_UPLOAD_ACCEPT,
  validateImageUploadFile,
} from "@/lib/upload/constants";
import { resolveImageSrc } from "@/lib/upload/path";

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "empty" }
  | { type: "success"; images: GalleryImage[] };

/**
 * Admin Gallery image manager — dedicated GalleryImage records only.
 * Does not manage menu/category/combo/review/settings images.
 */
export function GalleryView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewState, setViewState] = useState<ViewState>({ type: "loading" });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setViewState({ type: "loading" });
    setUploadError(null);
    setDeleteError(null);
    try {
      const images = await fetchGallery();
      setViewState(
        images.length === 0 ? { type: "empty" } : { type: "success", images },
      );
    } catch (error) {
      setViewState({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to load gallery",
      });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function openFilePicker() {
    if (isUploading || isDeleting) {
      return;
    }
    inputRef.current?.click();
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateImageUploadFile(file);
    if (validationError) {
      setUploadError(validationError);
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const created = await uploadGalleryImage(file);
      setViewState((prev) => {
        if (prev.type === "success") {
          return {
            type: "success",
            images: [created, ...prev.images.filter((img) => img.id !== created.id)],
          };
        }
        return { type: "success", images: [created] };
      });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleDelete() {
    if (!deleteTarget || isDeleting) {
      return;
    }

    const targetId = deleteTarget.id;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteGalleryImage(targetId);
      setDeleteTarget(null);
      setViewState((prev) => {
        if (prev.type !== "success") {
          return prev;
        }
        const images = prev.images.filter((img) => img.id !== targetId);
        return images.length === 0
          ? { type: "empty" }
          : { type: "success", images };
      });
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete image",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const busy = isUploading || isDeleting;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-brown sm:text-3xl">
            Gallery / Images
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-brand-muted">
            Manage photos for the public Gallery page. Menu, category, combo,
            review, and settings images are managed elsewhere and are never
            listed or deleted here.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            className="sr-only"
            disabled={busy}
            onChange={handleUpload}
          />
          <button
            type="button"
            disabled={busy}
            onClick={openFilePicker}
            className="admin-btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Uploading…" : "Upload Image"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-brand-border bg-brand-pink-lighter/50 p-4 text-center text-sm text-brand-muted sm:p-6">
        JPG, PNG, or WebP · max 5MB per file · Gallery storage only
      </section>

      {uploadError && (
        <p className="text-sm text-red-700" role="alert">
          {uploadError}
        </p>
      )}
      {deleteError && (
        <p className="text-sm text-red-700" role="alert">
          {deleteError}
        </p>
      )}

      {viewState.type === "loading" && <LoadingList rows={6} />}
      {viewState.type === "error" && (
        <ErrorState message={viewState.message} onRetry={load} />
      )}
      {viewState.type === "empty" && (
        <div className="space-y-4">
          <EmptyState
            title="No gallery images uploaded yet."
            description="Upload an image to show it on the customer Gallery page."
          />
          <div className="flex justify-center">
            <button
              type="button"
              disabled={busy}
              onClick={openFilePicker}
              className="admin-btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "Uploading…" : "Upload Image"}
            </button>
          </div>
        </div>
      )}

      {viewState.type === "success" && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {viewState.images.map((image) => {
            const uploadedAt = formatUploadedAt(image.createdAt);
            const caption =
              image.altText?.trim() &&
              image.altText.trim().toLowerCase() !==
                "doughart custom cake gallery photo"
                ? image.altText.trim()
                : null;

            return (
              <li
                key={image.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm"
              >
                <div className="relative aspect-square bg-brand-pink-lighter">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageSrc(image.url)}
                    alt={image.altText || image.filename}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
                  <p className="truncate text-xs font-medium text-brand-brown sm:text-sm">
                    {image.filename}
                  </p>
                  {caption && (
                    <p className="line-clamp-2 text-[11px] text-brand-muted">
                      {caption}
                    </p>
                  )}
                  <p className="text-[10px] text-brand-muted sm:text-xs">
                    {formatBytes(image.size)}
                    {uploadedAt ? ` · ${uploadedAt}` : ""}
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteTarget(image);
                    }}
                    className={cn(
                      "mt-auto inline-flex h-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3",
                      "text-xs font-semibold text-red-700 hover:bg-red-100",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                  >
                    {isDeleting && deleteTarget?.id === image.id
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete gallery image?"
        description="Are you sure you want to delete this gallery image? This action cannot be undone."
        isDeleting={isDeleting}
        onCancel={() => {
          if (isDeleting) {
            return;
          }
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
