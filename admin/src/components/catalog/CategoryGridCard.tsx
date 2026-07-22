"use client";

import Link from "next/link";
import { ActiveBadge } from "@/components/catalog/ActiveBadge";
import { CatalogImage } from "@/components/catalog/CatalogImage";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/catalog/types";

const descriptionClassName =
  "mt-1.5 line-clamp-2 break-words text-xs leading-relaxed text-brand-muted";

type CategoryGridCardProps = {
  category: Category;
  onDelete: () => void;
  isDeleting: boolean;
  isEditPending: boolean;
  onEditClick: () => void;
};

export function CategoryGridCard({
  category,
  onDelete,
  isDeleting,
  isEditPending,
  onEditClick,
}: CategoryGridCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-brand-border/60 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="relative h-32 w-full shrink-0 overflow-hidden bg-gradient-to-br from-brand-pink-lighter to-brand-cream sm:h-36">
        <CatalogImage
          image={category.image}
          alt={category.name}
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 font-display text-sm font-semibold text-brand-brown sm:text-base">
              {category.name}
            </h2>
            <p className="mt-0.5 truncate text-[10px] text-brand-muted">/{category.slug}</p>
          </div>
          <ActiveBadge active={category.isActive} />
        </div>

        <p className={descriptionClassName}>
          {category.description?.trim() || "No description"}
        </p>

        <div className="mt-auto flex gap-1.5 pt-3">
          <Link
            href={`/dashboard/categories/${category._id}/edit`}
            onClick={onEditClick}
            className={cn(
              "admin-btn-secondary !h-8 flex-1 !px-2 !text-[11px]",
              isEditPending && "pointer-events-none opacity-60",
            )}
          >
            {isEditPending ? "…" : "Edit"}
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex h-8 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {isDeleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
