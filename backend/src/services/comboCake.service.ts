import { COMBO_OFFERS_CATEGORY } from "../constants/systemCategories";
import type { RequestTenantContext } from "../types/tenantContext";
import { ApiError } from "../utils/ApiError";
import type {
  CreateCakeInput,
  ListCakesQuery,
  UpdateCakeInput,
} from "../validators/cake.validator";
import * as cakeService from "./cake.service";
import { requireComboOffersCategory } from "./systemCategory.service";

function stripCategoryFromUpdate(
  input: UpdateCakeInput,
): Omit<UpdateCakeInput, "categoryId"> {
  const { categoryId: _ignored, ...rest } = input;
  return rest;
}

export async function listComboOfferCakes(
  query: Omit<ListCakesQuery, "categoryId">,
  tenantContext?: RequestTenantContext,
) {
  const combo = await requireComboOffersCategory(tenantContext);
  return cakeService.listCakes(
    {
      ...query,
      categoryId: String(combo._id),
    },
    tenantContext,
  );
}

export async function getComboOfferCakeById(
  id: string,
  tenantContext?: RequestTenantContext,
) {
  const combo = await requireComboOffersCategory(tenantContext);
  const cake = await cakeService.getCakeById(id, tenantContext);
  const categoryId =
    cake.categoryId &&
    typeof cake.categoryId === "object" &&
    "_id" in cake.categoryId
      ? String(cake.categoryId._id)
      : String(cake.categoryId);

  if (categoryId !== String(combo._id)) {
    throw ApiError.notFound("Combo offer not found");
  }

  return cake;
}

export async function createComboOfferCake(
  input: Omit<CreateCakeInput, "categoryId"> & { categoryId?: string },
  tenantContext?: RequestTenantContext,
) {
  const combo = await requireComboOffersCategory(tenantContext);
  return cakeService.createCake(
    {
      ...input,
      categoryId: String(combo._id),
    } as CreateCakeInput,
    tenantContext,
  );
}

export async function updateComboOfferCake(
  id: string,
  input: UpdateCakeInput,
  tenantContext?: RequestTenantContext,
) {
  await getComboOfferCakeById(id, tenantContext);
  const combo = await requireComboOffersCategory(tenantContext);
  return cakeService.updateCake(
    id,
    {
      ...stripCategoryFromUpdate(input),
      categoryId: String(combo._id),
    },
    tenantContext,
  );
}

export async function deleteComboOfferCake(
  id: string,
  tenantContext?: RequestTenantContext,
) {
  await getComboOfferCakeById(id, tenantContext);
  return cakeService.deleteCake(id, tenantContext);
}

export async function listPublicComboOfferCakes(
  limit: number,
  tenantContext?: RequestTenantContext,
) {
  try {
    const cakes = await cakeService.listPublicCakes(
      { categorySlug: COMBO_OFFERS_CATEGORY.slug },
      tenantContext,
    );

    const sorted = [...cakes].sort(
      (a, b) =>
        Number(b.isFeatured) - Number(a.isFeatured) ||
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        String(a.name).localeCompare(String(b.name)),
    );

    return sorted.slice(0, limit);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return [];
    }
    throw error;
  }
}
