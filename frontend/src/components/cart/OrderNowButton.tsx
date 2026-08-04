"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { buildLoginRedirectUrl } from "@/lib/auth/returnUrl";
import { cn } from "@/lib/cn";
import type { AddToCartInput } from "@/lib/cart/types";

type OrderNowButtonProps = {
  item: Omit<AddToCartInput, "quantity"> & { quantity?: number };
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  variant?: "primary" | "secondary" | "outline";
};

/**
 * Adds the product to the persisted cart first, then routes to checkout
 * (or login with returnUrl=/checkout when the guest is not signed in).
 */
export function OrderNowButton({
  item,
  size = "lg",
  className,
  label = "Order Now",
  variant = "primary",
}: OrderNowButtonProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { hydrated: authHydrated, isAuthenticated } = useCustomerAuth();
  const [pending, setPending] = useState(false);

  function handleClick() {
    if (pending) {
      return;
    }
    setPending(true);

    addItem({
      ...item,
      quantity: item.quantity ?? 1,
    });

    const checkoutPath = "/checkout";

    if (authHydrated && !isAuthenticated) {
      router.push(buildLoginRedirectUrl(checkoutPath));
      return;
    }

    // Auth still loading: go to checkout; CheckoutForm prompts login if needed
    // with the cart already persisted.
    router.push(checkoutPath);
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn(className)}
      onClick={handleClick}
      disabled={pending}
      aria-label={`${label}: ${item.name}`}
    >
      {pending ? "Continuing…" : label}
    </Button>
  );
}
