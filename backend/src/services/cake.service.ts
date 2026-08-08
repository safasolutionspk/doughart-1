import mongoose from "mongoose";
import { Cake, Category } from "../models";
import type { RequestTenantContext } from "../types/tenantContext";
import { ApiError } from "../utils/ApiError";
import { slugify } from "../utils/slugify";
import {
  applyCatalogScope,
  applyLegacyCatalogFallback,
  resolveCatalogScope,
} from "./catalogScope.service";
import type {
  CreateCakeInput,
  ListCakesQuery,
  ListPublicCakesQuery,
  UpdateCakeInput,
} from "../validators/cake.validator";

async function resolveUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const filter: Record<string, unknown> = { slug };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const existing = await Cake.findOne(filter).select("_id").lean();
    if (!existing) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

async function assertCategoryExists(
  categoryId: string,
  tenantContext?: RequestTenantContext,
) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw ApiError.badRequest("Invalid category ID");
  }

  const scope = resolveCatalogScope(tenantContext);

  const category = scope
    ? await Category.findOne(applyCatalogScope({ _id: categoryId }, scope))
        .select("_id")
        .lean()
    : await Category.findById(categoryId).select("_id").lean();

  if (!category && scope) {
    const legacyCategory = await Category.findOne(
      applyLegacyCatalogFallback({ _id: categoryId }),
    )
      .select("_id")
      .lean();

    if (legacyCategory) {
      return;
    }
  }

  if (!category) {
    throw ApiError.badRequest("Category not found");
  }
}

export async function listCakes(
  query: ListCakesQuery,
  tenantContext?: RequestTenantContext,
) {
  const { search, categoryId, isActive, isFeatured, page, limit } = query;
  const skip = (page - 1) * limit;
  const baseFilter: Record<string, unknown> = {};
  const scope = resolveCatalogScope(tenantContext);

  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw ApiError.badRequest("Invalid category ID");
    }
    baseFilter.categoryId = categoryId;
  }

  if (isActive !== undefined) {
    baseFilter.isActive = isActive;
  }

  if (isFeatured !== undefined) {
    baseFilter.isFeatured = isFeatured;
  }

  if (search) {
    const regex = new RegExp(search, "i");
    baseFilter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
  }

  const filter = scope ? applyCatalogScope(baseFilter, scope) : baseFilter;

  let [cakes, total] = await Promise.all([
    Cake.find(filter)
      .populate("categoryId", "name slug")
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .select(
        "name slug description image imageDisplay categoryId price itemTypes isCustomizable isFeatured isActive sortOrder createdAt updatedAt",
      )
      .lean(),
    Cake.countDocuments(filter),
  ]);

  if (scope && total === 0) {
    const legacyFilter = applyLegacyCatalogFallback(baseFilter);

    [cakes, total] = await Promise.all([
      Cake.find(legacyFilter)
        .populate("categoryId", "name slug")
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .select(
          "name slug description image imageDisplay categoryId price itemTypes isCustomizable isFeatured isActive sortOrder createdAt updatedAt",
        )
        .lean(),
      Cake.countDocuments(legacyFilter),
    ]);
  }

  return {
    cakes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listPublicCakes(
  query: ListPublicCakesQuery,
  tenantContext?: RequestTenantContext,
) {
  const { search, categorySlug, isFeatured } = query;
  const scope = resolveCatalogScope(tenantContext);
  const baseFilter: Record<string, unknown> = { isActive: true };

  if (categorySlug) {
    const categoryFilter = scope
      ? applyCatalogScope({ slug: categorySlug, isActive: true }, scope)
      : { slug: categorySlug, isActive: true };

    let category = await Category.findOne(categoryFilter).select("_id").lean();

    if (!category && scope) {
      category = await Category.findOne(
        applyLegacyCatalogFallback({ slug: categorySlug, isActive: true }),
      )
        .select("_id")
        .lean();
    }

    if (!category) {
      throw ApiError.notFound("Category not found");
    }

    baseFilter.categoryId = category._id;
  }

  if (isFeatured !== undefined) {
    baseFilter.isFeatured = isFeatured;
  }

  if (search) {
    const regex = new RegExp(search, "i");
    baseFilter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
  }

  const filter = scope ? applyCatalogScope(baseFilter, scope) : baseFilter;

  const cakes = await Cake.find(filter)
    .populate("categoryId", "name slug")
    .sort({ sortOrder: 1, name: 1 })
    .select(
      "name slug description image imageDisplay categoryId price itemTypes isCustomizable isFeatured sortOrder",
    )
    .lean();

  if (cakes.length === 0 && scope) {
    return Cake.find(applyLegacyCatalogFallback(baseFilter))
      .populate("categoryId", "name slug")
      .sort({ sortOrder: 1, name: 1 })
      .select(
        "name slug description image imageDisplay categoryId price itemTypes isCustomizable isFeatured sortOrder",
      )
      .lean();
  }

  return cakes;
}

export async function getPublicCakeBySlug(
  slug: string,
  tenantContext?: RequestTenantContext,
) {
  const scope = resolveCatalogScope(tenantContext);

  const cake = scope
    ? await Cake.findOne(applyCatalogScope({ slug, isActive: true }, scope))
        .populate("categoryId", "name slug")
        .lean()
    : await Cake.findOne({ slug, isActive: true })
        .populate("categoryId", "name slug")
        .lean();

  if (!cake && scope) {
    const legacyCake = await Cake.findOne(
      applyLegacyCatalogFallback({ slug, isActive: true }),
    )
      .populate("categoryId", "name slug")
      .lean();

    if (legacyCake) {
      return legacyCake;
    }
  }

  if (!cake) {
    throw ApiError.notFound("Cake not found");
  }

  return cake;
}

export async function getCakeById(id: string, tenantContext?: RequestTenantContext) {
  const scope = resolveCatalogScope(tenantContext);

  const cake = scope
    ? await Cake.findOne(applyCatalogScope({ _id: id }, scope))
        .populate("categoryId", "name slug")
        .lean()
    : await Cake.findById(id).populate("categoryId", "name slug").lean();

  if (!cake && scope) {
    const legacyCake = await Cake.findOne(applyLegacyCatalogFallback({ _id: id }))
      .populate("categoryId", "name slug")
      .lean();

    if (legacyCake) {
      return legacyCake;
    }
  }

  if (!cake) {
    throw ApiError.notFound("Cake not found");
  }

  return cake;
}

export async function createCake(
  input: CreateCakeInput,
  tenantContext?: RequestTenantContext,
) {
  const scope = resolveCatalogScope(tenantContext);

  if (!input.categoryId) {
    throw ApiError.badRequest("Category is required");
  }

  await assertCategoryExists(input.categoryId, tenantContext);

  const baseSlug = slugify(input.slug ?? input.name);
  if (!baseSlug) {
    throw ApiError.badRequest("Unable to generate a valid slug");
  }

  const slug = await resolveUniqueSlug(baseSlug);

  try {
    const cake = await Cake.create({
      ...input,
      slug,
      categoryId: input.categoryId,
      ...(scope
        ? {
            tenantId: scope.tenantId,
            workspaceId: scope.workspaceId,
          }
        : {}),
    });

    return Cake.findById(cake._id).populate("categoryId", "name slug").lean();
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw ApiError.conflict("A cake with this slug already exists");
    }

    throw error;
  }
}

