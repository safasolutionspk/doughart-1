import { env } from "../../config/env";
import type { PaymentGateway } from "../../types/payment";

export type GatewayCredentialCheck = {
  gateway: PaymentGateway;
  ready: boolean;
  missingLabels: string[];
};

function jazzcashMissing(): string[] {
  const missing: string[] = [];
  if (!env.JAZZCASH_MERCHANT_ID?.trim()) {
    missing.push("Merchant ID");
  }
  if (!env.JAZZCASH_PASSWORD?.trim()) {
    missing.push("Password / API key");
  }
  if (!env.JAZZCASH_INTEGRITY_SALT?.trim()) {
    missing.push("Integrity salt");
  }
  return missing;
}

function easypaisaMissing(): string[] {
  const missing: string[] = [];
  if (!env.EASYPAISA_STORE_ID?.trim()) {
    missing.push("Store ID");
  }
  if (!env.EASYPAISA_HASH_KEY?.trim()) {
    missing.push("Hash key / secret");
  }
  return missing;
}

export function getActiveOnlineGateway(): "jazzcash" | "easypaisa" {
  return env.ONLINE_PAYMENT_GATEWAY ?? "jazzcash";
}

/** Validates merchant credentials when online payments are enabled. */
export function checkOnlineGatewayCredentials(): GatewayCredentialCheck {
  const gateway = getActiveOnlineGateway();
  const missingLabels =
    gateway === "jazzcash" ? jazzcashMissing() : easypaisaMissing();

  return {
    gateway,
    ready: missingLabels.length === 0,
    missingLabels,
  };
}

export function assertOnlineGatewayCredentialsConfigured(): void {
  const check = checkOnlineGatewayCredentials();

  if (!check.ready) {
    const gatewayName = check.gateway === "jazzcash" ? "JazzCash" : "EasyPaisa";
    throw new Error(
      `${gatewayName} credentials incomplete (${check.missingLabels.join(", ")}). ` +
        "Set all required env vars or disable ONLINE_PAYMENTS_ENABLED.",
    );
  }
}
