"use client";

import { useEffect, useState } from "react";
import type { AdminProfile } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { AdminSidebar } from "./AdminSidebar";
import { LogoutButton } from "./LogoutButton";

type AdminHeaderProps = {
  admin: AdminProfile;
};

export function AdminHeader({ admin }: AdminHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeNav = () => setMobileNavOpen(false);
  const openNav = () => setMobileNavOpen(true);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 overflow-x-hidden border-b border-brand-border/80 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 lg:hidden",
              mobileNavOpen
                ? "border-brand-primary bg-brand-pink-lighter text-brand-primary"
                : "border-brand-border text-brand-brown hover:border-brand-primary hover:bg-brand-pink-lighter",
            )}
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-nav"
            aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => (mobileNavOpen ? closeNav() : openNav())}
          >
            {mobileNavOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
          <div className="min-w-0 lg:hidden">
            <p className="truncate font-display text-sm font-bold text-brand-primary">
              DoughArt
            </p>
            <p className="text-[10px] uppercase tracking-wider text-brand-muted">Admin</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-brand-brown">{admin.name}</p>
            <p className="text-xs text-brand-muted">{admin.email}</p>
          </div>
          <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-brand-pink-light text-sm font-semibold text-brand-primary sm:flex">
            {admin.name.charAt(0).toUpperCase()}
          </span>
          <LogoutButton />
        </div>
      </header>

      <div
        id="admin-mobile-nav"
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileNavOpen}
      >
        <button
          type="button"
          tabIndex={mobileNavOpen ? 0 : -1}
          className={cn(
            "absolute inset-0 bg-brand-brown/25 backdrop-blur-[2px] transition-opacity duration-300",
            mobileNavOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close navigation menu"
          onClick={closeNav}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 h-full w-[min(17rem,85vw)] shadow-2xl shadow-brand-primary/10 transition-transform duration-300 ease-out",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <AdminSidebar onNavigate={closeNav} onClose={closeNav} />
        </div>
      </div>
    </>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
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
