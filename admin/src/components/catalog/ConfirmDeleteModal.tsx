"use client";

import { cn } from "@/lib/cn";

type ConfirmDeleteModalProps = {
  open: boolean;
  title: string;
  description: string;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteModal({
  open,
  title,
  description,
  isDeleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-brand-brown/30"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-xl shadow-brand-primary/10"
      >
        <h2 id="delete-dialog-title" className="font-display text-lg font-semibold text-brand-brown">
          {title}
        </h2>
        <p className="mt-2 text-sm text-brand-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="admin-btn-secondary !h-auto !py-2 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white",
              "hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
