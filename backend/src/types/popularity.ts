export const POPULARITY_ELIGIBLE_STATUSES = [
  "pending",
  "confirmed",
  "baking",
  "out_for_delivery",
  "completed",
] as const;

export type PopularitySource = "purchases" | "mixed" | "fallback";

export type PopularCakeStats = {
  cakeId: string;
  totalQuantitySold: number;
  totalRevenue: number;
  successfulOrderCount: number;
  lastPurchasedAt: Date | null;
  latestCakeName?: string;
  latestUnitPrice?: number;
};

export type PublicPopularCake = {
  _id: string;
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
    _id: string;
    name: string;
    slug: string;
  };
  price: number;
  itemTypes?: string[];
  isCustomizable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  rank: number;
  totalQuantitySold: number;
  source: PopularitySource;
};

export type AdminPopularCakeRow = {
  rank: number;
  cakeId: string;
  name: string;
  image?: string;
  price: number;
  totalQuantitySold: number;
  successfulOrderCount: number;
  totalRevenue: number;
  lastPurchasedAt: string | null;
  isActive: boolean | null;
  cakeExists: boolean;
  slug?: string;
};

export type AdminPopularCakesResult = {
  rows: AdminPopularCakeRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
