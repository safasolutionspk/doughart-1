"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import {
  createCake,
  createComboOffer,
  fetchCake,
  fetchCategories,
  fetchComboOffer,
  updateCake,
  updateComboOffer,
} from "@/lib/catalog/client";
import type { Category } from "@/lib/catalog/types";
import { getCategoryId } from "@/lib/catalog/types";
import { DescriptionTextarea } from "@/components/catalog/DescriptionTextarea";
import { ImageUploadField } from "@/components/upload/ImageUploadField";
import {
  CAKE_DESCRIPTION_MAX,
  clampDescription,
  descriptionLengthError,
} from "@/lib/catalog/description";
import { normalizeStoredImagePath } from "@/lib/upload/path";
import { inputClassName, labelClassName, textareaClassName } from "@/lib/form";

type CakeFormProps = {
  cakeId?: string;
  /** When true, hide category selector and use Combo Offers APIs. */
  mode?: "cake" | "combo-offer";
};

const emptyForm = {
  name: "",
  slug: "",
  categoryId: "",
  description: "",
  price: 0,
  image: "",
  isActive: true,
  isFeatured: false,
  isCustomizable: false,
  sortOrder: 0,
};

export function CakeForm({ cakeId, mode = "cake" }: CakeFormProps) {
  const router = useRouter();
  const isEdit = Boolean(cakeId);
  const isCombo = mode === "combo-offer";
  const listHref = isCombo ? "/dashboard/combo-offers" : "/dashboard/cakes";
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        if (isCombo) {
          if (cakeId) {
            const cake = await fetchComboOffer(cakeId);
            if (cancelled) {
              return;
            }
            setForm({
              name: cake.name,
              slug: cake.slug,
              categoryId: getCategoryId(cake.categoryId),
              description: cake.description ?? "",
              price: cake.price,
              image: cake.image ?? "",
              isActive: cake.isActive,
              isFeatured: cake.isFeatured ?? false,
              isCustomizable: cake.isCustomizable,
              sortOrder: cake.sortOrder,
            });
          }
        } else {
          const categoryResult = await fetchCategories({
            limit: 100,
            isActive: true,
          });
          if (cancelled) {
            return;
          }
          setCategories(categoryResult.categories);

          if (cakeId) {
            const cake = await fetchCake(cakeId);
            if (cancelled) {
              return;
            }
            setForm({
              name: cake.name,
              slug: cake.slug,
              categoryId: getCategoryId(cake.categoryId),
              description: cake.description ?? "",
              price: cake.price,
              image: cake.image ?? "",
              isActive: cake.isActive,
              isFeatured: cake.isFeatured ?? false,
              isCustomizable: cake.isCustomizable,
              sortOrder: cake.sortOrder,
            });
          } else if (categoryResult.categories[0]) {
            setForm((prev) => ({
              ...prev,
              categoryId: categoryResult.categories[0]._id,
            }));
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load form data",
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
  }, [cakeId, isCombo]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const description = clampDescription(
      form.description.trim(),
      CAKE_DESCRIPTION_MAX,
    );
    const descriptionError = descriptionLengthError(
      description,
      CAKE_DESCRIPTION_MAX,
    );
    if (descriptionError) {
      setError(descriptionError);
      setIsSaving(false);
      return;
    }

    try {
      if (isCombo) {
        const payload = {
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          description: description || undefined,
          price: Number(form.price),
          image: normalizeStoredImagePath(form.image),
          isActive: form.isActive,
          isFeatured: form.isFeatured,
          isCustomizable: form.isCustomizable,
          sortOrder: Number(form.sortOrder) || 0,
        };
        if (isEdit && cakeId) {
          await updateComboOffer(cakeId, payload);
        } else {
          await createComboOffer(payload);
        }
      } else {
        const payload = {
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          categoryId: form.categoryId,
          description: description || undefined,
          price: Number(form.price),
          image: normalizeStoredImagePath(form.image),
          isActive: form.isActive,
          isFeatured: form.isFeatured,
          isCustomizable: form.isCustomizable,
          sortOrder: Number(form.sortOrder) || 0,
        };
        if (isEdit && cakeId) {
          await updateCake(cakeId, payload);
        } else {
          await createCake(payload);
        }
      }
      router.push(listHref);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-brand-pink-lighter" />
        <div className="h-80 animate-pulse rounded-2xl bg-brand-pink-lighter" />
      </div>
    );
  }

  const title = isCombo
    ? isEdit
      ? "Edit combo offer"
      : "New combo offer"
    : isEdit
      ? "Edit menu item"
      : "New menu item";

  const canSubmit = isCombo ? true : Boolean(form.categoryId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={listHref}
          className="text-sm font-medium text-brand-primary hover:text-brand-button-hover"
        >
          ← Back to {isCombo ? "combo offers" : "menu"}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-brand-brown">{title}</h1>
        {isCombo ? (
          <p className="mt-1 text-sm text-brand-muted">
            Category is fixed to Combo Offers.
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="admin-card space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="cake-name" className={labelClassName}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cake-name"
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="cake-slug" className={labelClassName}>
              Slug
            </label>
            <input
              id="cake-slug"
              value={form.slug}
              onChange={(event) =>
                setForm({ ...form, slug: event.target.value })
              }
              placeholder="auto-generated if empty"
              className={inputClassName}
            />
          </div>

          {!isCombo ? (
            <div>
              <label htmlFor="cake-category" className={labelClassName}>
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="cake-category"
                required
                value={form.categoryId}
                onChange={(event) =>
                  setForm({ ...form, categoryId: event.target.value })
                }
                className={inputClassName}
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label htmlFor="cake-price" className={labelClassName}>
              Price <span className="text-red-500">*</span>
            </label>
            <input
              id="cake-price"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.price}
              onChange={(event) =>
                setForm({ ...form, price: Number(event.target.value) })
              }
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="cake-sort" className={labelClassName}>
              Sort order
            </label>
            <input
              id="cake-sort"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(event) =>
                setForm({ ...form, sortOrder: Number(event.target.value) })
              }
              className={inputClassName}
            />
          </div>
        </div>

        <DescriptionTextarea
          id="cake-description"
          label="Description"
          value={form.description}
          maxLength={CAKE_DESCRIPTION_MAX}
          onChange={(description) => setForm({ ...form, description })}
          disabled={isSaving}
          fieldClassName={textareaClassName}
          labelClassName={labelClassName}
        />

        <ImageUploadField
          id="cake-image"
          label="Image"
          value={form.image}
          onChange={(image) =>
            setForm({ ...form, image: normalizeStoredImagePath(image) ?? "" })
          }
          disabled={isSaving}
        />

        <div className="flex flex-wrap gap-6">
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
          <label className="flex items-center gap-2 text-sm text-brand-brown">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                setForm({ ...form, isFeatured: event.target.checked })
              }
              className="h-4 w-4 rounded border-brand-border text-brand-primary"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-brown">
            <input
              type="checkbox"
              checked={form.isCustomizable}
              onChange={(event) =>
                setForm({ ...form, isCustomizable: event.target.checked })
              }
              className="h-4 w-4 rounded border-brand-border text-brand-primary"
            />
            Customizable
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving || !canSubmit}
            className={cn("admin-btn-primary", "disabled:opacity-60")}
          >
            {isSaving
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : isCombo
                  ? "Create combo offer"
                  : "Create menu item"}
          </button>
          <Link href={listHref} className="admin-btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
