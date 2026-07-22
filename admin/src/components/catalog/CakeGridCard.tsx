"use client";

import Link from "next/link";
import { ActiveBadge } from "@/components/catalog/ActiveBadge";
import { CatalogImage } from "@/components/catalog/CatalogImage";
import { formatCurrency } from "@/lib/orders/format";
import { getCategoryLabel, type Cake } from "@/lib/catalog/types";

const descriptionClassName =
  "mt-1.5 line-clamp-2 break-words text-xs leading-relaxed text-brand-muted";

type CakeGridCardProps = {
  cake: Cake;
  onDelete: () => void;
  isDeleting: boolean;
};

export function CakeGridCard({ cake, onDelete, isDeleting }: CakeGridCardProps) {
  const flags: string[] = [];
  if (cake.isFeatured) {
    flags.push("Featured");
  }
  if (cake.isCustomizable) {
    flags.push("Customizable");
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-brand-border/60 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="relative h-32 w-full shrink-0 overflow-hidden bg-gradient-to-br from-brand-pink-lighter to-brand-cream sm:h-36">
        <CatalogImage
          image={cake.image}
          alt={cake.name}
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 font-display text-sm font-semibold text-brand-brown">
              {cake.name}
            </h2>
            <p className="mt-0.5 truncate text-[10px] text-brand-muted">
              {getCategoryLabel(cake.categoryId)}
            </p>
          </div>
          <ActiveBadge active={cake.isActive} />
        </div>

        <p className="text-sm font-semibold text-brand-primary">
          {formatCurrency(cake.price)}
        </p>

        {flags.length > 0 ? (
          <p className="text-[10px] text-brand-muted">{flags.join(" · ")}</p>
        ) : null}

        <p className={descriptionClassName}>
          {cake.description?.trim() || "No description"}
        </p>

        <div className="mt-auto flex gap-1.5 pt-3">
          <Link
            href={`/dashboard/cakes/${cake._id}/edit`}
            className="admin-btn-secondary !h-8 flex-1 !px-2 !text-[11px]"
          >
            Edit
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
