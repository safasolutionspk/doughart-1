"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import {
  createCategory,
  fetchCategory,
  updateCategory,
} from "@/lib/catalog/client";
import { CATEGORIES_REFRESH_EVENT } from "@/lib/catalog/events";
import { isSystemCategory } from "@/lib/catalog/types";
import { DescriptionTextarea } from "@/components/catalog/DescriptionTextarea";
import { ImageSettingField } from "@/components/upload/ImageSettingField";
import {
  CATEGORY_DESCRIPTION_MAX,
  clampDescription,
  descriptionLengthError,
} from "@/lib/catalog/description";
import { normalizeImageDisplay, type ImageDisplay } from "@/lib/imageDisplay";
import {
  normalizeStoredImagePath,
} from "@/lib/upload/path";

type CategoryFormProps = {
  categoryId?: string;
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  imageDisplay: undefined as ImageDisplay | undefined,
  isActive: true,
  sortOrder: 0,
};

const fieldClassName = cn(
  "h-12 w-full rounded-2xl border-2 border-brand-border bg-white px-4 text-base text-brand-brown outline-none transition-shadow",
  "placeholder:text-brand-muted/50 focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

const labelClassName =
  "mb-2 block text-sm font-semibold text-brand-brown";

export function CategoryForm({ categoryId }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = Boolean(categoryId);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    const id = categoryId;
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const category = await fetchCategory(id);
        if (cancelled) {
          return;
        }
        const protectedCategory = isSystemCategory(category);
        setIsProtected(protectedCategory);
        setForm({
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          image: category.image ?? "",
          imageDisplay: normalizeImageDisplay(category.imageDisplay),
          isActive: category.isActive,
          sortOrder: category.sortOrder,
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load category",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const description = clampDescription(
        form.description.trim(),
        CATEGORY_DESCRIPTION_MAX,
      );
      const descriptionError = descriptionLengthError(
        description,
        CATEGORY_DESCRIPTION_MAX,
      );
      if (descriptionError) {
        setError(descriptionError);
        setIsSaving(false);
        return;
      }

      if (isProtected && isEdit && categoryId) {
        await updateCategory(categoryId, {
          description: description || "",
          image: normalizeStoredImagePath(form.image) ?? "",
          imageDisplay: form.imageDisplay ?? null,
        });
      } else {
        const payload = {
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          description: description || undefined,
          image: normalizeStoredImagePath(form.image),
          imageDisplay: form.imageDisplay ?? (isEdit ? null : undefined),
          isActive: form.isActive,
          sortOrder: Number(form.sortOrder) || 0,
        };

        if (isEdit && categoryId) {
          await updateCategory(categoryId, payload);
        } else {
          await createCategory(payload);
        }
      }
      router.push("/dashboard/categories");
      router.refresh();
      window.dispatchEvent(new Event(CATEGORIES_REFRESH_EVENT));
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save category",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4" aria-busy="true">
        <div className="mx-auto h-10 w-56 animate-pulse rounded-lg bg-brand-pink-lighter" />
        <div className="h-48 animate-pulse rounded-2xl border-2 border-dashed border-brand-border bg-brand-pink-lighter" />
        <div className="h-80 animate-pulse rounded-2xl bg-brand-pink-lighter" />
      </div>
    );
  }

  if (isProtected) {
    return (
      <div className="mx-auto w-full max-w-lg px-1">
        <Link
          href="/dashboard/categories"
          className="text-sm font-medium text-brand-primary hover:text-brand-button-hover"
        >
          ← Back to categories
        </Link>

        <div className="admin-card mt-6 space-y-6 !p-6 sm:!p-8">
          <div className="text-center">
            <p className="inline-flex rounded-full border border-brand-border/70 bg-brand-pink-lighter/60 px-2.5 py-0.5 text-[11px] font-semibold text-brand-muted">
              System category
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold text-brand-brown sm:text-3xl">
              Edit Combo Offers
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              Name and slug are fixed. Description and image can be updated.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className={labelClassName}>
                Category Name <span className="text-brand-primary">*</span>
              </label>
              <input
                id="name"
                value={form.name}
                readOnly
                disabled
                className={fieldClassName}
              />
              <p className="mt-1.5 text-xs text-brand-muted">
                This system name cannot be changed.
              </p>
            </div>

            <div>
              <label htmlFor="slug" className={labelClassName}>
                Slug
              </label>
              <input
                id="slug"
                value={form.slug}
                readOnly
                disabled
                className={fieldClassName}
              />
            </div>

            <DescriptionTextarea
              id="description"
              label="Description"
              value={form.description}
              maxLength={CATEGORY_DESCRIPTION_MAX}
              onChange={(description) => setForm({ ...form, description })}
              disabled={isSaving}
              fieldClassName={fieldClassName}
              labelClassName={labelClassName}
            />

            <ImageSettingField
              id="category-image"
              label="Image"
              image={form.image}
              imageDisplay={form.imageDisplay}
              onImageChange={(image) =>
                setForm((prev) => ({
                  ...prev,
                  image: normalizeStoredImagePath(image) ?? "",
                }))
              }
              onImageDisplayChange={(imageDisplay) =>
                setForm((prev) => ({ ...prev, imageDisplay }))
              }
              disabled={isSaving}
              aspectRatio="1 / 1"
              frameShape="circle"
              fieldClassName={fieldClassName}
            />

            {error && (
              <p className="text-center text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="admin-btn-primary h-12 w-full rounded-2xl text-base font-semibold disabled:opacity-60"
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </button>

            <Link
              href="/dashboard/categories"
              className="admin-btn-secondary flex h-11 w-full items-center justify-center rounded-2xl text-sm"
            >
              Cancel
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-1">
      <Link
        href="/dashboard/categories"
        className="text-sm font-medium text-brand-primary hover:text-brand-button-hover"
      >
        ← Back to categories
      </Link>

      <div className="admin-card mt-6 space-y-6 !p-6 sm:!p-8">
        <h1 className="text-center font-display text-2xl font-bold text-brand-brown sm:text-3xl">
          {isEdit ? "Edit Category" : "Create Category"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className={labelClassName}>
              Name <span className="text-brand-primary">*</span>
            </label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="slug" className={labelClassName}>
              Slug
            </label>
            <input
              id="slug"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              placeholder="auto-generated from name if empty"
              className={fieldClassName}
            />
          </div>

          <DescriptionTextarea
            id="description"
            label="Description"
            value={form.description}
            maxLength={CATEGORY_DESCRIPTION_MAX}
            onChange={(description) => setForm({ ...form, description })}
            disabled={isSaving}
            fieldClassName={fieldClassName}
            labelClassName={labelClassName}
          />

          <ImageSettingField
            id="category-image"
            label="Image"
            image={form.image}
            imageDisplay={form.imageDisplay}
            onImageChange={(image) =>
              setForm((prev) => ({
                ...prev,
                image: normalizeStoredImagePath(image) ?? "",
              }))
            }
            onImageDisplayChange={(imageDisplay) =>
              setForm((prev) => ({ ...prev, imageDisplay }))
            }
            disabled={isSaving}
            aspectRatio="1 / 1"
            frameShape="circle"
            fieldClassName={fieldClassName}
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
                className={fieldClassName}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-brand-brown">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm({ ...form, isActive: event.target.checked })
                  }
                  className="h-5 w-5 rounded border-2 border-brand-border text-brand-primary focus:ring-brand-primary/20"
                />
                Active
              </label>
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="admin-btn-primary h-12 w-full rounded-2xl text-base font-semibold disabled:opacity-60"
          >
            {isSaving
              ? "Saving…"
              : isEdit
                ? "Update Category"
                : "Create Category"}
          </button>

          <Link
            href="/dashboard/categories"
            className="admin-btn-secondary flex h-11 w-full items-center justify-center rounded-2xl text-sm"
          >
            Cancel
          </Link>
        </form>
      </div>
    </div>
  );
}
