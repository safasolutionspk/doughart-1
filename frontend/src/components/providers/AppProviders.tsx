"use client";

import { CustomerAuthProvider } from "@/components/auth/CustomerAuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>{children}</CartProvider>
    </CustomerAuthProvider>
  );
}
