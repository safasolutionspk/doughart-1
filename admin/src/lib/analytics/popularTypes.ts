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

export type PopularCakesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PopularCakesListResponse = {
  rows: AdminPopularCakeRow[];
  pagination: PopularCakesPagination;
};
