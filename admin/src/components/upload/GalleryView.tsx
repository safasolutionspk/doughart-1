"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDeleteModal } from "@/components/catalog/ConfirmDeleteModal";
import { EmptyState, ErrorState, LoadingList } from "@/components/catalog/ListStates";
import { cn } from "@/lib/cn";
import { deleteGalleryImage, fetchGallery, uploadImage } from "@/lib/upload/client";
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

type ViewState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "empty" }
  | { type: "success"; images: GalleryImage[] };

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
      await uploadImage(file);
      await load();
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
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteGalleryImage(deleteTarget.deleteKey ?? deleteTarget.filename);
      setDeleteTarget(null);
      await load();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete image",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-brown">
            Gallery
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            Upload and manage images for categories, cakes, and marketing.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            className="sr-only"
            disabled={isUploading}
            onChange={handleUpload}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white",
              "hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {isUploading ? "Uploading…" : "Upload image"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-brand-border bg-brand-pink-lighter/50 p-6 text-center text-sm text-brand-muted">
        JPG, PNG, or WebP · max 5MB per file
      </section>

      {uploadError && (
        <p className="text-sm text-red-700" role="alert">
          {uploadError}
        </p>
      )}

      {viewState.type === "loading" && <LoadingList rows={6} />}
      {viewState.type === "error" && (
        <ErrorState message={viewState.message} onRetry={load} />
      )}
      {viewState.type === "empty" && (
        <EmptyState
          title="No images yet"
          description="Upload your first image to get started."
        />
      )}

      {viewState.type === "success" && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {viewState.images.map((image) => (
            <li
              key={image.filename}
              className="overflow-hidden rounded-xl border border-brand-border/60 bg-white shadow-sm"
            >
              <div className="aspect-square bg-brand-pink-lighter">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageSrc(image.url)}
                  alt={image.filename}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="space-y-1 p-2 sm:p-2.5">
                <p className="truncate text-[10px] font-medium text-brand-brown sm:text-xs">
                  {image.filename}
                </p>
                <p className="text-[10px] text-brand-muted">{formatBytes(image.size)}</p>
                <p className="hidden truncate text-[10px] text-brand-muted/70 sm:block">
                  {image.url}
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(image)}
                  className="text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete image?"
        description={
          deleteTarget
            ? `"${deleteTarget.filename}" will be removed from the server. Items using this URL may show a broken image.`
            : ""
        }
        isDeleting={isDeleting}
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
