"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/upload/ImageUploadField";
import { cn } from "@/lib/cn";
import { inputClassName, labelClassName, textareaClassName } from "@/lib/form";
import { createReview, fetchReview, updateReview } from "@/lib/reviews/client";

type ReviewFormProps = {
  reviewId?: string;
};

const emptyForm = {
  name: "",
  role: "",
  rating: 5,
  text: "",
  image: "",
  isActive: true,
  sortOrder: 0,
};

export function ReviewForm({ reviewId }: ReviewFormProps) {
  const router = useRouter();
  const isEdit = Boolean(reviewId);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewId) {
      return;
    }

    const id = reviewId;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const review = await fetchReview(id);
        if (cancelled) {
          return;
        }
        setForm({
          name: review.name,
          role: review.role ?? "",
          rating: review.rating,
          text: review.text,
          image: review.image ?? "",
          isActive: review.isActive,
          sortOrder: review.sortOrder,
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Failed to load review",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || undefined,
      rating: Number(form.rating),
      text: form.text.trim(),
      image: form.image.trim() || undefined,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (isEdit && reviewId) {
        await updateReview(reviewId, payload);
      } else {
        await createReview(payload);
      }
      router.push("/dashboard/reviews");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save review",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-brand-pink-lighter" />
        <div className="admin-card h-72 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/reviews"
          className="text-sm font-medium text-brand-primary hover:text-brand-button-hover"
        >
          ← Back to reviews
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-brown">
          {isEdit ? "Edit review" : "New review"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-card space-y-5">
        <div>
          <label htmlFor="name" className={labelClassName}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="role" className={labelClassName}>
            Role
          </label>
          <input
            id="role"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            placeholder="Bride, Customer, Event Planner…"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="rating" className={labelClassName}>
            Rating <span className="text-red-500">*</span>
          </label>
          <select
            id="rating"
            required
            value={form.rating}
            onChange={(event) =>
              setForm({ ...form, rating: Number(event.target.value) })
            }
            className={inputClassName}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="text" className={labelClassName}>
            Review text <span className="text-red-500">*</span>
          </label>
          <textarea
            id="text"
            required
            rows={4}
            value={form.text}
            onChange={(event) => setForm({ ...form, text: event.target.value })}
            className={textareaClassName}
          />
        </div>

        <ImageUploadField
          id="review-image"
          label="Photo"
          value={form.image}
          onChange={(image) => setForm({ ...form, image })}
          disabled={isSaving}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sortOrder" className={labelClassName}>
              Sort order
            </label>
            <input
              id="sortOrder"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(event) =>
                setForm({ ...form, sortOrder: Number(event.target.value) })
              }
              className={inputClassName}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-brand-brown">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm({ ...form, isActive: event.target.checked })
                }
                className="h-4 w-4 rounded border-brand-border text-brand-primary"
              />
              Active
            </label>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className={cn("admin-btn-primary", "disabled:opacity-60")}
          >
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create review"}
          </button>
          <Link href="/dashboard/reviews" className="admin-btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
