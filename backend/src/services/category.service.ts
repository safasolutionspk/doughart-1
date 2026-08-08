import mongoose from "mongoose";
import { Category, Cake } from "../models";
import { COMBO_OFFERS_CATEGORY } from "../constants/systemCategories";
import type { RequestTenantContext } from "../types/tenantContext";
import { ApiError } from "../utils/ApiError";
import { slugify } from "../utils/slugify";
import {
  applyCatalogScope,
  applyLegacyCatalogFallback,
  resolveCatalogScope,
} from "./catalogScope.service";
import {
  assertNotDuplicateSystemCategoryIdentity,
  assertSystemCategoryDeletable,
  assertSystemCategoryMutable,
  findComboOffersCategory,
  isProtectedSystemCategory,
} from "./systemCategory.service";
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

const ADMIN_CATEGORY_SELECT =
  "name slug description image imageDisplay isActive sortOrder isSystem systemKey createdAt updatedAt";

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
      .select(ADMIN_CATEGORY_SELECT)
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
        .select(ADMIN_CATEGORY_SELECT)
        .lean(),
      Category.countDocuments(legacyFilter),
    ]);
  }

  // Include protected Combo Offers even when it is still legacy-unscoped.
  if (scope && page === 1 && !search) {
    const combo = await findComboOffersCategory(tenantContext);
    if (
      combo &&
      (isActive === undefined || combo.isActive === isActive) &&
      !categories.some((category) => String(category._id) === String(combo._id))
    ) {
      const merged = [combo, ...categories].sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          String(a.name).localeCompare(String(b.name)),
      );
      categories = merged.slice(0, limit) as typeof categories;
      total += 1;
    }
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

  assertNotDuplicateSystemCategoryIdentity({
    name: input.name,
    slug: baseSlug,
  });

  const slug = await resolveUniqueSlug(baseSlug);

  try {
    return await Category.create({
      ...input,
      slug,
      isSystem: false,
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

  assertSystemCategoryMutable(targetCategory, {
    name: input.name,
    slug: input.slug,
    isActive: input.isActive,
  });

  if (isProtectedSystemCategory(targetCategory)) {
    // System identity fields stay locked; description/image remain editable.
    if (input.description !== undefined) {
      targetCategory.description = input.description;
    }
    if (input.image !== undefined) {
      targetCategory.image = input.image;
    }
    if (input.imageDisplay !== undefined) {
      if (input.imageDisplay === null) {
        targetCategory.imageDisplay = undefined;
        targetCategory.markModified("imageDisplay");
      } else {
        targetCategory.imageDisplay = input.imageDisplay;
      }
    }
    if (!targetCategory.isSystem) {
      targetCategory.isSystem = true;
    }
    if (targetCategory.systemKey !== COMBO_OFFERS_CATEGORY.systemKey) {
      targetCategory.systemKey = COMBO_OFFERS_CATEGORY.systemKey;
    }
    targetCategory.name = COMBO_OFFERS_CATEGORY.name;
    targetCategory.slug = COMBO_OFFERS_CATEGORY.slug;
    targetCategory.isActive = true;

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
  if (input.imageDisplay !== undefined) {
    if (input.imageDisplay === null) {
      targetCategory.imageDisplay = undefined;
      targetCategory.markModified("imageDisplay");
    } else {
      targetCategory.imageDisplay = input.imageDisplay;
    }
  }
  if (input.isActive !== undefined) {
    targetCategory.isActive = input.isActive;
  }
  if (input.sortOrder !== undefined) {
    targetCategory.sortOrder = input.sortOrder;
  }

  if (input.slug !== undefined) {
    const nextSlug = slugify(input.slug);
    const combo = await findComboOffersCategory(tenantContext);
    if (combo && String(combo._id) !== id) {
      assertNotDuplicateSystemCategoryIdentity({
        name: input.name ?? targetCategory.name,
        slug: nextSlug,
      });
    }
    targetCategory.slug = await resolveUniqueSlug(nextSlug, id);
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

  let categories = await Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .select("name slug description image imageDisplay sortOrder")
    .lean();

  if (categories.length === 0 && scope) {
    categories = await Category.find(applyLegacyCatalogFallback({ isActive: true }))
      .sort({ sortOrder: 1, name: 1 })
      .select("name slug description image imageDisplay sortOrder")
      .lean();
  }

  // Always surface the protected Combo Offers category even if it was created
  // without tenant/workspace scope (legacy) while other categories are scoped.
  const combo = await findComboOffersCategory(tenantContext);
  if (
    combo &&
    combo.isActive &&
    !categories.some((category) => category.slug === combo.slug)
  ) {
    const merged = [
      ...categories,
      {
        _id: combo._id,
        name: combo.name,
        slug: combo.slug,
        description: combo.description,
        image: combo.image,
        imageDisplay: combo.imageDisplay,
        sortOrder: combo.sortOrder,
      },
    ].sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        String(a.name).localeCompare(String(b.name)),
    );
    return merged as typeof categories;
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

  assertSystemCategoryDeletable(targetCategory);

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
