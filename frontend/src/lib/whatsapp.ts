import { fetchPublicSettings, getWhatsAppDigitsFromSettings } from "@/lib/settings";

const DEFAULT_WHATSAPP_NUMBER = "923046736831";

function getEnvWhatsAppNumber(): string | undefined {
  // Prefer NEXT_PUBLIC_WHATSAPP. Keep NEXT_PUBLIC_WHATSAPP_NUMBER as a documented alias.
  return (
    process.env.NEXT_PUBLIC_WHATSAPP?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()
  );
}

export async function getWhatsAppNumber(): Promise<string> {
  const settings = await fetchPublicSettings();
  const fromSettings = getWhatsAppDigitsFromSettings(settings);
  if (fromSettings) {
    return fromSettings;
  }

  const raw = getEnvWhatsAppNumber();
  if (!raw) {
    return DEFAULT_WHATSAPP_NUMBER;
  }
  const digits = raw.replace(/\D/g, "");
  return digits.length > 0 ? digits : DEFAULT_WHATSAPP_NUMBER;
}

/** Sync fallback for client components that cannot await settings */
export function getWhatsAppNumberSync(): string {
  const raw = getEnvWhatsAppNumber();
  if (!raw) {
    return DEFAULT_WHATSAPP_NUMBER;
  }
  const digits = raw.replace(/\D/g, "");
  return digits.length > 0 ? digits : DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsAppUrl(text: string, phone?: string): string {
  const number = phone ?? getWhatsAppNumberSync();
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppOrderUrl(cakeName: string, phone?: string): string {
  return buildWhatsAppUrl(`Hi! I'd like to order: ${cakeName}`, phone);
}

export function buildWhatsAppOrderConfirmationUrl(
  orderNumber: string,
  cakeName: string,
  finalAmount?: number,
  phone?: string,
): string {
  const priceLine =
    finalAmount != null && finalAmount > 0
      ? ` Estimated total: Rs ${finalAmount.toLocaleString("en-PK", { maximumFractionDigits: 0 })}.`
      : "";
  return buildWhatsAppUrl(
    `Hi! I just placed order ${orderNumber} for "${cakeName}".${priceLine} Could you confirm the details?`,
    phone,
  );
}
