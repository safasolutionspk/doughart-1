import { env } from "../../config/env";
import type { PaymentGateway, PaymentMethod } from "../../types/payment";
import { ApiError } from "../../utils/ApiError";
import {
  checkOnlineGatewayCredentials,
  getActiveOnlineGateway,
} from "./credentials";

export {
  assertOnlineGatewayCredentialsConfigured,
  checkOnlineGatewayCredentials,
  getActiveOnlineGateway,
} from "./credentials";
export { assertPaymentMethodAllowed } from "./guards";

type WebhookGateway = "jazzcash" | "easypaisa";

export function resolveGatewayForMethod(method: PaymentMethod): PaymentGateway {
  switch (method) {
    case "cash_on_delivery":
      return "manual";
    case "bank_transfer":
      return "bank_transfer";
    case "online_payment":
    case "online_payment_full":
    case "online_payment_advance":
      return env.ONLINE_PAYMENTS_ENABLED ? getActiveOnlineGateway() : "manual";
    default:
      return "manual";
  }
}

export function validateProofAttachment(order: {
  paymentMethod: string;
  proofImage?: string;
}): void {
  if (order.paymentMethod !== "bank_transfer") {
    throw ApiError.badRequest(
      "Payment proof upload is only available for bank transfer orders",
    );
  }
}

/**
 * Webhook handler — placeholder only.
 * TODO(PAYMENT-LIVE): Verify gateway signature, match transactionId to order, set paymentStatus=paid.
 * Never mark paid without verified webhook payload.
 */
export async function processPaymentWebhook(
  gateway: WebhookGateway,
  payload: unknown,
): Promise<{ message: string; gateway: WebhookGateway; received: boolean }> {
  if (!env.ONLINE_PAYMENTS_ENABLED) {
    return {
      message: "Online payments are disabled — webhook ignored",
      gateway,
      received: false,
    };
  }

  const credentials = checkOnlineGatewayCredentials();
  if (!credentials.ready) {
    return {
      message: `${gateway} webhook received but gateway credentials are incomplete — no payment status updated`,
      gateway,
      received: false,
    };
  }

  console.info(
    JSON.stringify({
      type: "payment_webhook_placeholder",
      gateway,
      note: "TODO: verify signature and update order paymentStatus",
      hasPayload: payload != null,
    }),
  );

  return {
    message: `${gateway} webhook received (placeholder — payment status not updated until live integration)`,
    gateway,
    received: true,
  };
}
