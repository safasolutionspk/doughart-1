const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiFailure = {
  success: false;
  message: string;
};

export type PublicCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
};

export type CategoryRef = {
  _id: string;
  name: string;
  slug: string;
};

export type PublicCake = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  categoryId: CategoryRef;
  price: number;
  isCustomizable: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

type ApiGetCache = "default" | "no-store";

async function apiGet<T>(
  path: string,
  cache: ApiGetCache = "default",
  init?: RequestInit,
): Promise<T | null> {
  try {
    const fetchInit: RequestInit = { ...init };
    if (cache === "no-store") {
      fetchInit.cache = "no-store";
    } else {
      fetchInit.next = { revalidate: 60 };
    }

    const response = await fetch(`${API_BASE_URL}${path}`, fetchInit);

    let body: ApiSuccess<T> | ApiFailure;
    try {
      body = (await response.json()) as ApiSuccess<T> | ApiFailure;
    } catch {
      return null;
    }

    if (!response.ok || !body.success) {
      return null;
    }

    return (body as ApiSuccess<T>).data;
  } catch {
    return null;
  }
}

export async function fetchPublicCategories(): Promise<PublicCategory[]> {
  const data = await apiGet<PublicCategory[]>("/api/categories/public");
  if (!data) {
    return [];
  }
  return [...data].sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name),
  );
}

/** Returns null when the categories API request fails (for homepage fallback). */
export async function fetchPublicCategoriesOrFail(): Promise<PublicCategory[] | null> {
  return apiGet<PublicCategory[]>("/api/categories/public", "no-store");
}

export async function fetchPublicCakes(options?: {
  categorySlug?: string;
}): Promise<PublicCake[] | null> {
  const params = new URLSearchParams();
  if (options?.categorySlug) {
    params.set("categorySlug", options.categorySlug);
  }
  const query = params.toString();
  return apiGet<PublicCake[]>(
    `/api/cakes/public${query ? `?${query}` : ""}`,
  );
}

export async function fetchPublicCakeBySlug(
  slug: string,
): Promise<PublicCake | null> {
  return apiGet<PublicCake>(`/api/cakes/public/${encodeURIComponent(slug)}`);
}

export function getCategoryRef(cake: PublicCake): CategoryRef {
  return cake.categoryId;
}

export function formatPrice(price: number): string {
  const formatted = price.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `Rs ${formatted}`;
}
