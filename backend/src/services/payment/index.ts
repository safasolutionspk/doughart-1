import type { PaymentGateway, PaymentMethod } from "../../types/payment";

/**
 * Public checkout is Cash on Delivery only, so every new order resolves to the
 * manual gateway. Legacy method values are still mapped for historical orders.
 */
export function resolveGatewayForMethod(method: PaymentMethod): PaymentGateway {
  if (method === "bank_transfer") {
    return "bank_transfer";
  }
  return "manual";
}
