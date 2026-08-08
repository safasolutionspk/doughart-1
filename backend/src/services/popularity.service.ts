import { Types } from "mongoose";
import { Cake, Order } from "../models";
import { normalizeItemTypes } from "../constants/itemTypes";
import type { RequestTenantContext } from "../types/tenantContext";
import {
  POPULARITY_ELIGIBLE_STATUSES,
  type AdminPopularCakeRow,
  type AdminPopularCakesResult,
  type PopularCakeStats,
  type PopularitySource,
  type PublicPopularCake,
} from "../types/popularity";

type ScopeFilter = Record<string, unknown>;

function buildCakeScopeFilter(
  tenantContext?: RequestTenantContext,
): ScopeFilter {
  if (
    tenantContext?.isResolved &&
    tenantContext.tenantId &&
    tenantContext.workspaceId
  ) {
    return {
      tenantId: new Types.ObjectId(tenantContext.tenantId),
      workspaceId: new Types.ObjectId(tenantContext.workspaceId),
    };
  }
  return {};
}

/**
 * Orders may be legacy-unscoped while cakes are tenant-scoped.
 * Include current tenant/workspace orders plus fully unscoped legacy orders.
 * Never include orders that belong to a different tenant or workspace —
 * a single missing scope field must not open a cross-tenant leak.
 */
function buildEligibleOrderMatch(
  tenantContext?: RequestTenantContext,
): ScopeFilter {
  const eligible: ScopeFilter = {
    status: { $in: [...POPULARITY_ELIGIBLE_STATUSES] },
  };

  if (
    !(
      tenantContext?.isResolved &&
      tenantContext.tenantId &&
      tenantContext.workspaceId
    )
  ) {
    return eligible;
  }

  const tenantId = new Types.ObjectId(tenantContext.tenantId);
  const workspaceId = new Types.ObjectId(tenantContext.workspaceId);

  return {
    ...eligible,
    $or: [
      { tenantId, workspaceId },
      {
        $and: [
          {
            $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
          },
          {
            $or: [{ workspaceId: { $exists: false } }, { workspaceId: null }],
          },
        ],
      },
    ],
  };
}

