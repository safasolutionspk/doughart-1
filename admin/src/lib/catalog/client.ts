import { adminFetch, parseAdminJson } from "@/lib/api/client";
import type {
  Cake,
  CakeListResponse,
  Category,
  CategoryListResponse,
} from "./types";

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchCategories(params?: {
  search?: string;
  isActive?: boolean | "";
  page?: number;
  limit?: number;
}): Promise<CategoryListResponse> {
  const query = buildQuery({
    search: params?.search,
    isActive: params?.isActive === "" ? undefined : params?.isActive,
    page: params?.page,
    limit: params?.limit ?? 20,
  });
  const response = await adminFetch(`/api/categories${query}`, {
    cache: "no-store",
  });
  return parseAdminJson<CategoryListResponse>(response);
}

export async function fetchCategory(id: string): Promise<Category> {
  const response = await adminFetch(`/api/categories/${id}`, { cache: "no-store" });
  return parseAdminJson<Category>(response);
}

export async function createCategory(payload: {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<Category> {
  const response = await adminFetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseAdminJson<Category>(response);
}

export async function updateCategory(
  id: string,
  payload: Partial<{
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;
    sortOrder: number;
  }>,
): Promise<Category> {
  const response = await adminFetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseAdminJson<Category>(response);
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await adminFetch(`/api/categories/${id}`, { method: "DELETE" });
  await parseAdminJson<{ id: string }>(response);
}

export async function fetchCakes(params?: {
  search?: string;
  categoryId?: string;
  isActive?: boolean | "";
  isFeatured?: boolean | "";
  page?: number;
  limit?: number;
}): Promise<CakeListResponse> {
  const query = buildQuery({
    search: params?.search,
    categoryId: params?.categoryId,
    isActive: params?.isActive === "" ? undefined : params?.isActive,
    isFeatured: params?.isFeatured === "" ? undefined : params?.isFeatured,
    page: params?.page,
    limit: params?.limit ?? 20,
  });
  const response = await adminFetch(`/api/cakes${query}`, { cache: "no-store" });
  return parseAdminJson<CakeListResponse>(response);
}

export async function fetchCake(id: string): Promise<Cake> {
  const response = await adminFetch(`/api/cakes/${id}`, { cache: "no-store" });
  return parseAdminJson<Cake>(response);
}

export async function createCake(payload: {
  name: string;
  slug?: string;
  categoryId: string;
  description?: string;
  price: number;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  isCustomizable: boolean;
  sortOrder: number;
}): Promise<Cake> {
  const response = await adminFetch("/api/cakes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseAdminJson<Cake>(response);
}

export async function updateCake(
  id: string,
  payload: Partial<{
    name: string;
    slug: string;
    categoryId: string;
    description: string;
    price: number;
    image: string;
    isActive: boolean;
    isFeatured: boolean;
    isCustomizable: boolean;
    sortOrder: number;
  }>,
): Promise<Cake> {
  const response = await adminFetch(`/api/cakes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseAdminJson<Cake>(response);
}

export async function deleteCake(id: string): Promise<void> {
  const response = await adminFetch(`/api/cakes/${id}`, { method: "DELETE" });
  await parseAdminJson<{ id: string }>(response);
}
