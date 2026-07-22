import { Domain, Tenant, Workspace } from "../models";
import type { RequestTenantContext } from "../types/tenantContext";

const DEFAULT_TENANT_SLUG = "sweet-bite";
const DEFAULT_WORKSPACE_SLUG = "sweet-bite";
const TENANT_CONTEXT_CACHE_TTL_MS = 60_000;

type CachedTenantContext = {
  context: RequestTenantContext;
  expiresAt: number;
};

let cachedDefaultContext: CachedTenantContext | null = null;
const hostContextCache = new Map<string, CachedTenantContext>();

function normalizeHost(rawHost?: string): string | undefined {
  if (!rawHost) {
    return undefined;
  }

  const withoutListSuffix = rawHost.split(",")[0]?.trim().toLowerCase();
  if (!withoutListSuffix) {
    return undefined;
  }

  const withoutPort = withoutListSuffix.replace(/:\d+$/, "");
  return withoutPort || undefined;
}

function toResolvedContext(input: {
  tenantId: string;
  workspaceId: string;
  tenantSlug: string;
  workspaceSlug: string;
  source: RequestTenantContext["source"];
  host?: string;
}): RequestTenantContext {
  return {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    tenantSlug: input.tenantSlug,
    workspaceSlug: input.workspaceSlug,
    source: input.source,
    host: input.host,
    isResolved: true,
  };
}

function toUnresolvedContext(
  source: RequestTenantContext["source"],
  host?: string,
): RequestTenantContext {
  return {
    source,
    host,
    isResolved: false,
  };
}

function isCacheValid(
  cache: CachedTenantContext | null | undefined,
): cache is CachedTenantContext {
  return Boolean(cache && cache.expiresAt > Date.now());
}

function getCachedHostContext(host: string): RequestTenantContext | null {
  const cache = hostContextCache.get(host);
  if (!isCacheValid(cache)) {
    if (cache) {
      hostContextCache.delete(host);
    }
    return null;
  }
  return cache.context;
}

function setCachedHostContext(host: string, context: RequestTenantContext): void {
  hostContextCache.set(host, {
    context,
    expiresAt: Date.now() + TENANT_CONTEXT_CACHE_TTL_MS,
  });
}

function getCachedDefaultContext(): RequestTenantContext | null {
  if (!isCacheValid(cachedDefaultContext)) {
    cachedDefaultContext = null;
    return null;
  }
  return cachedDefaultContext.context;
}

function setCachedDefaultContext(context: RequestTenantContext): void {
  cachedDefaultContext = {
    context,
    expiresAt: Date.now() + TENANT_CONTEXT_CACHE_TTL_MS,
  };
}

export async function resolveTenantContext(params?: {
  host?: string;
}): Promise<RequestTenantContext> {
  const normalizedHost = normalizeHost(params?.host);

  if (normalizedHost) {
    const cachedHost = getCachedHostContext(normalizedHost);
    if (cachedHost) {
      return cachedHost;
    }
  }

  const cachedDefault = getCachedDefaultContext();
  if (cachedDefault && !normalizedHost) {
    return cachedDefault;
  }

  const defaultTenant = await Tenant.findOne({ slug: DEFAULT_TENANT_SLUG }).select(
    "_id slug",
  );

  if (!defaultTenant) {
    return toUnresolvedContext("default", normalizedHost);
  }

  if (normalizedHost) {
    const domain = await Domain.findOne({ host: normalizedHost }).select(
      "tenantId workspaceId host",
    );

    if (domain) {
      const resolvedTenant =
        String(domain.tenantId) === String(defaultTenant._id)
          ? defaultTenant
          : await Tenant.findById(domain.tenantId).select("_id slug");

      const resolvedWorkspace = await Workspace.findById(domain.workspaceId).select(
        "_id slug tenantId",
      );

      if (
        resolvedTenant &&
        resolvedWorkspace &&
        String(resolvedWorkspace.tenantId) === String(resolvedTenant._id)
      ) {
        const resolvedContext = toResolvedContext({
          tenantId: resolvedTenant._id.toString(),
          workspaceId: resolvedWorkspace._id.toString(),
          tenantSlug: resolvedTenant.slug,
          workspaceSlug: resolvedWorkspace.slug,
          source: "domain",
          host: normalizedHost,
        });

        setCachedHostContext(normalizedHost, resolvedContext);
        return resolvedContext;
      }
    }
  }

  const defaultWorkspace = await Workspace.findOne({
    tenantId: defaultTenant._id,
    slug: DEFAULT_WORKSPACE_SLUG,
  }).select("_id slug");

  if (!defaultWorkspace) {
    return toUnresolvedContext("default", normalizedHost);
  }

  const resolvedDefaultContext = toResolvedContext({
    tenantId: defaultTenant._id.toString(),
    workspaceId: defaultWorkspace._id.toString(),
    tenantSlug: defaultTenant.slug,
    workspaceSlug: defaultWorkspace.slug,
    source: "default",
    host: normalizedHost,
  });

  setCachedDefaultContext(resolvedDefaultContext);

  if (normalizedHost) {
    setCachedHostContext(normalizedHost, resolvedDefaultContext);
  }

  return resolvedDefaultContext;
}