function normalizeCakeName(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Legacy line items without quantity safely count as 1. */
function safeItemQuantity(quantity: unknown): number {
  const n = typeof quantity === "number" ? quantity : Number(quantity);
  if (!Number.isFinite(n) || n <= 0) {
    return 1;
  }
  return n;
}

type AggRow = {
  _id: Types.ObjectId;
  totalQuantitySold: number;
  totalRevenue: number;
  successfulOrderIds: Types.ObjectId[];
  lastPurchasedAt: Date | null;
  latestCakeName?: string;
  latestUnitPrice?: number;
};

type NameOnlyItemRow = {
  orderId: Types.ObjectId;
  cakeName: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date | null;
};

type MutableStats = {
  cakeId: string;
  orderIds: Set<string>;
  totalQuantitySold: number;
  totalRevenue: number;
  lastPurchasedAt: Date | null;
  latestCakeName?: string;
  latestUnitPrice?: number;
};

async function buildUniqueCakeNameIndex(
  tenantContext?: RequestTenantContext,
): Promise<Map<string, string>> {
  const scope = buildCakeScopeFilter(tenantContext);
  const cakes = await Cake.find({ ...scope }).select("_id name").lean();

  const counts = new Map<string, string[]>();
  for (const cake of cakes) {
    const key = normalizeCakeName(cake.name);
    if (!key) {
      continue;
    }
    const ids = counts.get(key) ?? [];
    ids.push(String(cake._id));
    counts.set(key, ids);
  }

  const unique = new Map<string, string>();
  for (const [key, ids] of counts) {
    if (ids.length === 1) {
      unique.set(key, ids[0]);
    }
  }
  return unique;
}

/** Primary: ordered quantity DESC. Ties: revenue, last purchase, cakeId. */
function compareByOrderedQuantity(
  a: {
    totalQuantitySold: number;
    totalRevenue: number;
    lastPurchasedAt: Date | null;
    cakeId: string;
  },
  b: {
    totalQuantitySold: number;
    totalRevenue: number;
    lastPurchasedAt: Date | null;
    cakeId: string;
  },
): number {
  if (b.totalQuantitySold !== a.totalQuantitySold) {
    return b.totalQuantitySold - a.totalQuantitySold;
  }
  if (b.totalRevenue !== a.totalRevenue) {
    return b.totalRevenue - a.totalRevenue;
  }
  const aTime = a.lastPurchasedAt ? a.lastPurchasedAt.getTime() : 0;
  const bTime = b.lastPurchasedAt ? b.lastPurchasedAt.getTime() : 0;
  if (bTime !== aTime) {
    return bTime - aTime;
  }
  return a.cakeId.localeCompare(b.cakeId);
}

function toPopularStats(map: Map<string, MutableStats>): PopularCakeStats[] {
  return [...map.values()]
    .map((row) => ({
      cakeId: row.cakeId,
      totalQuantitySold: row.totalQuantitySold,
      totalRevenue: row.totalRevenue,
      successfulOrderCount: row.orderIds.size,
      lastPurchasedAt: row.lastPurchasedAt,
      latestCakeName: row.latestCakeName,
      latestUnitPrice: row.latestUnitPrice,
    }))
    .sort(compareByOrderedQuantity);
}

/**
 * Aggregate purchase stats ranked primarily by total ordered quantity.
 * Cancelled orders are excluded; pending and later non-cancelled statuses count.
 * Catalog mapping requires cakeId (or unique exact name for legacy lines).
 */
async function aggregatePurchaseStats(
  tenantContext?: RequestTenantContext,
): Promise<PopularCakeStats[]> {
  const orderMatch = buildEligibleOrderMatch(tenantContext);

  const [cakeIdRows, nameOnlyRows, uniqueNames] = await Promise.all([
    Order.aggregate<AggRow>([
      { $match: orderMatch },
      { $unwind: "$items" },
      {
        $match: {
          "items.cakeId": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$items.cakeId",
          totalQuantitySold: {
            $sum: { $ifNull: ["$items.quantity", 1] },
          },
          totalRevenue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$items.quantity", 1] },
                { $ifNull: ["$items.unitPrice", 0] },
              ],
            },
          },
          successfulOrderIds: { $addToSet: "$_id" },
          lastPurchasedAt: { $max: "$createdAt" },
          latestCakeName: { $last: "$items.cakeName" },
          latestUnitPrice: { $last: "$items.unitPrice" },
        },
      },
    ]),
    Order.aggregate<NameOnlyItemRow>([
      { $match: orderMatch },
      { $unwind: "$items" },
      {
        $match: {
          $or: [
            { "items.cakeId": { $exists: false } },
            { "items.cakeId": null },
          ],
          "items.cakeName": { $type: "string", $ne: "" },
        },
      },
      {
        $project: {
          _id: 0,
          orderId: "$_id",
          cakeName: "$items.cakeName",
          quantity: { $ifNull: ["$items.quantity", 1] },
          unitPrice: { $ifNull: ["$items.unitPrice", 0] },
          createdAt: "$createdAt",
        },
      },
    ]),
    buildUniqueCakeNameIndex(tenantContext),
  ]);

  const stats = new Map<string, MutableStats>();

  for (const row of cakeIdRows) {
    const cakeId = String(row._id);
    stats.set(cakeId, {
      cakeId,
      orderIds: new Set(row.successfulOrderIds.map((id) => String(id))),
      totalQuantitySold: row.totalQuantitySold,
      totalRevenue: row.totalRevenue,
      lastPurchasedAt: row.lastPurchasedAt,
      latestCakeName: row.latestCakeName,
      latestUnitPrice: row.latestUnitPrice,
    });
  }

  // Reporting-only fallback for historical items missing cakeId:
  // exact unique normalized name → current Cake. Never fuzzy; skip ambiguous names.
  for (const item of nameOnlyRows) {
    const cakeId = uniqueNames.get(normalizeCakeName(item.cakeName));
    if (!cakeId) {
      continue;
    }

    const qty = safeItemQuantity(item.quantity);
    const existing = stats.get(cakeId) ?? {
      cakeId,
      orderIds: new Set<string>(),
      totalQuantitySold: 0,
      totalRevenue: 0,
      lastPurchasedAt: null as Date | null,
      latestCakeName: item.cakeName,
      latestUnitPrice: item.unitPrice,
    };

    const orderKey = String(item.orderId);
    const alreadyCounted = existing.orderIds.has(orderKey);
    existing.orderIds.add(orderKey);
    existing.totalQuantitySold += qty;
    existing.totalRevenue += qty * (item.unitPrice || 0);
    if (
      item.createdAt &&
      (!existing.lastPurchasedAt ||
        item.createdAt.getTime() > existing.lastPurchasedAt.getTime())
    ) {
      existing.lastPurchasedAt = item.createdAt;
    }
    if (!alreadyCounted || !existing.latestCakeName) {
      existing.latestCakeName = item.cakeName;
      existing.latestUnitPrice = item.unitPrice;
    }

    stats.set(cakeId, existing);
  }

  return toPopularStats(stats);
}

