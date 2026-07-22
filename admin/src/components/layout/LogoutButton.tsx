"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={cn(
        "rounded-full border border-brand-border bg-white px-4 py-1.5 text-sm font-medium text-brand-brown",
        "transition-all duration-300 hover:border-brand-primary hover:bg-brand-pink-lighter hover:text-brand-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {isLoading ? "Signing out…" : "Sign out"}
    </button>
  );
}
