import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import type { PaymentMethod } from "../../types/payment";
import { checkOnlineGatewayCredentials, getActiveOnlineGateway } from "./credentials";

const STRUCTURE_ONLY_METHODS: PaymentMethod[] = [
  "online_payment_full",
  "online_payment_advance",
];

export function assertPaymentMethodAllowed(method: PaymentMethod): void {
  if (STRUCTURE_ONLY_METHODS.includes(method)) {
    if (!env.ONLINE_PAYMENTS_ENABLED) {
      throw ApiError.badRequest(
        "Online payment is not available yet. Please choose cash on delivery or bank transfer.",
      );
    }

    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[payment] ${method} order accepted — gateway redirect not implemented; order stays paymentStatus=pending`,
      );
    }
    return;
  }

  if (method !== "online_payment") {
    return;
  }

  if (!env.ONLINE_PAYMENTS_ENABLED) {
    throw ApiError.badRequest(
      "Online payment is not available yet. Please choose cash on delivery or bank transfer.",
    );
  }

  const credentialCheck = checkOnlineGatewayCredentials();
  if (!credentialCheck.ready) {
    const gatewayName =
      credentialCheck.gateway === "jazzcash" ? "JazzCash" : "EasyPaisa";
    throw ApiError.badRequest(
      `Online payment is not available yet (${gatewayName} is not fully configured). Please choose cash on delivery or bank transfer.`,
    );
  }

  const gateway = getActiveOnlineGateway();
  if (process.env.NODE_ENV !== "test") {
    console.warn(
      `[payment] online_payment order accepted (${gateway}) — gateway redirect not implemented; order stays paymentStatus=pending`,
    );
  }
}