type LeanPublicCake = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageDisplay?: {
    zoom: number;
    x: number;
    y: number;
  };
  categoryId: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
  };
  price: number;
  itemTypes?: string[];
  isCustomizable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt?: Date;
};

async function loadActivePublicCakes(
  tenantContext?: RequestTenantContext,
): Promise<LeanPublicCake[]> {
  const scope = buildCakeScopeFilter(tenantContext);
  return Cake.find({ ...scope, isActive: true })
    .populate("categoryId", "name slug")
    .select(
      "name slug description image imageDisplay categoryId price itemTypes isCustomizable isFeatured sortOrder createdAt",
    )
    .lean<LeanPublicCake[]>()
    .then((cakes) => cakes.filter((cake) => Boolean(cake.categoryId?._id)));
}

function toPublicCakeShape(
  cake: LeanPublicCake,
  rank: number,
  totalQuantitySold: number,
  source: PopularitySource,
): PublicPopularCake {
  const category = cake.categoryId;
  return {
    _id: String(cake._id),
    name: cake.name,
    slug: cake.slug,
    description: cake.description,
    image: cake.image,
    imageDisplay: cake.imageDisplay,
    categoryId: {
      _id: String(category._id),
      name: category.name,
      slug: category.slug,
    },
    price: cake.price,
    itemTypes: normalizeItemTypes(cake.itemTypes),
    isCustomizable: cake.isCustomizable,
    isFeatured: cake.isFeatured,
    sortOrder: cake.sortOrder,
    rank,
    totalQuantitySold,
    source,
  };
}

/**
 * Public Popular Items: every active catalog product, LEFT JOIN order quantities
 * (default 0), sorted by ordered quantity DESC. Inactive products stay hidden.
 */
