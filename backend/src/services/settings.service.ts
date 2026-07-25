import { BusinessSettings } from "../models";
import type { RequestTenantContext } from "../types/tenantContext";
import type { PublicSettings } from "../validators/settings.validator";
import type { UpdateSettingsInput } from "../validators/settings.validator";

type SettingsScope = {
  tenantId: string;
  workspaceId: string;
};

const LEGACY_UNSCOPED_FILTER = {
  $or: [
    { tenantId: { $exists: false } },
    { tenantId: null },
    { workspaceId: { $exists: false } },
    { workspaceId: null },
  ],
};

function resolveSettingsScope(
  tenantContext?: RequestTenantContext,
): SettingsScope | null {
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

function buildScopedSettingsFilter(scope: SettingsScope) {
  return {
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
  };
}

function getDefaultSettings(): PublicSettings {
  return {
    businessName: "DoughArt",
    tagline: "Custom Cakes",
    email: "Sweetbitelahore@gmail.com",
    phone: "0327 7707333",
    address: "Main Market Gulberg 2 Lahore",
    whatsapp: "923277707333",
    facebook: "https://www.facebook.com/sweetbitelahore",
    instagram: "https://www.instagram.com/sweetbitelahore/",
    tiktok: "https://www.tiktok.com/@sweetbitelahore",
    deliveryInfo: "Local delivery available. Contact us for pickup times.",
  };
}

function toPublicSettings(doc: {
  businessName: string;
  tagline?: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  heroImage?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  deliveryInfo?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
  };
}): PublicSettings {
  return {
    businessName: doc.businessName,
    tagline: doc.tagline,
    email: doc.email,
    phone: doc.phone,
    address: doc.address,
    logo: doc.logo,
    heroImage: doc.heroImage,
    facebook: doc.facebook ?? doc.socialLinks?.facebook,
    instagram: doc.instagram ?? doc.socialLinks?.instagram,
    tiktok: doc.tiktok,
    whatsapp: doc.whatsapp,
    deliveryInfo: doc.deliveryInfo,
  };
}

export async function getPublicSettings(
  tenantContext?: RequestTenantContext,
): Promise<PublicSettings> {
  const scope = resolveSettingsScope(tenantContext);

  const settings = scope
    ? await BusinessSettings.findOne(buildScopedSettingsFilter(scope)).lean()
    : await BusinessSettings.findOne().lean();

  if (!settings && scope) {
    const legacySettings = await BusinessSettings.findOne(LEGACY_UNSCOPED_FILTER).lean();

    if (legacySettings) {
      return toPublicSettings(legacySettings);
    }
  }

  if (!settings) {
    return getDefaultSettings();
  }

  return toPublicSettings(settings);
}

export async function updateSettings(
  input: UpdateSettingsInput,
  tenantContext?: RequestTenantContext,
) {
  const scope = resolveSettingsScope(tenantContext);
  const scopedFilter = scope ? buildScopedSettingsFilter(scope) : {};

  const existing = scope
    ? await BusinessSettings.findOne(scopedFilter)
    : await BusinessSettings.findOne();

  const legacyUnscoped =
    scope && !existing ? await BusinessSettings.findOne(LEGACY_UNSCOPED_FILTER) : null;

  const baseline = existing ?? legacyUnscoped;
  const defaults = getDefaultSettings();

  const payload = {
    businessName: input.businessName ?? baseline?.businessName ?? defaults.businessName,
    tagline: input.tagline ?? baseline?.tagline ?? defaults.tagline,
    email: input.email ?? baseline?.email ?? defaults.email,
    phone: input.phone ?? baseline?.phone ?? defaults.phone,
    address: input.address ?? baseline?.address ?? defaults.address,
    logo: input.logo !== undefined ? input.logo : baseline?.logo,
    heroImage: input.heroImage !== undefined ? input.heroImage : baseline?.heroImage,
    facebook: input.facebook !== undefined ? input.facebook : baseline?.facebook,
    instagram:
      input.instagram !== undefined ? input.instagram : baseline?.instagram,
    tiktok: input.tiktok !== undefined ? input.tiktok : baseline?.tiktok,
    whatsapp: input.whatsapp !== undefined ? input.whatsapp : baseline?.whatsapp,
    deliveryInfo:
      input.deliveryInfo !== undefined ? input.deliveryInfo : baseline?.deliveryInfo,
  };

  if (legacyUnscoped && scope) {
    const migratedSettings = await BusinessSettings.findByIdAndUpdate(
      legacyUnscoped._id,
      {
        $set: {
          ...payload,
          tenantId: scope.tenantId,
          workspaceId: scope.workspaceId,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!migratedSettings) {
      return getDefaultSettings();
    }

    return toPublicSettings(migratedSettings);
  }

  const settings = await BusinessSettings.findOneAndUpdate(
    scopedFilter,
    {
      $set: payload,
      ...(scope
        ? {
            $setOnInsert: {
              tenantId: scope.tenantId,
              workspaceId: scope.workspaceId,
            },
          }
        : {}),
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  if (!settings) {
    return getDefaultSettings();
  }

  return toPublicSettings(settings);
}
