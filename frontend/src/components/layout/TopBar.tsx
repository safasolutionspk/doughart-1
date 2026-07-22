import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function TopBar() {
  return (
    <div
      className="border-b border-brand-border/40 bg-[#FFF8FA] text-brand-muted"
      aria-label="Store utilities"
    >
      <div className="section-container flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 text-[0.6875rem] sm:py-2 sm:text-xs">
        <p className="flex min-w-0 items-center gap-1.5 font-medium text-brand-brown">
          <LocationIcon className="h-3 w-3 shrink-0 text-brand-primary" />
          <span className="truncate">
            Delivering to {siteConfig.address}
          </span>
        </p>

        <nav
          className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-brand-brown"
          aria-label="Quick links"
        >
          <Link
            href="/my-order"
            className="transition-colors hover:text-brand-primary"
          >
            Track Order
          </Link>
          <span className="hidden h-3 w-px bg-brand-border sm:block" aria-hidden />
          <Link
            href="/contact"
            className="transition-colors hover:text-brand-primary"
          >
            Help &amp; Support
          </Link>
          <span className="hidden h-3 w-px bg-brand-border md:block" aria-hidden />
          <a
            href={siteConfig.phoneHref}
            className="hidden items-center gap-1 transition-colors hover:text-brand-primary md:inline-flex"
          >
            <PhoneIcon className="h-3 w-3 text-brand-primary" />
            {siteConfig.phone}
          </a>
        </nav>
      </div>
    </div>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.5 7-10a7 7 0 10-14 0c0 5.5 7 10 7 10z"
      />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 015 6a2 2 0 012-2z"
      />
    </svg>
  );
}
