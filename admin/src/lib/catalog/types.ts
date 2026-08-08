export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ImageDisplay = {
  zoom: number;
  x: number;
  y: number;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageDisplay?: ImageDisplay;
  isActive: boolean;
  sortOrder: number;
  isSystem?: boolean;
  systemKey?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryListResponse = {
  categories: Category[];
  pagination: Pagination;
};

export type CategoryRef = {
  _id: string;
  name: string;
  slug: string;
};

export type Cake = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageDisplay?: ImageDisplay;
  categoryId: string | CategoryRef;
  price: number;
  itemTypes?: Array<"cake" | "gift" | "other">;
  isCustomizable: boolean;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CakeListResponse = {
  cakes: Cake[];
  pagination: Pagination;
};

export function getCategoryLabel(
  categoryId: Cake["categoryId"],
): string {
  if (typeof categoryId === "string") {
    return "—";
  }
  return categoryId.name;
}

export function getCategoryId(categoryId: Cake["categoryId"]): string {
  if (typeof categoryId === "string") {
    return categoryId;
  }
  return categoryId._id;
}

export function isSystemCategory(category: Category): boolean {
  return (
    Boolean(category.isSystem) ||
    category.systemKey === "combo_offers" ||
    category.slug === "combo-offers"
  );
}