export async function listPublicPopularCakes(
  limit: number,
  tenantContext?: RequestTenantContext,
): Promise<PublicPopularCake[]> {
  const [stats, activeCakes] = await Promise.all([
    aggregatePurchaseStats(tenantContext),
    loadActivePublicCakes(tenantContext),
  ]);

  if (activeCakes.length === 0) {
    return [];
  }

  const statsById = new Map(stats.map((row) => [row.cakeId, row]));

  type RankCandidate = {
    cake: LeanPublicCake;
    cakeId: string;
    totalQuantitySold: number;
    totalRevenue: number;
    lastPurchasedAt: Date | null;
    sortOrder: number;
    name: string;
  };

  const ranked: RankCandidate[] = activeCakes.map((cake) => {
    const cakeId = String(cake._id);
    const row = statsById.get(cakeId);
    return {
      cake,
      cakeId,
      totalQuantitySold: row?.totalQuantitySold ?? 0,
      totalRevenue: row?.totalRevenue ?? 0,
      lastPurchasedAt: row?.lastPurchasedAt ?? null,
      sortOrder: cake.sortOrder ?? 0,
      name: cake.name,
    };
  });

  ranked.sort((a, b) => {
    const byQty = compareByOrderedQuantity(a, b);
    if (byQty !== 0) {
      return byQty;
    }
    // Catalog tie-break after shared purchase metrics.
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) {
      return byName;
    }
    return a.cakeId.localeCompare(b.cakeId);
  });

  const limited = ranked.slice(0, Math.max(1, limit));
  const withPurchases = limited.some((row) => row.totalQuantitySold > 0);
  const withZeros = limited.some((row) => row.totalQuantitySold === 0);

  let listSource: PopularitySource = "fallback";
  if (withPurchases && withZeros) {
    listSource = "mixed";
  } else if (withPurchases) {
    listSource = "purchases";
  }

  return limited.map((row, index) =>
    toPublicCakeShape(
      row.cake,
      index + 1,
      row.totalQuantitySold,
      row.totalQuantitySold > 0 ? "purchases" : listSource === "fallback" ? "fallback" : "mixed",
    ),
  );
}

type LeanAdminCake = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  price: number;
  isActive: boolean;
  sortOrder?: number;
  categoryId?: { slug?: string } | Types.ObjectId | null;
};

/**
 * Admin reporting: every Cake (including Combo Offers), with purchase stats merged.
 * Same quantity-first ranking as the public list (includes inactive for analytics).
 */
export async function listAdminPopularCakes(
  page: number,
  limit: number,
  tenantContext?: RequestTenantContext,
): Promise<AdminPopularCakesResult> {
  const scope = buildCakeScopeFilter(tenantContext);

  const [stats, cakes] = await Promise.all([
    aggregatePurchaseStats(tenantContext),
    Cake.find({ ...scope })
      .populate("categoryId", "slug")
      .select("name slug image price isActive sortOrder categoryId")
      .lean<LeanAdminCake[]>(),
  ]);

  const statsById = new Map(stats.map((row) => [row.cakeId, row]));

  const merged = cakes.map((cake) => {
    const cakeId = String(cake._id);
    const row = statsById.get(cakeId);
    return {
      cakeId,
      name: cake.name,
      image: cake.image,
      price: cake.price,
      totalQuantitySold: row?.totalQuantitySold ?? 0,
      successfulOrderCount: row?.successfulOrderCount ?? 0,
      totalRevenue: row?.totalRevenue ?? 0,
      lastPurchasedAt: row?.lastPurchasedAt ?? null,
      isActive: Boolean(cake.isActive),
      cakeExists: true,
      slug: cake.slug,
      sortOrder: cake.sortOrder ?? 0,
    };
  });

  merged.sort((a, b) => {
    const byQty = compareByOrderedQuantity(a, b);
    if (byQty !== 0) {
      return byQty;
    }
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) {
      return byName;
    }
    return a.cakeId.localeCompare(b.cakeId);
  });

  const total = merged.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const pageRows = merged.slice(start, start + limit);

  const rows: AdminPopularCakeRow[] = pageRows.map((row, index) => ({
    rank: start + index + 1,
    cakeId: row.cakeId,
    name: row.name,
    image: row.image,
    price: row.price,
    totalQuantitySold: row.totalQuantitySold,
    successfulOrderCount: row.successfulOrderCount,
    totalRevenue: row.totalRevenue,
    lastPurchasedAt: row.lastPurchasedAt
      ? new Date(row.lastPurchasedAt).toISOString()
      : null,
    isActive: row.isActive,
    cakeExists: true,
    slug: row.slug,
  }));

  return {
    rows,
    pagination: { page, limit, total, totalPages },
  };
}
