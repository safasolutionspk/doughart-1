import { type Types } from "mongoose";
import {
  BusinessSettings,
  Cake,
  Category,
  Customer,
  NewsletterSubscriber,
  Order,
  Review,
  Tenant,
  Workspace,
} from "../models";

const DEFAULT_TENANT_SLUG = "sweet-bite";
const DEFAULT_WORKSPACE_SLUG = "sweet-bite";

const MISSING_SCOPE_FILTER = {
  $or: [
    { tenantId: { $exists: false } },
    { tenantId: null },
    { workspaceId: { $exists: false } },
    { workspaceId: null },
  ],
};

interface BackfillModelResult {
  matchedMissing: number;
  modified: number;
  alreadyScoped: number;
}

export interface SaasDefaultBackfillResult {
  tenantSlug: string;
  workspaceSlug: string;
  businessSettings: BackfillModelResult;
  category: BackfillModelResult;
  cake: BackfillModelResult;
  order: BackfillModelResult;
  review: BackfillModelResult;
  newsletterSubscriber: BackfillModelResult;
  customer: BackfillModelResult;
}

type BackfillModel = {
  countDocuments: (...args: any[]) => unknown;
  updateMany: (...args: any[]) => unknown;
};

async function backfillModel(
  model: BackfillModel,
  tenantId: Types.ObjectId,
  workspaceId: Types.ObjectId,
): Promise<BackfillModelResult> {
  const total = Number(await model.countDocuments({}));
  const matchedMissing = Number(await model.countDocuments(MISSING_SCOPE_FILTER));

  if (matchedMissing === 0) {
    return {
      matchedMissing,
      modified: 0,
      alreadyScoped: total,
    };
  }

  const updateResult = (await model.updateMany(MISSING_SCOPE_FILTER, {
    $set: {
      tenantId,
      workspaceId,
    },
  })) as { modifiedCount?: number };

  return {
    matchedMissing,
    modified: Number(updateResult.modifiedCount ?? 0),
    alreadyScoped: total - matchedMissing,
  };
}

export async function backfillDefaultWorkspaceData(): Promise<SaasDefaultBackfillResult> {
  const tenant = await Tenant.findOne({ slug: DEFAULT_TENANT_SLUG });

  if (!tenant) {
    throw new Error(
      "Default tenant/workspace not found. Run `npm run seed:saas` first, then run this backfill again.",
    );
  }

  const workspace = await Workspace.findOne({
    tenantId: tenant._id,
    slug: DEFAULT_WORKSPACE_SLUG,
  });

  if (!workspace) {
    throw new Error(
      "Default tenant/workspace not found. Run `npm run seed:saas` first, then run this backfill again.",
    );
  }

  const tenantId = tenant._id;
  const workspaceId = workspace._id;

  return {
    tenantSlug: DEFAULT_TENANT_SLUG,
    workspaceSlug: DEFAULT_WORKSPACE_SLUG,
    businessSettings: await backfillModel(BusinessSettings, tenantId, workspaceId),
    category: await backfillModel(Category, tenantId, workspaceId),
    cake: await backfillModel(Cake, tenantId, workspaceId),
    order: await backfillModel(Order, tenantId, workspaceId),
    review: await backfillModel(Review, tenantId, workspaceId),
    newsletterSubscriber: await backfillModel(
      NewsletterSubscriber,
      tenantId,
      workspaceId,
    ),
    customer: await backfillModel(Customer, tenantId, workspaceId),
  };
}
