import mongoose from "mongoose";
import {
  COMBO_OFFERS_CATEGORY,
  isComboOffersName,
  isComboOffersSlug,
  isComboOffersSystemKey,
} from "../constants/systemCategories";
import { Category } from "../models";
import type { RequestTenantContext } from "../types/tenantContext";
import { ApiError } from "../utils/ApiError";
import type { ImageDisplay } from "../types/imageDisplay";
import {
  applyCatalogScope,
  applyLegacyCatalogFallback,
  resolveCatalogScope,
} from "./catalogScope.service";

export type SystemCategoryDoc = {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageDisplay?: ImageDisplay;
  isActive: boolean;
  sortOrder: number;
  isSystem: boolean;
  systemKey?: string;
  tenantId?: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
};

function buildScopedFilter(
  base: Record<string, unknown>,
  tenantContext?: RequestTenantContext,
): Record<string, unknown> {
  const scope = resolveCatalogScope(tenantContext);
  return scope ? applyCatalogScope(base, scope) : base;
}

export function isProtectedSystemCategory(category: {
  isSystem?: boolean;
  slug?: string;
  systemKey?: string;
}): boolean {
  return (
    Boolean(category.isSystem) ||
    isComboOffersSystemKey(category.systemKey) ||
    isComboOffersSlug(category.slug)
  );
}

export async function findComboOffersCategory(
  tenantContext?: RequestTenantContext,
): Promise<SystemCategoryDoc | null> {
  const byKey = buildScopedFilter(
    { systemKey: COMBO_OFFERS_CATEGORY.systemKey },
    tenantContext,
  );
  let category = await Category.findOne(byKey).lean<SystemCategoryDoc | null>();

  if (!category) {
    const bySlug = buildScopedFilter(
      { slug: COMBO_OFFERS_CATEGORY.slug },
      tenantContext,
    );
    category = await Category.findOne(bySlug).lean<SystemCategoryDoc | null>();
  }

  if (!category && resolveCatalogScope(tenantContext)) {
    category = await Category.findOne(
      applyLegacyCatalogFallback({
        systemKey: COMBO_OFFERS_CATEGORY.systemKey,
      }),
    ).lean<SystemCategoryDoc | null>();

    if (!category) {
      category = await Category.findOne(
        applyLegacyCatalogFallback({ slug: COMBO_OFFERS_CATEGORY.slug }),
      ).lean<SystemCategoryDoc | null>();
    }
  }

  return category;
}

export async function requireComboOffersCategory(
  tenantContext?: RequestTenantContext,
): Promise<SystemCategoryDoc> {
  const category = await findComboOffersCategory(tenantContext);
  if (!category) {
    throw ApiError.conflict(
      "Combo Offers category is not available. Ensure system categories have been created.",
    );
  }
  if (!category.isActive) {
    throw ApiError.conflict("Combo Offers category is inactive.");
  }
  return category;
}

/**
 * Idempotent ensure for the protected Combo Offers category.
 * Safe to call repeatedly; does not create duplicates.
 * Preserves existing `_id`, description, and owner-uploaded image.
 */
export async function ensureComboOffersCategory(
  tenantContext?: RequestTenantContext,
): Promise<SystemCategoryDoc> {
  const scope = resolveCatalogScope(tenantContext);
  const existing = await findComboOffersCategory(tenantContext);

  if (existing) {
    let dirty = false;
    const doc = await Category.findById(existing._id);
    if (!doc) {
      return existing;
    }
    if (!doc.isSystem) {
      doc.isSystem = true;
      dirty = true;
    }
    if (doc.systemKey !== COMBO_OFFERS_CATEGORY.systemKey) {
      doc.systemKey = COMBO_OFFERS_CATEGORY.systemKey;
      dirty = true;
    }
    if (doc.name !== COMBO_OFFERS_CATEGORY.name) {
      doc.name = COMBO_OFFERS_CATEGORY.name;
      dirty = true;
    }
    if (doc.slug !== COMBO_OFFERS_CATEGORY.slug) {
      doc.slug = COMBO_OFFERS_CATEGORY.slug;
      dirty = true;
    }
    if (!doc.isActive) {
      doc.isActive = true;
      dirty = true;
    }
    if (scope) {
      const nextTenant = new mongoose.Types.ObjectId(scope.tenantId);
      const nextWorkspace = new mongoose.Types.ObjectId(scope.workspaceId);
      if (
        String(doc.tenantId ?? "") !== String(nextTenant) ||
        String(doc.workspaceId ?? "") !== String(nextWorkspace)
      ) {
        doc.tenantId = nextTenant;
        doc.workspaceId = nextWorkspace;
        dirty = true;
      }
    }
    if (dirty) {
      await doc.save();
      console.log(
        `[system-categories] Repaired Combo Offers category (${COMBO_OFFERS_CATEGORY.slug})`,
      );
      return doc.toObject() as SystemCategoryDoc;
    }
    console.log(
      `[system-categories] Combo Offers category ready (${COMBO_OFFERS_CATEGORY.slug})`,
    );
    return existing;
  }

  try {
    const created = await Category.create({
      name: COMBO_OFFERS_CATEGORY.name,
      slug: COMBO_OFFERS_CATEGORY.slug,
      systemKey: COMBO_OFFERS_CATEGORY.systemKey,
      description: COMBO_OFFERS_CATEGORY.description,
      isActive: true,
      isSystem: true,
      sortOrder: COMBO_OFFERS_CATEGORY.sortOrder,
      ...(scope
        ? {
            tenantId: scope.tenantId,
            workspaceId: scope.workspaceId,
          }
        : {}),
    });
    console.log(
      `[system-categories] Created Combo Offers category (${COMBO_OFFERS_CATEGORY.slug})`,
    );
    return created.toObject() as SystemCategoryDoc;
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      const raced = await findComboOffersCategory(tenantContext);
      if (raced) {
        console.log(
          `[system-categories] Combo Offers category already existed (${COMBO_OFFERS_CATEGORY.slug})`,
        );
        return raced;
      }
    }
    throw error;
  }
}

export function assertNotDuplicateSystemCategoryIdentity(input: {
  name?: string;
  slug?: string;
}): void {
  if (isComboOffersSlug(input.slug) || isComboOffersName(input.name)) {
    throw ApiError.conflict(
      "Combo Offers is a reserved system category name/slug and cannot be created manually.",
    );
  }
}

export function assertSystemCategoryMutable(
  category: { isSystem?: boolean; slug?: string; name?: string; systemKey?: string },
  input: {
    name?: string;
    slug?: string;
    isActive?: boolean;
  },
): void {
  if (!isProtectedSystemCategory(category)) {
    return;
  }

  if (input.name !== undefined && input.name !== COMBO_OFFERS_CATEGORY.name) {
    throw ApiError.badRequest(
      "Combo Offers is a system category and its name cannot be changed.",
    );
  }

  if (input.slug !== undefined && !isComboOffersSlug(input.slug)) {
    throw ApiError.badRequest(
      "Combo Offers is a system category and its slug cannot be changed.",
    );
  }

  if (input.isActive === false) {
    throw ApiError.badRequest(
      "Combo Offers is a system category and cannot be deactivated.",
    );
  }
}

export function assertSystemCategoryDeletable(category: {
  isSystem?: boolean;
  slug?: string;
  systemKey?: string;
}): void {
  if (isProtectedSystemCategory(category)) {
    throw ApiError.forbidden(
      "Combo Offers is a system category and cannot be deleted.",
    );
  }
}
