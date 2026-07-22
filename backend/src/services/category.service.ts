import mongoose from "mongoose";
import { Category, Cake } from "../models";
import type { RequestTenantContext } from "../types/tenantContext";
import { ApiError } from "../utils/ApiError";
import { slugify } from "../utils/slugify";
import {
  applyCatalogScope,
  applyLegacyCatalogFallback,
  resolveCatalogScope,
} from "./catalogScope.service";
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from "../validators/category.validator";

async function resolveUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const filter: Record<string, unknown> = { slug };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const existing = await Category.findOne(filter).select("_id").lean();
    if (!existing) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

export async function listCategories(
  query: ListCategoriesQuery,
  tenantContext?: RequestTenantContext,
) {
  const { search, isActive, page, limit } = query;
  const skip = (page - 1) * limit;
  const baseFilter: Record<string, unknown> = {};
  const scope = resolveCatalogScope(tenantContext);

  if (isActive !== undefined) {
    baseFilter.isActive = isActive;
  }

  if (search) {
    const regex = new RegExp(search, "i");
    baseFilter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
  }

  const filter = scope ? applyCatalogScope(baseFilter, scope) : baseFilter;

  let [categories, total] = await Promise.all([
    Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .select("name slug description image isActive sortOrder createdAt updatedAt")
      .lean(),
    Category.countDocuments(filter),
  ]);

  if (scope && total === 0) {
    const legacyFilter = applyLegacyCatalogFallback(baseFilter);

    [categories, total] = await Promise.all([
      Category.find(legacyFilter)
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .select("name slug description image isActive sortOrder createdAt updatedAt")
        .lean(),
      Category.countDocuments(legacyFilter),
    ]);
  }

  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCategoryById(
  id: string,
  tenantContext?: RequestTenantContext,
) {
  const scope = resolveCatalogScope(tenantContext);

  const category = scope
    ? await Category.findOne(applyCatalogScope({ _id: id }, scope)).lean()
    : await Category.findById(id).lean();

  if (!category && scope) {
    const legacyCategory = await Category.findOne(
      applyLegacyCatalogFallback({ _id: id }),
    ).lean();

    if (legacyCategory) {
      return legacyCategory;
    }
  }

  if (!category) {
    throw ApiError.notFound("Category not found");
  }
  return category;
}

export async function createCategory(
  input: CreateCategoryInput,
  tenantContext?: RequestTenantContext,
) {
  const scope = resolveCatalogScope(tenantContext);
  const baseSlug = slugify(input.slug ?? input.name);
  if (!baseSlug) {
    throw ApiError.badRequest("Unable to generate a valid slug");
  }

  const slug = await resolveUniqueSlug(baseSlug);

  try {
    return await Category.create({
      ...input,
      slug,
      ...(scope
        ? {
            tenantId: scope.tenantId,
            workspaceId: scope.workspaceId,
          }
        : {}),
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw ApiError.conflict("A category with this slug already exists");
    }
    throw error;
  }
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
  tenantContext?: RequestTenantContext,
) {
  const scope = resolveCatalogScope(tenantContext);

  const category = scope
    ? await Category.findOne(applyCatalogScope({ _id: id }, scope))
    : await Category.findById(id);

  const legacyCategory =
    !category && scope
      ? await Category.findOne(applyLegacyCatalogFallback({ _id: id }))
      : null;

  const targetCategory = category ?? legacyCategory;

  if (!targetCategory) {
    throw ApiError.notFound("Category not found");
  }

  if (scope) {
    targetCategory.tenantId = new mongoose.Types.ObjectId(scope.tenantId);
    targetCategory.workspaceId = new mongoose.Types.ObjectId(scope.workspaceId);
  }

  if (input.name !== undefined) {
    targetCategory.name = input.name;
  }
  if (input.description !== undefined) {
    targetCategory.description = input.description;
  }
  if (input.image !== undefined) {
    targetCategory.image = input.image;
  }
  if (input.isActive !== undefined) {
    targetCategory.isActive = input.isActive;
  }
  if (input.sortOrder !== undefined) {
    targetCategory.sortOrder = input.sortOrder;
  }

  if (input.slug !== undefined) {
    targetCategory.slug = await resolveUniqueSlug(slugify(input.slug), id);
  }

  try {
    await targetCategory.save();
    return targetCategory.toObject();
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw ApiError.conflict("A category with this slug already exists");
    }
    throw error;
  }
}

export async function listPublicCategories(tenantContext?: RequestTenantContext) {
  const scope = resolveCatalogScope(tenantContext);
  const filter = scope
    ? applyCatalogScope({ isActive: true }, scope)
    : { isActive: true };

  const categories = await Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .select("name slug description image sortOrder")
    .lean();

  if (categories.length === 0 && scope) {
    return Category.find(applyLegacyCatalogFallback({ isActive: true }))
      .sort({ sortOrder: 1, name: 1 })
      .select("name slug description image sortOrder")
      .lean();
  }

  return categories;
}

export async function deleteCategory(
  id: string,
  tenantContext?: RequestTenantContext,
) {
  const scope = resolveCatalogScope(tenantContext);

  const category = scope
    ? await Category.findOne(applyCatalogScope({ _id: id }, scope))
    : await Category.findById(id);

  const legacyCategory =
    !category && scope
      ? await Category.findOne(applyLegacyCatalogFallback({ _id: id }))
      : null;

  const targetCategory = category ?? legacyCategory;

  if (!targetCategory) {
    throw ApiError.notFound("Category not found");
  }

  const cakesCount = await Cake.countDocuments(
    scope
      ? applyCatalogScope({ categoryId: targetCategory._id }, scope)
      : { categoryId: targetCategory._id },
  );

  if (cakesCount > 0) {
    throw ApiError.conflict(
      `Cannot delete category: ${cakesCount} cake(s) still use it`,
    );
  }

  await targetCategory.deleteOne();
  return { id };
}