export async function updateCake(
  id: string,
  input: UpdateCakeInput,
  tenantContext?: RequestTenantContext,
) {
  const scope = resolveCatalogScope(tenantContext);

  const cake = scope
    ? await Cake.findOne(applyCatalogScope({ _id: id }, scope))
    : await Cake.findById(id);

  const legacyCake =
    !cake && scope ? await Cake.findOne(applyLegacyCatalogFallback({ _id: id })) : null;

  const targetCake = cake ?? legacyCake;

  if (!targetCake) {
    throw ApiError.notFound("Cake not found");
  }

  if (scope) {
    targetCake.tenantId = new mongoose.Types.ObjectId(scope.tenantId);
    targetCake.workspaceId = new mongoose.Types.ObjectId(scope.workspaceId);
  }

  if (input.categoryId !== undefined) {
    await assertCategoryExists(input.categoryId, tenantContext);
    targetCake.categoryId = new mongoose.Types.ObjectId(input.categoryId);
  }

  if (input.name !== undefined) {
    targetCake.name = input.name;
  }

  if (input.description !== undefined) {
    targetCake.description = input.description;
  }

  if (input.image !== undefined) {
    targetCake.image = input.image;
  }

  if (input.imageDisplay !== undefined) {
    if (input.imageDisplay === null) {
      targetCake.imageDisplay = undefined;
      targetCake.markModified("imageDisplay");
    } else {
      targetCake.imageDisplay = input.imageDisplay;
    }
  }

  if (input.price !== undefined) {
    targetCake.price = input.price;
  }

  if (input.itemTypes !== undefined) {
    targetCake.itemTypes = input.itemTypes;
  }

  if (input.isActive !== undefined) {
    targetCake.isActive = input.isActive;
  }

  if (input.isFeatured !== undefined) {
    targetCake.isFeatured = input.isFeatured;
  }

  if (input.isCustomizable !== undefined) {
    targetCake.isCustomizable = input.isCustomizable;
  }

  if (input.sortOrder !== undefined) {
    targetCake.sortOrder = input.sortOrder;
  }

  if (input.slug !== undefined) {
    targetCake.slug = await resolveUniqueSlug(slugify(input.slug), id);
  }

  try {
    await targetCake.save();
    return Cake.findById(targetCake._id).populate("categoryId", "name slug").lean();
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw ApiError.conflict("A cake with this slug already exists");
    }

    throw error;
  }
}

export async function deleteCake(id: string, tenantContext?: RequestTenantContext) {
  const scope = resolveCatalogScope(tenantContext);

  const cake = scope
    ? await Cake.findOne(applyCatalogScope({ _id: id }, scope))
    : await Cake.findById(id);

  const legacyCake =
    !cake && scope ? await Cake.findOne(applyLegacyCatalogFallback({ _id: id })) : null;

  const targetCake = cake ?? legacyCake;

  if (!targetCake) {
    throw ApiError.notFound("Cake not found");
  }

  await targetCake.deleteOne();
  return { id };
}
