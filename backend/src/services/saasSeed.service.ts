import { env } from "../config/env";
import {
  Admin,
  Domain,
  Membership,
  Plan,
  Subscription,
  Tenant,
  Workspace,
} from "../models";

const DEFAULT_TENANT_NAME = "DoughArt";
const DEFAULT_TENANT_SLUG = "sweet-bite";
const DEFAULT_WORKSPACE_NAME = "DoughArt";
const DEFAULT_WORKSPACE_SLUG = "sweet-bite";
const DEFAULT_PLAN_CODE = "STARTER";

type SeedStatus = "created" | "reused" | "skipped";

interface SeedItemResult {
  status: SeedStatus;
  reason?: string;
}

export interface SaasFoundationSeedResult {
  tenant: SeedItemResult;
  workspace: SeedItemResult;
  plan: SeedItemResult;
  subscription: SeedItemResult;
  membership: SeedItemResult;
  domain: SeedItemResult;
}

function normalizeEmail(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function resolveDefaultDomainHost(primaryDomain?: string): string | null {
  const normalizedPrimaryDomain = primaryDomain?.trim().toLowerCase();

  if (normalizedPrimaryDomain) {
    return normalizedPrimaryDomain;
  }

  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    return "sweet-bite.local";
  }

  return null;
}

async function findOwnerAdmin() {
  const envAdminEmail = normalizeEmail(env.ADMIN_EMAIL);

  if (envAdminEmail) {
    const adminByEnvEmail = await Admin.findOne({
      email: envAdminEmail,
      isActive: true,
    });

    if (adminByEnvEmail) {
      return adminByEnvEmail;
    }
  }

  const superAdmin = await Admin.findOne({
    isActive: true,
    role: "super_admin",
  }).sort({ createdAt: 1 });

  if (superAdmin) {
    return superAdmin;
  }

  return Admin.findOne({
    isActive: true,
    role: "admin",
  }).sort({ createdAt: 1 });
}

export async function seedSaasFoundation(): Promise<SaasFoundationSeedResult> {
  const result: SaasFoundationSeedResult = {
    tenant: { status: "reused" },
    workspace: { status: "reused" },
    plan: { status: "reused" },
    subscription: { status: "reused" },
    membership: { status: "reused" },
    domain: { status: "skipped", reason: "No safe default domain host resolved" },
  };

  const ownerAdmin = await findOwnerAdmin();

  if (!ownerAdmin) {
    throw new Error(
      "Cannot seed SaaS foundation: no active admin found (ADMIN_EMAIL or active super_admin/admin).",
    );
  }

  const ownerEmail = normalizeEmail(env.ADMIN_EMAIL) ?? normalizeEmail(ownerAdmin.email);

  if (!ownerEmail) {
    throw new Error("Cannot seed SaaS foundation: owner email could not be resolved.");
  }

  let tenant = await Tenant.findOne({ slug: DEFAULT_TENANT_SLUG });

  if (!tenant) {
    tenant = await Tenant.create({
      name: DEFAULT_TENANT_NAME,
      slug: DEFAULT_TENANT_SLUG,
      status: "active",
      ownerEmail,
    });
    result.tenant = { status: "created" };
  }

  let workspace = await Workspace.findOne({
    tenantId: tenant._id,
    slug: DEFAULT_WORKSPACE_SLUG,
  });

  if (!workspace) {
    workspace = await Workspace.create({
      tenantId: tenant._id,
      name: DEFAULT_WORKSPACE_NAME,
      slug: DEFAULT_WORKSPACE_SLUG,
      status: "active",
      businessType: "bakery",
      timezone: "Asia/Karachi",
      currency: "PKR",
    });
    result.workspace = { status: "created" };
  }

  let plan = await Plan.findOne({ code: DEFAULT_PLAN_CODE });

  if (!plan) {
    plan = await Plan.create({
      code: DEFAULT_PLAN_CODE,
      name: "Starter",
      description: "Default starter plan for the current single-business setup",
      monthlyPrice: 0,
      yearlyPrice: 0,
      currency: "PKR",
      limits: {
        maxProducts: 500,
        maxOrdersPerMonth: 5000,
        maxStaffUsers: 10,
        maxStorageMb: 2048,
      },
      features: {
        customDomain: false,
        advancedAnalytics: false,
        onlinePayments: true,
        aiTools: false,
      },
      isActive: true,
      sortOrder: 0,
    });
    result.plan = { status: "created" };
  }

  const existingSubscription = await Subscription.findOne({
    tenantId: tenant._id,
    workspaceId: workspace._id,
    planId: plan._id,
    provider: "manual",
  });

  if (!existingSubscription) {
    await Subscription.create({
      tenantId: tenant._id,
      workspaceId: workspace._id,
      planId: plan._id,
      status: "active",
      provider: "manual",
    });
    result.subscription = { status: "created" };
  }

  const existingMembership = await Membership.findOne({
    workspaceId: workspace._id,
    adminId: ownerAdmin._id,
  });

  if (!existingMembership) {
    await Membership.create({
      tenantId: tenant._id,
      workspaceId: workspace._id,
      userType: "admin",
      adminId: ownerAdmin._id,
      role: "owner",
      status: "active",
      joinedAt: new Date(),
    });
    result.membership = { status: "created" };
  }

  const domainHost = resolveDefaultDomainHost(workspace.primaryDomain);

  if (!domainHost) {
    result.domain = {
      status: "skipped",
      reason: "No safe default domain host for current environment",
    };
    return result;
  }

  const existingDomainByHost = await Domain.findOne({ host: domainHost });

  if (!existingDomainByHost) {
    await Domain.create({
      tenantId: tenant._id,
      workspaceId: workspace._id,
      host: domainHost,
      type: "subdomain",
      status: "pending",
      isPrimary: true,
      sslStatus: "pending",
    });
    result.domain = { status: "created" };
    return result;
  }

  if (
    String(existingDomainByHost.workspaceId) === String(workspace._id) &&
    String(existingDomainByHost.tenantId) === String(tenant._id)
  ) {
    result.domain = { status: "reused" };
    return result;
  }

  result.domain = {
    status: "skipped",
    reason: `Domain host already belongs to another workspace: ${domainHost}`,
  };

  return result;
}
