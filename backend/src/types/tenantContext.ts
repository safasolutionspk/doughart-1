export type TenantContextSource =
  | "default"
  | "host"
  | "subdomain"
  | "domain"
  | "header"
  | "path";

export interface RequestTenantContext {
  tenantId?: string;
  workspaceId?: string;
  tenantSlug?: string;
  workspaceSlug?: string;
  host?: string;
  source: TenantContextSource;
  isResolved: boolean;
}
