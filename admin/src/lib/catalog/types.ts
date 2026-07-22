export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
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
  categoryId: string | CategoryRef;
  price: number;
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
