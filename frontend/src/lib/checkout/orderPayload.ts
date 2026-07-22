import { formatPrice } from "@/lib/catalog";
import { getCartSubtotal } from "@/lib/cart/cart";
import type { CartItem } from "@/lib/cart/types";
import type { PaymentMethod, PublicOrderPayload } from "@/lib/api";
import type { CheckoutDraftForm } from "./draft";

export type CheckoutOrderItem = {
  cakeSlug: string;
  quantity: number;
  notes?: string;
};

function cartItemsToOrderItems(cartItems: CartItem[]): CheckoutOrderItem[] {
  return cartItems.map((item) => ({
    cakeSlug: item.cakeSlug,
    quantity: item.quantity,
    notes: item.notes,
  }));
}

function formatCartLines(cartItems: CartItem[]): string {
  return cartItems
    .map((item) => {
      const pricePart =
        item.unitPrice != null
          ? ` @ ${formatPrice(item.unitPrice)}`
          : "";
      const lineTotal =
        item.unitPrice != null
          ? ` = ${formatPrice(item.unitPrice * item.quantity)}`
          : "";
      const notesPart = item.notes?.trim() ? ` — ${item.notes.trim()}` : "";
      return `• ${item.name} × ${item.quantity}${pricePart}${lineTotal}${notesPart}`;
    })
    .join("\n");
}

function buildCartNotesBlock(cartItems: CartItem[]): string {
  const lines = formatCartLines(cartItems);
  const subtotal = getCartSubtotal(cartItems);
  const parts = [`[Cart order]`, lines];
  if (subtotal > 0) {
    parts.push(`Estimated subtotal: ${formatPrice(subtotal)}`);
  }
  return parts.join("\n");
}

function combineNotes(
  formNotes: string,
  extraBlocks: string[],
): string | undefined {
  const combined = [formNotes.trim(), ...extraBlocks.filter(Boolean)]
    .filter(Boolean)
    .join("\n\n");
  return combined || undefined;
}

export function buildOrderPayloadFromCart(
  form: CheckoutDraftForm,
  cartItems: CartItem[],
  paymentMethod: PaymentMethod,
  proofImage?: string,
): PublicOrderPayload {
  const items = cartItemsToOrderItems(cartItems);
  const cartBlock = buildCartNotesBlock(cartItems);

  if (cartItems.length === 1) {
    const item = cartItems[0];
    const quantityNote =
      item.quantity > 1 ? `Requested quantity: ${item.quantity}` : "";
    const notes = combineNotes(form.notes, [
      quantityNote,
      item.notes?.trim() ?? "",
      cartBlock,
    ]);

    return {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      cakeType: item.name,
      flavor: form.flavor.trim() || undefined,
      size: form.size.trim() || undefined,
      message: form.message.trim() || undefined,
      deliveryDate: form.deliveryDate || undefined,
      address: form.address.trim() || undefined,
      notes,
      paymentMethod,
      cakeSlug: item.cakeSlug,
      proofImage,
      items,
    };
  }

  const cakeType =
    cartItems.length > 1
      ? `Cart order (${cartItems.length} items)`
      : cartItems[0]?.name ?? "Cart order";

  return {
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    cakeType,
    flavor: form.flavor.trim() || undefined,
    size: form.size.trim() || undefined,
    message: form.message.trim() || undefined,
    deliveryDate: form.deliveryDate || undefined,
    address: form.address.trim() || undefined,
    notes: combineNotes(form.notes, [cartBlock]),
    paymentMethod,
    proofImage,
    items,
  };
}

export function buildOrderPayloadFromCake(
  form: CheckoutDraftForm,
  cakeName: string,
  cakeSlug: string | undefined,
  paymentMethod: PaymentMethod,
  proofImage?: string,
): PublicOrderPayload {
  return {
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    cakeType: cakeName,
    flavor: form.flavor.trim() || undefined,
    size: form.size.trim() || undefined,
    message: form.message.trim() || undefined,
    deliveryDate: form.deliveryDate || undefined,
    address: form.address.trim() || undefined,
    notes: form.notes.trim() || undefined,
    paymentMethod,
    cakeSlug,
    proofImage,
  };
}
