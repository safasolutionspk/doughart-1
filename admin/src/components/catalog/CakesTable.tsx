"use client";

import Link from "next/link";
import { ActiveBadge } from "@/components/catalog/ActiveBadge";
import { CatalogImage } from "@/components/catalog/CatalogImage";
import { formatCurrency } from "@/lib/orders/format";
import { getCategoryLabel, type Cake } from "@/lib/catalog/types";

type CakesTableProps = {
  cakes: Cake[];
  onDelete: (cake: Cake) => void;
  deletingId: string | null;
  editHrefBase?: string;
};

export function CakesTable({
  cakes,
  onDelete,
  deletingId,
  editHrefBase = "/dashboard/cakes",
}: CakesTableProps) {
  return (
    <div className="admin-table-wrap hidden lg:block">
      <table className="min-w-full divide-y divide-brand-border/50 text-sm">
        <thead className="bg-gradient-to-r from-brand-pink-lighter/90 to-white">
          <tr>
            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Product
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Category
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Price
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Status
            </th>
            <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/30 bg-white">
          {cakes.map((cake) => (
            <tr
              key={cake._id}
              className="transition-colors hover:bg-brand-pink-lighter/30"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-pink-lighter ring-1 ring-brand-border/50">
                    <CatalogImage
                      image={cake.image}
                      alt={cake.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-brown">{cake.name}</p>
                    <p className="text-xs text-brand-muted">/{cake.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-brand-muted">
                {getCategoryLabel(cake.categoryId)}
              </td>
              <td className="px-4 py-3 font-semibold text-brand-primary">
                {formatCurrency(cake.price)}
              </td>
              <td className="px-4 py-3">
                <ActiveBadge active={cake.isActive} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`${editHrefBase}/${cake._id}/edit`}
                    className="admin-btn-secondary !h-8 !px-3 !text-xs"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(cake)}
                    disabled={deletingId === cake._id}
                    className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === cake._id ? "…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
