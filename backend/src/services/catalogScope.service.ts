import type { RequestTenantContext } from "../types/tenantContext";

export type CatalogScope = {
  tenantId: string;
  workspaceId: string;
};

const LEGACY_UNSCOPED_SCOPE_FILTER = {
  $or: [
    { tenantId: { $exists: false } },
    { tenantId: null },
    { workspaceId: { $exists: false } },
    { workspaceId: null },
  ],
};

export function resolveCatalogScope(
  tenantContext?: RequestTenantContext,
): CatalogScope | null {
  if (
    tenantContext?.isResolved &&
    tenantContext.tenantId &&
    tenantContext.workspaceId
  ) {
    return {
      tenantId: tenantContext.tenantId,
      workspaceId: tenantContext.workspaceId,
    };
  }

  return null;
}

export function applyCatalogScope(
  baseFilter: Record<string, unknown>,
  scope: CatalogScope,
): Record<string, unknown> {
  return {
    ...baseFilter,
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
  };
}

export function applyLegacyCatalogFallback(
  baseFilter: Record<string, unknown> = {},
): Record<string, unknown> {
  if (Object.keys(baseFilter).length === 0) {
    return LEGACY_UNSCOPED_SCOPE_FILTER;
  }

  return {
    $and: [baseFilter, LEGACY_UNSCOPED_SCOPE_FILTER],
  };
}
