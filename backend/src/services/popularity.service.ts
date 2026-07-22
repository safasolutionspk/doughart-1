import { Types } from "mongoose";
import { Cake, Order } from "../models";
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

function buildOrderScopeFilter(
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

function buildCakeScopeFilter(
  tenantContext?: RequestTenantContext,
): ScopeFilter {
  return buildOrderScopeFilter(tenantContext);
}

type AggRow = {
  _id: Types.ObjectId;
  totalQuantitySold: number;
  totalRevenue: number;
  successfulOrderCount: number;
  lastPurchasedAt: Date | null;
  latestCakeName?: string;
  latestUnitPrice?: number;
};

/**
 * Aggregate purchase stats ranked primarily by distinct successful orders.
 * One order counts once per cake even if quantity > 1 or the cake appears twice.
 * Includes Combo Offer products alongside normal cakes.
 */
async function aggregatePurchaseStats(
  tenantContext?: RequestTenantContext,
): Promise<PopularCakeStats[]> {
  const scope = buildOrderScopeFilter(tenantContext);

  const rows = await Order.aggregate<AggRow>([
    {
      $match: {
        ...scope,
        status: { $in: [...POPULARITY_ELIGIBLE_STATUSES] },
        paymentStatus: { $ne: "failed" },
      },
    },
    { $unwind: "$items" },
    {
      $match: {
        "items.cakeId": { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$items.cakeId",
        totalQuantitySold: { $sum: "$items.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] },
        },
        successfulOrderCount: { $addToSet: "$_id" },
        lastPurchasedAt: { $max: "$createdAt" },
        latestCakeName: { $last: "$items.cakeName" },
        latestUnitPrice: { $last: "$items.unitPrice" },
      },
    },
    {
      $project: {
        totalQuantitySold: 1,
        totalRevenue: 1,
        successfulOrderCount: { $size: "$successfulOrderCount" },
        lastPurchasedAt: 1,
        latestCakeName: 1,
        latestUnitPrice: 1,
      },
    },
    {
      $sort: {
        successfulOrderCount: -1,
        totalRevenue: -1,
        lastPurchasedAt: -1,
        _id: 1,
      },
    },
  ]);

  return rows.map((row) => ({
    cakeId: String(row._id),
    totalQuantitySold: row.totalQuantitySold,
    totalRevenue: row.totalRevenue,
    successfulOrderCount: row.successfulOrderCount,
    lastPurchasedAt: row.lastPurchasedAt,
    latestCakeName: row.latestCakeName,
    latestUnitPrice: row.latestUnitPrice,
  }));
}

type LeanPublicCake = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  categoryId: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
  };
  price: number;
  isCustomizable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt?: Date;
};

async function loadActivePublicCakes(
  tenantContext?: RequestTenantContext,
): Promise<LeanPublicCake[]> {
  const scope = buildCakeScopeFilter(tenantContext);
  const cakes = await Cake.find({ ...scope, isActive: true })
    .populate("categoryId", "name slug")
    .select(
      "name slug description image categoryId price isCustomizable isFeatured sortOrder createdAt",
    )
    .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1, _id: 1 })
    .lean<LeanPublicCake[]>();

  return cakes.filter((cake) => Boolean(cake.categoryId?._id));
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
    categoryId: {
      _id: String(category._id),
      name: category.name,
      slug: category.slug,
    },
    price: cake.price,
    isCustomizable: cake.isCustomizable,
    isFeatured: cake.isFeatured,
    sortOrder: cake.sortOrder,
    rank,
    totalQuantitySold,
    source,
  };
}

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

  const activeById = new Map(
    activeCakes.map((cake) => [String(cake._id), cake]),
  );

  const purchased: PublicPopularCake[] = [];
  const usedIds = new Set<string>();

  for (const row of stats) {
    if (purchased.length >= limit) {
      break;
    }
    const cake = activeById.get(row.cakeId);
    if (!cake || !cake.categoryId?._id) {
      continue;
    }
    purchased.push(
      toPublicCakeShape(
        cake,
        purchased.length + 1,
        row.totalQuantitySold,
        "purchases",
      ),
    );
    usedIds.add(row.cakeId);
  }

  if (purchased.length >= limit) {
    return purchased.map((cake, index) => ({
      ...cake,
      rank: index + 1,
      source: "purchases" as const,
    }));
  }

  const fallbackNeeded = limit - purchased.length;
  const fallbackCakes = activeCakes
    .filter((cake) => !usedIds.has(String(cake._id)) && cake.categoryId?._id)
    .slice(0, fallbackNeeded)
    .map((cake, index) =>
      toPublicCakeShape(cake, purchased.length + index + 1, 0, "fallback"),
    );

  const combined = [...purchased, ...fallbackCakes].map((cake, index) => ({
    ...cake,
    rank: index + 1,
  }));

  const source: PopularitySource =
    purchased.length === 0
      ? "fallback"
      : fallbackCakes.length > 0
        ? "mixed"
        : "purchases";

  return combined.map((cake) => ({ ...cake, source }));
}

type LeanAdminCake = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  price: number;
  isActive: boolean;
  categoryId?: { slug?: string } | Types.ObjectId | null;
};

function compareAdminRows(
  a: {
    successfulOrderCount: number;
    totalRevenue: number;
    lastPurchasedAt: Date | null;
    cakeId: string;
  },
  b: {
    successfulOrderCount: number;
    totalRevenue: number;
    lastPurchasedAt: Date | null;
    cakeId: string;
  },
): number {
  if (b.successfulOrderCount !== a.successfulOrderCount) {
    return b.successfulOrderCount - a.successfulOrderCount;
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

/**
 * Admin reporting: every Cake (including Combo Offers), with purchase stats merged.
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
      .select("name slug image price isActive categoryId")
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
    };
  });

  merged.sort(compareAdminRows);

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
