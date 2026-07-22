"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminNotifications } from "@/components/layout/AdminNotificationsProvider";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  badgeKey?: "customCakes" | "activeOrders";
  match?: (pathname: string) => boolean;
};

const ordersNav: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    match: (pathname) => pathname === "/dashboard",
  },
  {
    href: "/dashboard/orders/custom-cakes",
    label: "Custom cakes",
    badgeKey: "customCakes",
    match: (p) => p.startsWith("/dashboard/orders/custom-cakes"),
  },
  {
    href: "/dashboard/orders",
    label: "Active orders",
    badgeKey: "activeOrders",
    match: (p) =>
      p === "/dashboard/orders" ||
      (p.startsWith("/dashboard/orders/") &&
        !p.includes("/completed") &&
        !p.includes("/cancelled") &&
        !p.includes("/custom-cakes")),
  },
  {
    href: "/dashboard/orders/completed",
    label: "Completed",
    match: (p) => p.startsWith("/dashboard/orders/completed"),
  },
  {
    href: "/dashboard/orders/cancelled",
    label: "Cancelled",
    match: (p) => p.startsWith("/dashboard/orders/cancelled"),
  },
];

const catalogNav: NavItem[] = [
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/cakes", label: "Cakes" },
  { href: "/dashboard/combo-offers", label: "Combo Offers" },
  { href: "/dashboard/popular-items", label: "Popular Items" },
  { href: "/dashboard/reviews", label: "Reviews" },
  { href: "/dashboard/gallery", label: "Gallery" },
];

const settingsNav: NavItem = {
  href: "/dashboard/settings",
  label: "Settings",
};

function NavLink({
  item,
  pathname,
  badgeCount,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  badgeCount?: number;
  onNavigate?: () => void;
}) {
  const isActive = item.match
    ? item.match(pathname)
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
        isActive
          ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/25"
          : "text-brand-brown hover:bg-brand-pink-light hover:text-brand-primary",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span>{item.label}</span>
      {badgeCount != null && badgeCount > 0 ? (
        <span
          className={cn(
            "inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none",
            isActive
              ? "bg-white text-brand-primary"
              : "bg-brand-primary text-white",
          )}
          aria-label={`${badgeCount} new`}
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      ) : null}
    </Link>
  );
}

type AdminSidebarProps = {
  onNavigate?: () => void;
  onClose?: () => void;
};

export function AdminSidebar({ onNavigate, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { counts } = useAdminNotifications();
  const settingsActive =
    pathname === settingsNav.href ||
    pathname.startsWith(`${settingsNav.href}/`);

  function badgeFor(item: NavItem): number | undefined {
    if (item.badgeKey === "customCakes") {
      return counts.newCustomCakeRequests;
    }
    if (item.badgeKey === "activeOrders") {
      return counts.newActiveOrders;
    }
    return undefined;
  }

  return (
    <aside className="flex h-full min-h-dvh w-full flex-col overflow-hidden border-r border-brand-border/80 bg-gradient-to-b from-brand-pink-lighter to-white">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-brand-border/60 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold tracking-tight text-brand-primary">
            DoughArt
          </p>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.15em] text-brand-muted">
            Admin
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-muted transition-colors hover:border-brand-primary hover:bg-brand-pink-lighter hover:text-brand-primary"
            aria-label="Close menu"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav
        className="flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-3"
        aria-label="Admin navigation"
      >
        <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-brand-muted/80">
          Orders
        </p>
        {ordersNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            badgeCount={badgeFor(item)}
            onNavigate={onNavigate}
          />
        ))}

        <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-brand-muted/80">
          Catalog
        </p>
        {catalogNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="shrink-0 border-t border-brand-border/60 bg-white/80 p-3">
        <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-brand-muted/80">
          Business
        </p>
        <Link
          href={settingsNav.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
            settingsActive
              ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/25"
              : "text-brand-brown hover:bg-brand-pink-light hover:text-brand-primary",
          )}
          aria-current={settingsActive ? "page" : undefined}
        >
          {settingsNav.label}
        </Link>
      </div>
    </aside>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
